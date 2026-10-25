import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import Link from "next/link";

type Tone = "primary" | "secondary" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";
const join = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(" ");
const actionClass = (tone: Tone, size: Size, className?: string) =>
  join("farmer-ui-action", `farmer-ui-action--${tone}`, `farmer-ui-action--${size}`, className);

export function FarmButton({
  tone = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: Size }) {
  return <button type={type} className={actionClass(tone, size, className)} {...props} />;
}

export function FarmActionLink({
  href,
  tone = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  tone?: Tone;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return <Link href={href} className={actionClass(tone, size, className)}>{children}</Link>;
}

export function FarmSurface({
  children,
  className,
  flush = false,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode; flush?: boolean }) {
  return <section className={join("farmer-ui-surface", flush && "farmer-ui-surface--flush", className)} {...props}>{children}</section>;
}

export function FarmEyebrow({ children }: { children: ReactNode }) {
  return <p className="farmer-ui-eyebrow">{children}</p>;
}

export function FarmPageTemplate({
  title,
  subtitle,
  eyebrow,
  backHref,
  backLabel = "Kembali",
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return <main className={join("farm-page", "farmer-ui-page", className)}>
    {backHref && <nav aria-label="Navigasi halaman" className="farmer-ui-back"><Link href={backHref}>← {backLabel}</Link></nav>}
    <header className="farmer-ui-page-header">
      <div className="farmer-ui-page-heading">
        {eyebrow && <FarmEyebrow>{eyebrow}</FarmEyebrow>}
        <h1 className="farmer-ui-title">{title}</h1>
        {subtitle && <p className="farmer-ui-description">{subtitle}</p>}
      </div>
      {actions && <div className="farmer-ui-actions">{actions}</div>}
    </header>
    {children}
  </main>;
}

export function FarmSectionTitle({ title, subtitle, right }: {
  title: string; subtitle?: string; right?: ReactNode;
}) {
  return <div className="farmer-ui-section-header">
    <div><h2 className="farmer-ui-section-title">{title}</h2>{subtitle && <p className="farmer-ui-muted">{subtitle}</p>}</div>
    {right}
  </div>;
}

export function FarmStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return <div className="farmer-ui-stat">
    <span className="farmer-ui-stat-label">{label}</span>
    <strong className="farmer-ui-stat-value">{value}</strong>
    {hint && <span className="farmer-ui-stat-hint">{hint}</span>}
  </div>;
}

export function FarmTag({
  children,
  tone = "neutral",
}: { children: ReactNode; tone?: "neutral" | "positive" | "warning" | "negative" }) {
  return <span className={`farmer-ui-tag farmer-ui-tag--${tone}`}>{children}</span>;
}

export function FarmTextField({
  label,
  id,
  hint,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return <div className="farmer-ui-field">
    <label htmlFor={id} className="farmer-ui-field-label">{label}{props.required && <span aria-hidden="true"> *</span>}</label>
    <input id={id} className="farmer-ui-field-input" aria-invalid={!!error || undefined}
      aria-describedby={join(hintId, errorId) || undefined} {...props} />
    {hint && <small id={hintId} className="farmer-ui-field-hint">{hint}</small>}
    {error && <small id={errorId} role="alert" className="farmer-ui-field-error">{error}</small>}
  </div>;
}

export function FarmEmpty({
  title,
  description,
  action,
}: { title: string; description: string; action?: ReactNode }) {
  return <section className="farmer-ui-empty">
    <div className="farmer-ui-empty-symbol" aria-hidden="true">✳</div>
    <h3 className="farmer-ui-empty-title">{title}</h3>
    <p className="farmer-ui-muted">{description}</p>
    {action && <div className="farmer-ui-empty-action">{action}</div>}
  </section>;
}

export function FarmTable({ children, caption }: { children: ReactNode; caption?: string }) {
  return <div className="farmer-ui-table-scroll" role="region" aria-label={caption || "Tabel data"} tabIndex={0}>
    <table className="farmer-ui-table">{caption && <caption>{caption}</caption>}{children}</table>
  </div>;
}
