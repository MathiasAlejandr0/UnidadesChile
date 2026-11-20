import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { officialAdmin } from "../lib/adminCredentials";
import { Logo } from "../components/Logo";
import { getAdminRecord, saveAdminUser } from "../store/repo";
import { adminLogin } from "../lib/adminApi";
import { hashPassword, isAdminSession, openAdminSession } from "../store/adminAuth";

export function AdminLogin() {
  const navigate = useNavigate();
  const official = officialAdmin();
  // Con usuario VITE siempre hay modo login (auth real en /api/admin/login).
  const [mode, setMode] = useState<"login" | "setup" | "loading">(
    official ? "login" : "loading",
  );
  const [user, setUser] = useState(official?.user ?? "admin");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const creds = officialAdmin();
    if (creds) {
      setMode("login");
      setUser(creds.user);
      return;
    }
    void getAdminRecord().then((rec) => {
      setMode(rec ? "login" : "setup");
      if (rec?.user) setUser(rec.user);
    });
  }, []);

  if (isAdminSession()) return <Navigate to="/admin" replace />;

  return (
    <div className="grid min-h-dvh place-items-center bg-black px-4 py-10">
      <form
        className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-[#111] p-6 sm:p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          if (mode === "loading") return;

          if (mode === "setup") {
            if (official) return;
            if (password.length < 8) {
              setError("Usa al menos 8 caracteres.");
              return;
            }
            if (password !== confirm) {
              setError("Las contraseñas no coinciden.");
              return;
            }
            const passwordHash = await hashPassword(password);
            await saveAdminUser({ user: user.trim() || "admin", passwordHash });
            await openAdminSession();
            navigate("/admin", { replace: true });
            return;
          }

          // Producción / oficial: solo API (cookie HttpOnly + ADMIN_SESSION_SECRET).
          if (official) {
            try {
              await adminLogin(user, password);
              await openAdminSession();
              navigate("/admin", { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Usuario o contraseña incorrectos.");
            }
            return;
          }

          const passwordHash = await hashPassword(password);
          const rec = await getAdminRecord();
          if (!rec) {
            setMode("setup");
            return;
          }
          const ok =
            "passwordHash" in rec
              ? rec.passwordHash === passwordHash
              : rec.legacyPassword === password;
          if (!ok || user !== rec.user) {
            setError("Usuario o contraseña incorrectos.");
            return;
          }
          if ("legacyPassword" in rec) {
            await saveAdminUser({ user: rec.user, passwordHash });
          }
          await openAdminSession();
          navigate("/admin", { replace: true });
        }}
      >
        <Logo />
        <h1 className="mt-6 text-2xl font-bold">
          {mode === "setup" ? "Crear acceso del panel" : "Entrar al panel"}
        </h1>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <label className="mt-6 block text-sm text-white/70">
          Usuario
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="mt-4 block text-sm text-white/70">
          Contraseña
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {mode === "setup" ? (
          <label className="mt-4 block text-sm text-white/70">
            Confirmar
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black px-3 py-2"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
        ) : null}
        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-white py-2.5 font-semibold text-black"
        >
          {mode === "setup" ? "Crear acceso" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
