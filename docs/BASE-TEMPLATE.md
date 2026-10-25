# Yanzen E-Farmer · Botanical Minimal Base Template

Status: **v1.1 (shared daily shell and legacy primitive compatibility)**. This is Yanzen's own reusable UI foundation, **not** a copied dashboard starter.

## Sources of truth

| Concern | Canonical file |
| --- | --- |
| Brand colours, radii, spacing, typography | `src/app/tokens.css` |
| Shared UI CSS | `src/app/farm-template.css` |
| React primitives | `src/components/farm-template.tsx` |
| Visual reference | `src/app/design-system/page.tsx` |
| Existing compatibility CSS | `src/app/globals.css` and `src/app/components.css` |

Do not create new versions of the same button, card, page title, input or tag in feature files. Prefer existing `FarmActionLink`, `FarmButton`, `FarmPageTemplate`, `FarmSurface`, `FarmSectionTitle`, `FarmStat`, `FarmTag`, `FarmTextField`, `FarmEmpty`, and `FarmTable`.

## Core application rules

- **Do not change the daily navigation**: Beranda, Lahan, Catat, Bon, Laporan. Additional modules remain discoverable from Additional.
- Preserve Supabase Auth, Row Level Security, server-side validation, ledger immutability, all production API contracts and receipt printing.
- **No seeded fake data on operational pages**. Design-system reference examples are explanatory only and never create database transactions.
- Avoid cross-page CSS selectors, `!important`, duplicated colour hex values, or overriding legacy `farm-*` styles without migration tests.
- Use CSS tokens (`--farmer-color-*`, `--farmer-space-*`, `--farmer-radius-*`) and component variants for coherent styling.
- One primary action per section. Keep first-level navigation limited. Responsive mobile layouts must remain easy to tap with one hand.

## Example page

```tsx
import {FarmPageTemplate,FarmActionLink,FarmSurface,FarmSectionTitle}
  from "@/components/farm-template";

export default function ExamplePage() {
  return (
    <FarmPageTemplate
      eyebrow="Additional / Operasional"
      title="Riwayat operasional"
      subtitle="Data asli dari usaha aktif."
      backHref="/additional"
      actions={<FarmActionLink href="/catat">+ Catat aktivitas</FarmActionLink>}
    >
      <FarmSurface>
        <FarmSectionTitle title="Riwayat" subtitle="Paling baru terlebih dahulu." />
        {/* Insert authorized, server-validated business data here. */}
      </FarmSurface>
    </FarmPageTemplate>
  );
}
```

## Quality gate on every template migration

1. TypeScript: `npm run typecheck`
2. Lint: `npm run lint`
3. Database invariants: `npm test`
4. Browser interactions: `npm run test:ui`
5. Production compilation: `npm run build`
6. Verify protected routes redirect anonymously and pages render after real authentication.
7. Check 360–430px mobile widths, tablet and desktop, long Rupiah values, empty states, validation, print layout and keyboard focus.
8. Run axe-core / WCAG 2.2 AA audit and screenshot visual regression before certifying production readiness.

## Dependency migration (not installed by this base-template commit)

The foundational components are intentionally dependency-free to minimize regression risk. The recommended follow-up is a staged migration to shadcn/ui, Base UI, Lucide React, React Hook Form + Zod, Sonner, TanStack Table and automated accessibility checks, with package-lock committed for each tested installation.

Do **not** install an entire starter repository over the existing application. Adapt patterns selectively while retaining the code and database as the system of record.

## UI consistency update · 25 October 2026

- Daily workspace views, budget list/new project, finance, new receipts, agriculture, harvest and insights use the shared page template.
- A shared account bar exposes POST sign-out on internal pages, handles pending and failure states, and is hidden on public/auth pages and in print.
- Legacy `farm-button` and `farm-input` classes share template sizing and typography. Existing Tailwind layout utilities remain supported; Tailwind has not been removed.
- Shared navigation, feature cards, project cards and the home receipt banner use semantic CSS classes. Muted copy uses the canonical contrast token.
- UI tests require built CSS and exercise 360, 390, 430, 768 and 1280px widths, daily views and logout failure recovery alongside the existing transaction flows.
- UI tests use isolated fixture data, not production sessions. Real authenticated production sign-out must be verified separately.
