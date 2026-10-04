const encoder = new TextEncoder();
const decoder = new TextDecoder();

const SESSION_COOKIE = 'el_session';
const SESSION_TTL = 7 * 24 * 3600;

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

export function readBody(request) {
  return request.json().catch(() => ({}));
}

export function timingSafeEqual(a, b) {
  const ba = encoder.encode(String(a));
  const bb = encoder.encode(String(b));
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

export async function deviceAuth(request, env) {
  const key = env.DEVICE_KEY || '';
  if (!key) return true;
  const got = request.headers.get('x-device-key') || '';
  return timingSafeEqual(got, key);
}

async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key, 256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password, iterations = 150000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, iterations);
  return `pbkdf2$${iterations}$${b64(salt)}$${b64(hash)}`;
}

export async function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations < 1000 || iterations > 1000000) return false;
  try {
    const salt = unb64(parts[2]);
    const expect = unb64(parts[3]);
    const got = await pbkdf2(password, salt, iterations);
    if (got.length !== expect.length) return false;
    let diff = 0;
    for (let i = 0; i < got.length; i++) diff |= got[i] ^ expect[i];
    return diff === 0;
  } catch {
    return false;
  }
}

function b64(u8) {
  let s = '';
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s);
}

function unb64(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomToken() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return b64(b).replace(/[+/=]/g, '').slice(0, 43);
}

export function getCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}

export function sessionCookie(token, secure) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL}` +
    (secure ? '; Secure' : '');
}

export function clearCookie(secure) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` +
    (secure ? '; Secure' : '');
}

export async function currentSession(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const row = await env.DB.prepare(
    'SELECT username, expires_at FROM sessions WHERE token = ?'
  ).bind(token).first();
  if (!row) return null;
  if (row.expires_at * 1000 < Date.now()) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return null;
  }
  return { token, username: row.username };
}

export async function createSession(env, username) {
  const token = randomToken();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  await env.DB.prepare(
    'INSERT INTO sessions (token, username, expires_at) VALUES (?, ?, ?)'
  ).bind(token, username, exp).run();
  return token;
}

export async function requireAdmin(request, env) {
  return (await currentSession(request, env)) != null;
}

export { decoder };
