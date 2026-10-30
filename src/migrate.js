// 幂等 schema 迁移：进程内只跑一次，兼容旧库升级。
// 新装库直接用 schema.sql 建表；旧库在这里补列/重建。
let done = null;

export function ensureSchema(env) {
  if (!done) done = run(env).catch((e) => { done = null; throw e; });
  return done;
}

async function run(env) {
  const devCols = await tableCols(env, 'devices');
  const dev = (n) => devCols.includes(n);
  if (!dev('group')) await alter(env, 'ALTER TABLE devices ADD COLUMN group_name TEXT NOT NULL DEFAULT \'\'');
  if (!dev('ban')) await alter(env, `ALTER TABLE devices ADD COLUMN ban TEXT NOT NULL DEFAULT ''`);
  if (!dev('sites')) await alter(env, `ALTER TABLE devices ADD COLUMN sites TEXT NOT NULL DEFAULT ''`);
  if (!dev('unlock_req')) await alter(env, `ALTER TABLE devices ADD COLUMN unlock_req TEXT NOT NULL DEFAULT ''`);
  if (!dev('hits_total')) await alter(env, 'ALTER TABLE devices ADD COLUMN hits_total INTEGER NOT NULL DEFAULT 0');
  if (!dev('hits')) await alter(env, `ALTER TABLE devices ADD COLUMN hits TEXT NOT NULL DEFAULT ''`);

  // 旧 commands 表有 type CHECK 约束，无法加新指令类型：重建为无约束版本。
  const master = await env.DB.prepare(
    `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'commands'`
  ).first();
  if (master && /CHECK\s*\(/i.test(master.sql || '')) {
    await env.DB.batch([
      env.DB.prepare(`CREATE TABLE commands_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        type TEXT NOT NULL,
        arg TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        result TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      )`),
      env.DB.prepare(`INSERT INTO commands_new
        (id, device_id, type, arg, status, result, created_at, updated_at)
        SELECT id, device_id, type, arg, status, result, created_at, updated_at FROM commands`),
      env.DB.prepare('DROP TABLE commands'),
      env.DB.prepare('ALTER TABLE commands_new RENAME TO commands'),
      env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_commands_device_status
        ON commands (device_id, status, id)`),
    ]);
  }

  const preset = (key, val) => env.DB.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO NOTHING`
  ).bind(key, val);
  await env.DB.batch([
    preset('blockpage_site_html', defaultBlockPage('该网站已被教师封禁', '此网站已被教师加入封禁列表，如需访问请联系老师解除。')),
    preset('blockpage_browser_html', defaultBlockPage('您已被教师禁止使用浏览器', '教师已禁止在这台电脑上使用浏览器，如需使用请联系老师。')),
  ]);
}

async function tableCols(env, table) {
  const r = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
  return (r.results || []).map((c) => c.name);
}

async function alter(env, sql) {
  try { await env.DB.prepare(sql).run(); } catch (e) {
    if (!/duplicate column|already exists/i.test(String(e && e.message))) throw e;
  }
}

function esc(s) { return String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m])); }

export function defaultBlockPage(title, sub) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0e1524;
color:#e8edf7;font:16px/1.7 "Segoe UI","Microsoft YaHei",system-ui,sans-serif;text-align:center}
.box{padding:48px 40px;max-width:560px}
.lock{font-size:64px;line-height:1}
h1{font-size:26px;margin:22px 0 10px}
p{color:#8b98b0;font-size:15px;margin:0}
</style></head><body><div class="box">
<div class="lock"><svg width="56" height="56" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" fill="#e8edf7"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#e8edf7" stroke-width="2" fill="none"/></svg></div>
<h1>${esc(title)}</h1>
<p>${esc(sub)}</p>
</div></body></html>`;
}
