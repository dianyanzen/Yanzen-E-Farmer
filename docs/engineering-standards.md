# Engineering Standards — Yanzen E-Farmer

## Source and scope
This project uses a **Karpathy-inspired** engineering reference adapted for its own workflows. It is not represented as an official Andrej Karpathy skill or a verbatim import of third-party material.

Primary reference: [Local SKILL.md](../.agents/skills/karpathy-guidelines/SKILL.md).

## Definition of done
- The requested outcome and affected components are identified.
- Changes are minimal and consistent with the repository's conventions.
- Relevant accounting and farming edge cases are handled.
- Security and data access implications are reviewed.
- Available checks are executed and results reported accurately.
- Production deployment is separately approved and verified.

## Domain review examples
- Harvest quantity, selling price, transport, and sales revenue reconcile.
- Worker headcount, wage category, overtime, and cash advances reconcile.
- Costs belong to the intended plot and crop cycle.
- Farm/plot records cannot leak across unauthorized users.
- Mobile forms remain usable and brand assets remain intact.

## Change report template
Goal; files changed; assumptions; validation performed; risks; deployment status; rollback plan.
