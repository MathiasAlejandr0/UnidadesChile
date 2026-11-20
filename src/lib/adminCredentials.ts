/** Acceso oficial: el usuario público puede ir en VITE; el hash NUNCA va al cliente. */

export type OfficialAdmin = {
  user: string;
  /** Siempre false en builds con hash solo-servidor. */
  hasClientHash: boolean;
};

export function officialAdmin(): OfficialAdmin | null {
  const user = (import.meta.env.VITE_ADMIN_USER ?? "administracion").trim();
  // Intencional: no leemos VITE_ADMIN_PASSWORD_HASH (era forgeable).
  if (!user) return null;
  return { user, hasClientHash: false };
}
