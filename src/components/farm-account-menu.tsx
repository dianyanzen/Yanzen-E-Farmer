import Link from "next/link";
import FarmIcon from "@/components/farm-icon";

/** Shared session menu for authenticated screens. Uses the existing server sign-out. */
export default function FarmAccountMenu() {
  return (
    <details className="farmer-account-menu">
      <summary aria-label="Buka menu akun" title="Menu akun">
        <span className="farmer-account-avatar" aria-hidden="true">YE</span>
      </summary>
      <div className="farmer-account-popover" aria-label="Menu akun">
        <p className="farmer-account-caption">Yanzen E-Farmer</p>
        <Link href="/pengaturan">Pengaturan usaha</Link>
        <Link href="/additional">Modul Additional</Link>
        <form action="/auth/signout" method="post">
          <button type="submit" className="farmer-account-signout">
            <FarmIcon name="log-out" size={18} /> Keluar akun
          </button>
        </form>
      </div>
    </details>
  );
}
