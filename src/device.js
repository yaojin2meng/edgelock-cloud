import { json, readBody, deviceAuth } from './auth.js';
import { expandBan } from './sites.js';

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

  const devRow = await env.DB.prepare(
    'SELECT group_name FROM devices WHERE device_id = ?'
  ).bind(deviceId).first();
  const group = devRow ? devRow.group_name || '' : '';

  const hits = normalizeHits(body.hits);
  await env.DB.prepare(
    `INSERT INTO devices (device_id, hostname, status, version, os, last_seen, first_seen, last_ip, region, ban, sites, unlock_req, hits_total, hits)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(device_id) DO UPDATE SET
       hostname = CASE WHEN excluded.hostname <> '' THEN excluded.hostname ELSE devices.hostname END,
       status = excluded.status,
       version = CASE WHEN excluded.version <> '' THEN excluded.version ELSE devices.version END,
       os = CASE WHEN excluded.os <> '' THEN excluded.os ELSE devices.os END,
       last_seen = excluded.last_seen,
       last_ip = CASE WHEN excluded.last_ip <> '' THEN excluded.last_ip ELSE devices.last_ip END,
       region = CASE WHEN excluded.region <> '' THEN excluded.region ELSE devices.region END,
       ban = excluded.ban,
       sites = excluded.sites,
       unlock_req = excluded.unlock_req,
       hits_total = MAX(devices.hits_total, excluded.hits_total),
       hits = excluded.hits`
  ).bind(deviceId, hostname, status, version, osName, now,
    now, ip, region, normalizeBan(body.ban), clampSites(body.sites),
    str(body.unlockreq, 32), hits.total, hits.recent).run();

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

  // 分组级更新配置优先，回退全局
  const updKeys = ['latest_version', 'update_url', 'update_sha256'];
  if (group) updKeys.push(...[`upd:${group}:latest_version`, `upd:${group}:update_url`, `upd:${group}:update_sha256`]);
  const upd = await env.DB.prepare(
    `SELECT key, value FROM settings WHERE key IN (${updKeys.map(() => '?').join(',')})`
  ).bind(...updKeys).all();
  const us = {};
  for (const row of upd.results || []) us[row.key] = row.value;
  const pick = (k) => (group && us[`upd:${group}:${k}`]) || us[k] || '';

  const ban = await banConfig(env, group);

  return json({
    ok: true,
    server_time: now,
    group,
    latest: pick('latest_version'),
    update_url: pick('update_url'),
    update_sha256: pick('update_sha256'),
    ban,
    commands: cmds.map((c) => ({ id: c.id, type: c.type, arg: c.arg })),
  });
}

// banConfig 取分组封禁配置（含拦截页 HTML），无分组配置回退全局 '' 分组。
async function banConfig(env, group) {
  const keys = group ? [`ban:${group}`, 'ban:'] : ['ban:'];
  const rows = await env.DB.prepare(
    `SELECT key, value FROM settings WHERE key IN (${keys.map(() => '?').join(',')})`
  ).bind(...keys).all();
  let raw = null;
  for (const k of keys) {
    const row = (rows.results || []).find((r) => r.key === k);
    if (row && row.value) { raw = row.value; break; }
  }
  let cfg = {};
  try { cfg = raw ? JSON.parse(raw) : {}; } catch { cfg = {}; }
  const out = expandBan(cfg);
  const pages = await env.DB.prepare(
    `SELECT key, value FROM settings WHERE key IN ('blockpage_site_html','blockpage_browser_html')`
  ).all();
  for (const row of pages.results || []) {
    if (row.key === 'blockpage_site_html') out.page_site = row.value;
    if (row.key === 'blockpage_browser_html') out.page_browser = row.value;
  }
  return out;
}

function normalizeBan(v) {
  return ['site', 'all', 'off'].includes(v) ? v : '';
}

function clampSites(v) {
  let arr = v;
  if (typeof v === 'string') { try { arr = JSON.parse(v); } catch { arr = null; } }
  if (!Array.isArray(arr)) return '';
  const out = arr.slice(0, 8).map((s) => ({
    n: str(s && s.n, 24),
    c: Math.max(1, Math.min(9999, parseInt(s && s.c, 10) || 1)),
    t: str(s && s.t, 120),
  })).filter((s) => s.n);
  return out.length ? JSON.stringify(out) : '';
}

// normalizeHits 校验拦截统计载荷：total 取非负整数，recent 最多 20 条。
function normalizeHits(v) {
  const out = { total: 0, recent: '' };
  if (!v || typeof v !== 'object') return out;
  const total = parseInt(v.total, 10);
  if (Number.isFinite(total) && total >= 0) out.total = Math.min(total, 1e9);
  if (Array.isArray(v.recent)) {
    const now = Math.floor(Date.now() / 1000);
    const arr = v.recent.slice(0, 20).map((h) => ({
      n: str(h && h.n, 32),
      t: Math.min(Math.max(parseInt(h && h.t, 10) || now, now - 86400), now),
    })).filter((h) => h.n);
    if (arr.length) out.recent = JSON.stringify(arr);
  }
  return out;
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
