import { handleDevice } from './device.js';
import { handleAdmin, servePanel } from './admin.js';
import { ensureSchema } from './migrate.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

async function serveBlockPage(env, which) {
  const key = which === 'browser' ? 'blockpage_browser_html' : 'blockpage_site_html';
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first();
  const html = (row && row.value) || '<h1>拦截页未配置</h1>';
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    try {
      await ensureSchema(env);
      if (path === '/api/device' && request.method === 'POST') {
        return await handleDevice(request, env, url);
      }
      if (path.startsWith('/api/admin')) {
        return await handleAdmin(request, env, path, url);
      }
      if (path === '/' || path === '/panel') {
        return await servePanel(request, env);
      }
      if (path === '/blockpage/site') {
        return await serveBlockPage(env, 'site');
      }
      if (path === '/blockpage/browser') {
        return await serveBlockPage(env, 'browser');
      }
      if (path === '/health') {
        return json({ ok: true, ts: Date.now() });
      }
      return json({ error: 'not found' }, 404);
    } catch (e) {
      console.error('unhandled', e);
      return json({ error: String((e && e.message) || e) }, 500);
    }
  },
};
