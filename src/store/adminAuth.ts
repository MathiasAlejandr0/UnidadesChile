const SESSION = "uc-admin-session";

let hydrated = false;
let sessionValid = false;

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Solo para setup local IndexedDB (sin panel server). No usar para auth de producción. */
export async function hashPassword(password: string) {
  return sha256Hex(`uc-pw:${password}`);
}

export function isAuthHydrated() {
  return hydrated;
}

export function isAdminSession() {
  return sessionValid;
}

/** Hidrata contra cookie HttpOnly vía GET /api/admin/login. */
export async function hydrateAdminSession(_unused?: string | null) {
  try {
    const res = await fetch("/api/admin/login", { method: "GET", credentials: "include" });
    sessionValid = res.ok;
    if (sessionValid) sessionStorage.setItem(SESSION, "1");
    else sessionStorage.removeItem(SESSION);
  } catch {
    sessionValid = false;
  }
  hydrated = true;
  return sessionValid;
}

export async function openAdminSession(_marker?: string) {
  sessionStorage.setItem(SESSION, "1");
  sessionValid = true;
  hydrated = true;
}

export function closeAdminSession() {
  sessionStorage.removeItem(SESSION);
  sessionValid = false;
}
