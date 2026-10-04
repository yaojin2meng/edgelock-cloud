import {
  json, readBody, hashPassword, verifyPassword,
  createSession, currentSession, sessionCookie, clearCookie,
} from './auth.js';
import { panelHTML } from './panel.js';

export async function servePanel(request, env) {
  const sess = await currentSession(request, env);
  const secure = request.url.startsWith('https://');
  if (!sess) {
    return new Response(loginHTML(), {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }
  return new Response(panelHTML(sess.username), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function handleAdmin(request, env, path, url) {
  const action = path.slice('/api/admin/'.length);
  const secure = request.url.startsWith('https://');

  if (request.method === 'GET') {
    if (action === 'need-setup') {
      const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM admin').first();
      return json({ need_setup: row.n === 0 });
    }
    if (action === 'logout') {
      const sess = await currentSession(request, env);
      if (sess) {
        await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(sess.token).run();
      }
      return json({ ok: true }, 200, { 'set-cookie': clearCookie(secure) });
    }
    const sess = await currentSession(request, env);
    if (!sess) return json({ error: 'unauthorized' }, 401);
    if (action === 'overview') return await overview(env);
    if (action === 'stats') return await stats(env);
    return json({ error: 'not found' }, 404);
  }

  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405);
  const body = await readBody(request);

  if (action === 'setup') {
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM admin').first();
    if (row.n > 0) return json({ error: 'already initialized' }, 409);
    const username = str(body.username, 64);
    const password = String(body.password || '');
    if (!username || password.length < 4) {
      return json({ error: '用户名或密码太短（密码至少4位）' }, 400);
    }
    await env.DB.prepare(
      'INSERT INTO admin (username, password_hash) VALUES (?, ?)'
    ).bind(username, await hashPassword(password)).run();
    const token = await createSession(env, username);
    return json({ ok: true }, 200, { 'set-cookie': sessionCookie(token, secure) });
  }

  if (action === 'login') {
    const username = str(body.username, 64);
    const password = String(body.password || '');
    const row = await env.DB.prepare(
      'SELECT password_hash FROM admin WHERE username = ?'
    ).bind(username).first();
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return json({ error: '用户名或密码错误' }, 401);
    }
    const token = await createSession(env, username);
    return json({ ok: true }, 200, { 'set-cookie': sessionCookie(token, secure) });
  }

  const sess = await currentSession(request, env);
  if (!sess) return json({ error: 'unauthorized' }, 401);

  if (action === 'command') {
    return await addCommand(env, body);
  }
  if (action === 'password') {
    const pw = String(body.password || '').trim();
    if (!/^\d{4,16}$/.test(pw)) return json({ error: '密码须为4-16位数字' }, 400);
    await env.DB.prepare(
      `UPDATE settings SET value = ? WHERE key = 'unlock_password'`
    ).bind(pw).run();
    return json({ ok: true });
  }
  if (action === 'update') {
    const latest = str(body.latest, 32).trim();
    const url = str(body.url, 512).trim();
    const sha = str(body.sha256, 128).trim();
    if (!latest && !url) {
      await env.DB.batch([
        env.DB.prepare(`UPDATE settings SET value = '' WHERE key IN ('latest_version','update_url','update_sha256')`),
      ]);
      return json({ ok: true, cleared: true });
    }
    if (!/^\d+(\.\d+){0,3}$/.test(latest)) return json({ error: '版本号须形如 1.2.0' }, 400);
    if (!/^https?:\/\//.test(url)) return json({ error: '下载地址须为 http(s) URL' }, 400);
    if (sha && !/^[0-9a-fA-F]{64}$/.test(sha)) return json({ error: 'SHA256 须为64位十六进制' }, 400);
    const upsert = (key, val) => env.DB.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).bind(key, val);
    await env.DB.batch([
      upsert('latest_version', latest),
      upsert('update_url', url),
      upsert('update_sha256', sha),
    ]);
    return json({ ok: true });
  }
  if (action === 'account') {
    const password = String(body.password || '');
    if (password.length < 4) return json({ error: '密码至少4位' }, 400);
    const newUsername = str(body.username, 64) || sess.username;
    await env.DB.prepare(
      'UPDATE admin SET username = ?, password_hash = ? WHERE username = ?'
    ).bind(newUsername, await hashPassword(password), sess.username).run();
    await env.DB.prepare(
      'UPDATE sessions SET username = ? WHERE username = ?'
    ).bind(newUsername, sess.username).run();
    return json({ ok: true });
  }
  if (action === 'note') {
    const deviceId = str(body.device_id, 64);
    const note = str(body.note, 200);
    if (!deviceId) return json({ error: 'device_id required' }, 400);
    await env.DB.prepare('UPDATE devices SET note = ? WHERE device_id = ?')
      .bind(note, deviceId).run();
    return json({ ok: true });
  }
  if (action === 'logout') {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(sess.token).run();
    return json({ ok: true }, 200, { 'set-cookie': clearCookie(secure) });
  }
  return json({ error: 'not found' }, 404);
}

async function overview(env) {
  const onlineAfter = 90;
  const now = Math.floor(Date.now() / 1000);
  const devices = await env.DB.prepare(
    `SELECT device_id, hostname, status, version, os, note, last_seen, first_seen, last_ip, region
     FROM devices ORDER BY last_seen DESC LIMIT 500`
  ).all();
  const commands = await env.DB.prepare(
    `SELECT id, device_id, type, arg, status, result, created_at, updated_at
     FROM commands ORDER BY id DESC LIMIT 100`
  ).all();
  const pw = await env.DB.prepare(
    `SELECT value FROM settings WHERE key = 'unlock_password'`
  ).first();
  const upd = await env.DB.prepare(
    `SELECT key, value FROM settings WHERE key IN ('latest_version','update_url','update_sha256')`
  ).all();
  const us = {};
  for (const row of upd.results || []) us[row.key] = row.value;
  return json({
    now,
    online_after: onlineAfter,
    devices: (devices.results || []).map((d) => ({
      ...d,
      online: d.last_seen >= now - onlineAfter,
    })),
    commands: commands.results || [],
    password: pw ? pw.value : '9178',
    update: {
      latest: us.latest_version || '',
      url: us.update_url || '',
      sha256: us.update_sha256 || '',
    },
  });
}

// stats 统计：当前在线/历史总在线(去重设备数)/累计上报、地区分布、时段分布、IP 清单。
async function stats(env) {
  const onlineAfter = 90;
  const now = Math.floor(Date.now() / 1000);
  const today = new Date(now * 1000).toISOString().slice(0, 10);

  const cur = await env.DB.prepare(
    `SELECT
       COUNT(*) AS total_devices,
       SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) AS online_now,
       SUM(CASE WHEN first_seen > 0 AND date(first_seen, 'unixepoch') <= ? THEN 1 ELSE 0 END) AS ever_online_before
     FROM devices`
  ).bind(now - onlineAfter, today).first();

  const reports = await env.DB.prepare(
    `SELECT COUNT(*) AS total_reports,
            SUM(CASE WHEN day = ? THEN reports ELSE 0 END) AS reports_today
     FROM presence`
  ).bind(today).first();

  const activeDays = await env.DB.prepare(
    `SELECT COUNT(DISTINCT day) AS active_days FROM presence`
  ).first();

  const regions = await env.DB.prepare(
    `SELECT CASE WHEN region = '' THEN '未知' ELSE region END AS region,
            COUNT(*) AS n,
            SUM(CASE WHEN last_seen >= ? THEN 1 ELSE 0 END) AS online
     FROM devices GROUP BY 1 ORDER BY n DESC LIMIT 50`
  ).bind(now - onlineAfter).all();

  // 近14天每日去重在线设备数
  const daily = await env.DB.prepare(
    `SELECT day, COUNT(DISTINCT device_id) AS devices, SUM(reports) AS reports
     FROM presence WHERE day >= date(?, '-13 days')
     GROUP BY day ORDER BY day`
  ).bind(today).all();

  // 近24小时每小时上报数（时段分布）
  const hourly = await env.DB.prepare(
    `SELECT strftime('%H', datetime(last_at, 'unixepoch')) AS hour,
            COUNT(DISTINCT device_id) AS devices, SUM(reports) AS reports
     FROM presence WHERE last_at >= ?
     GROUP BY hour ORDER BY hour`
  ).bind(now - 86400).all();

  const ips = await env.DB.prepare(
    `SELECT device_id, hostname, last_ip, region, last_seen
     FROM devices WHERE last_ip <> '' ORDER BY last_seen DESC LIMIT 200`
  ).all();

  return json({
    now,
    online_after: onlineAfter,
    current: {
      online_now: cur.online_now || 0,
      total_devices: cur.total_devices || 0,
      ever_online: cur.ever_online_before || 0,
      reports_total: reports.total_reports || 0,
      reports_today: reports.reports_today || 0,
      active_days: activeDays.active_days || 0,
    },
    regions: regions.results || [],
    daily: daily.results || [],
    hourly: hourly.results || [],
    ips: ips.results || [],
  });
}

async function addCommand(env, body) {
  const type = String(body.type || '');
  if (!['lock', 'restore', 'setpass'].includes(type)) {
    return json({ error: 'type 须为 lock/restore/setpass' }, 400);
  }
  const arg = str(body.arg, 64);
  if (type === 'setpass') {
    if (!/^\d{4,16}$/.test(arg)) return json({ error: '新密码须为4-16位数字' }, 400);
    await env.DB.prepare(
      `UPDATE settings SET value = ? WHERE key = 'unlock_password'`
    ).bind(arg).run();
  }
  const target = String(body.device_id || '');
  let deviceIds = [];
  if (target === '*' || target === 'all') {
    const all = await env.DB.prepare('SELECT device_id FROM devices').all();
    deviceIds = (all.results || []).map((d) => d.device_id);
  } else {
    const dev = await env.DB.prepare(
      'SELECT device_id FROM devices WHERE device_id = ?'
    ).bind(target).first();
    if (!dev) return json({ error: '设备不存在' }, 404);
    deviceIds = [dev.device_id];
  }
  if (deviceIds.length === 0) return json({ error: '没有设备' }, 400);
  const now = Math.floor(Date.now() / 1000);
  const stmt = env.DB.prepare(
    `INSERT INTO commands (device_id, type, arg, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`
  );
  await env.DB.batch(deviceIds.map((id) => stmt.bind(id, type, arg, now, now)));
  return json({ ok: true, count: deviceIds.length });
}

function str(v, max) {
  if (v == null) return '';
  return String(v).slice(0, max);
}

const loginHTML = () => `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>EdgeLock 云控</title><style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;
background:#0b0f14;font:15px/1.6 "Segoe UI",system-ui,sans-serif;color:#d7e0ea}
.card{width:min(360px,92vw);background:#121923;border:1px solid #223047;
border-radius:14px;padding:28px 26px;box-shadow:0 18px 40px rgba(0,0,0,.45)}
h1{margin:0 0 4px;font-size:20px;letter-spacing:.5px}
.sub{color:#7f93ab;font-size:13px;margin-bottom:20px}
label{display:block;font-size:12px;color:#8fa3bb;margin:12px 0 4px}
input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #2a3a52;
background:#0d1420;color:#e7eef7;font-size:14px;outline:none}
input:focus{border-color:#3b82f6}
button{width:100%;margin-top:18px;padding:11px;border:0;border-radius:8px;
background:#2563eb;color:#fff;font-size:15px;cursor:pointer}
button:hover{background:#1d4ed8}
.err{color:#f87171;font-size:13px;min-height:18px;margin-top:10px}
</style></head><body>
<div class="card"><h1>EdgeLock 云控</h1>
<div class="sub" id="sub">管理面板登录</div>
<label>用户名</label><input id="u" autocomplete="username">
<label>密码</label><input id="p" type="password" autocomplete="current-password">
<button id="b">登录</button><div class="err" id="e"></div></div>
<script>
const e=document.getElementById('e'),b=document.getElementById('b');
async function needSetup(){try{const r=await fetch('/api/admin/need-setup');
const j=await r.json();if(j.need_setup){document.getElementById('sub').textContent='首次使用：创建管理员账号';
b.textContent='创建管理员';}}catch(_){}}
async function go(){e.textContent='';b.disabled=true;
try{const setup=b.textContent!=='登录';
const url=setup?'/api/admin/setup':'/api/admin/login';
const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},
body:JSON.stringify({username:u.value,password:p.value})});
const j=await r.json();
if(!r.ok){e.textContent=j.error||('失败 '+r.status);return;}
location.reload();
}catch(x){e.textContent='网络错误: '+x;}finally{b.disabled=false;}}
b.onclick=go;
document.addEventListener('keydown',ev=>{if(ev.key==='Enter')go();});
needSetup();
</script></body></html>`;
