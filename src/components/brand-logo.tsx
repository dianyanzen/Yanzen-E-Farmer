import Image from "next/image";
import Link from "next/link";

type Props = { href?: string; dark?: boolean; className?: string; compact?: boolean };
/** Canonical YZ brand lockup for landing, authentication and signed-in pages. */
export default function BrandLogo({href="/",dark=false,className="",compact=false}: Props) {
  return (
    <Link href={href} aria-label="Yanzen E-Farmer — Beranda" className={["farm-brand-lockup",dark?"farm-brand-lockup--inverse":"",compact?"farm-brand-lockup--compact":"",className].filter(Boolean).join(" ")}>
      <Image src="/brand/yz-app-192.png" alt="" width={44} height={44} className="farm-brand-icon" priority />
      <span aria-hidden="true" className="farm-brand-wordmark">Yanzen <span>E-Farmer</span></span>
    </Link>
  );
}
