import { json, readBody, deviceAuth } from './auth.js';

export async function handleDevice(request, env, url) {
  if (!(await deviceAuth(request, env))) {
    return json({ error: 'bad device key' }, 403);
  }
  const body = await readBody(request);
  const action = String(body.action || url.searchParams.get('action') || '');
  switch (action) {
    case 'report':
      return await report(request, env, body);
    case 'result':
      return await result(request, env, body);
    case 'password':
      return await getPassword(env);
    default:
      return json({ error: 'unknown action' }, 400);
  }
}

async function report(request, env, body) {
  const deviceId = str(body.device_id, 64);
  if (!deviceId) return json({ error: 'device_id required' }, 400);
  const hostname = str(body.hostname, 128);
  const status = ['restricted', 'restored', 'unknown'].includes(body.status)
    ? body.status : 'unknown';
  const version = str(body.version, 32);
  const osName = str(body.os, 64);
  const now = Math.floor(Date.now() / 1000);

  const ip = str(request.headers.get('cf-connecting-ip'), 64) ||
    str((request.headers.get('x-forwarded-for') || '').split(',')[0].trim(), 64);
  const cf = request.cf || {};
  const region = [cf.country, cf.region || cf.regionCode, cf.city]
    .filter(Boolean).map(String).join('/').slice(0, 96);

  await env.DB.prepare(
    `INSERT INTO devices (device_id, hostname, status, version, os, last_seen, first_seen, last_ip, region)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(device_id) DO UPDATE SET
       hostname = CASE WHEN excluded.hostname <> '' THEN excluded.hostname ELSE devices.hostname END,
       status = excluded.status,
       version = CASE WHEN excluded.version <> '' THEN excluded.version ELSE devices.version END,
       os = CASE WHEN excluded.os <> '' THEN excluded.os ELSE devices.os END,
       last_seen = excluded.last_seen,
       last_ip = CASE WHEN excluded.last_ip <> '' THEN excluded.last_ip ELSE devices.last_ip END,
       region = CASE WHEN excluded.region <> '' THEN excluded.region ELSE devices.region END`
  ).bind(deviceId, hostname, status, version, osName, now,
    now, ip, region).run();

  const day = new Date(now * 1000).toISOString().slice(0, 10);
  await env.DB.prepare(
    `INSERT INTO presence (device_id, day, first_at, last_at, reports)
     VALUES (?, ?, ?, ?, 1)
     ON CONFLICT(device_id, day) DO UPDATE SET
       last_at = excluded.last_at,
       reports = presence.reports + 1`
  ).bind(deviceId, day, now, now).run();

  const pending = await env.DB.prepare(
    `SELECT id, type, arg FROM commands
     WHERE device_id = ? AND status = 'pending'
     ORDER BY id ASC LIMIT 10`
  ).bind(deviceId).all();

  const cmds = pending.results || [];
  if (cmds.length > 0) {
    const ids = cmds.map((c) => c.id);
    await env.DB.prepare(
      `UPDATE commands SET status = 'delivered', updated_at = ?
       WHERE id IN (${ids.map(() => '?').join(',')})`
    ).bind(now, ...ids).run();
  }

  const upd = await env.DB.prepare(
    `SELECT key, value FROM settings WHERE key IN ('latest_version','update_url','update_sha256')`
  ).all();
  const us = {};
  for (const row of upd.results || []) us[row.key] = row.value;

  return json({
    ok: true,
    server_time: now,
    latest: us.latest_version || '',
    update_url: us.update_url || '',
    update_sha256: us.update_sha256 || '',
    commands: cmds.map((c) => ({ id: c.id, type: c.type, arg: c.arg })),
  });
}

async function result(request, env, body) {
  const commandId = parseInt(body.command_id, 10);
  if (!Number.isFinite(commandId)) return json({ error: 'command_id required' }, 400);
  const ok = !!body.ok;
  const message = str(body.message, 500);
  const now = Math.floor(Date.now() / 1000);

  const cmd = await env.DB.prepare(
    'SELECT id, device_id, type FROM commands WHERE id = ?'
  ).bind(commandId).first();
  if (!cmd) return json({ error: 'command not found' }, 404);

  await env.DB.prepare(
    `UPDATE commands SET status = ?, result = ?, updated_at = ? WHERE id = ?`
  ).bind(ok ? 'done' : 'failed', message, now, commandId).run();

  if (body.device_id) {
    const status = ['restricted', 'restored', 'unknown'].includes(body.status)
      ? body.status : null;
    if (status) {
      await env.DB.prepare(
        'UPDATE devices SET status = ?, last_seen = ? WHERE device_id = ?'
      ).bind(status, now, str(body.device_id, 64)).run();
    }
  }
  return json({ ok: true });
}

async function getPassword(env) {
  const row = await env.DB.prepare(
    `SELECT value FROM settings WHERE key = 'unlock_password'`
  ).first();
  return json({ password: row ? row.value : '9178' });
}

function str(v, max) {
  if (v == null) return '';
  return String(v).slice(0, max);
}
