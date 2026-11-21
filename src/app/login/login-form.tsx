"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ lanHttpOrigin }: { lanHttpOrigin: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!window.isSecureContext && window.location.origin !== lanHttpOrigin) {
      setMessage("Alamat ini masih memakai HTTP. Buka game melalui HTTPS untuk masuk dari PC lain.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const error = result && typeof result === "object" && "error" in result &&
          typeof result.error === "string" ? result.error : "Permintaan autentikasi gagal.";
        setMessage(error);
        return;
      }
      const session = await fetch("/api/auth/session", { cache: "no-store" });
      if (!session.ok) {
        setMessage("Sesi belum bisa dibuka. Izinkan cookie untuk situs ini, lalu coba masuk kembali.");
        return;
      }
      router.replace("/game");
      router.refresh();
    } catch (error) {
      console.error("Local authentication request failed:", error);
      setMessage("Layanan autentikasi lokal tidak dapat dihubungi.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="yzg-auth-page">
    <section className="yzg-auth-card">
      <h1>YZ <span>Farm Life</span></h1>
      <p>{mode === "login" ? "Masuk untuk melanjutkan progres game." : "Buat akun lokal untuk menyimpan progres game."}</p>
      <form onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required maxLength={254}
          value={email} onChange={event => setEmail(event.target.value)} />
        <label htmlFor="password">Kata sandi</label>
        <input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"}
          required minLength={8} maxLength={128} value={password}
          onChange={event => setPassword(event.target.value)} />
        <button type="submit" disabled={busy}>{busy ? "Memproses..." : mode === "login" ? "Masuk" : "Buat akun"}</button>
      </form>
      {message && <p className="yzg-auth-message" role="alert">{message}</p>}
      <button className="yzg-auth-toggle" type="button" disabled={busy}
        onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>
        {mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
      </button>
      <small>Akun dan progres disimpan di server PostgreSQL ini.</small>
    </section>
  </main>;
}
