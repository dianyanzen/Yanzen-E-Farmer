"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import FarmIcon from "./farm-icon";
import { FarmButton } from "./farm-template";

export default function FarmAccountBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/auth")) return null;

  async function signOut(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/auth/signout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed");
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Belum berhasil keluar. Periksa koneksi dan coba lagi.");
      setBusy(false);
    }
  }

  return <div className="farm-account-shell">
    <div className="farm-account-bar">
      <Link href="/home" className="farm-account-brand">Yanzen E-Farmer</Link>
      <form action="/auth/signout" method="post" onSubmit={signOut}>
        <FarmButton type="submit" tone="secondary" disabled={busy} aria-busy={busy}>
          <FarmIcon name="log-out" size={18}/>{busy ? "Keluar…" : "Keluar"}
        </FarmButton>
      </form>
    </div>
    {error && <p role="alert" className="farm-account-error">{error}</p>}
  </div>;
}
