import { handleDevice } from './device.js';
import { handleAdmin, servePanel } from './admin.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    try {
      if (path === '/api/device' && request.method === 'POST') {
        return await handleDevice(request, env, url);
      }
      if (path.startsWith('/api/admin')) {
        return await handleAdmin(request, env, path, url);
      }
      if (path === '/' || path === '/panel') {
        return await servePanel(request, env);
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
