import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function sha256Hex(text) {
  return createHash("sha256").update(text).digest("hex");
}

/** Hash de contraseña: solo env server. VITE_* queda deprecado (no usar en prod). */
export function officialPasswordHash() {
  const server = (process.env.ADMIN_PASSWORD_HASH || "").trim();
  if (server) return server;
  // Compat local: solo si no hay Vercel
  if (!process.env.VERCEL) {
    return (process.env.VITE_ADMIN_PASSWORD_HASH || "").trim();
  }
  return "";
}

export function officialUser() {
  return (
    process.env.ADMIN_USER ||
    process.env.VITE_ADMIN_USER ||
    "administracion"
  ).trim();
}

/**
 * Cookie de sesión: HMAC con secreto solo-servidor.
 * Sin ADMIN_SESSION_SECRET no se acepta login (fail-closed en Vercel).
 */
export function expectedSessionToken() {
  const hash = officialPasswordHash();
  const secret = (process.env.ADMIN_SESSION_SECRET || "").trim();
  if (!hash) return "";
  if (!secret) {
    if (process.env.VERCEL) return "";
    // Dev local: pepper distinto al hash para no igualar el token del cliente viejo
    return sha256Hex(`uc-sess-dev:${hash}`);
  }
  return createHmac("sha256", secret).update(`uc-admin:${hash}`).digest("hex");
}

export function readCookie(cookieHeader, name) {
  if (!cookieHeader) return "";
  const part = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : "";
}

export function isAdminRequest(req) {
  const token = readCookie(req.headers?.cookie, "uc_admin");
  const expected = expectedSessionToken();
  if (!token || !expected) return false;
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function sessionCookie(token) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return `uc_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
}

export function clearSessionCookie() {
  return "uc_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

export function deny(res) {
  return res.status(401).json({ ok: false, error: "No autorizado." });
}
