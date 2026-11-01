---
name: karpathy-guidelines
description: Engineering discipline inspired by Andrej Karpathy's publicly discussed coding principles, adapted for Yanzen E-Farmer.
---
# Karpathy-inspired engineering guidelines

This is a project adaptation, not an official Andrej Karpathy skill. Use these guidelines when planning, implementing, reviewing, and debugging changes.

## 1. Think before coding
- Read the affected code and existing conventions first.
- State the user goal, constraints, assumptions, and acceptance criteria.
- When ambiguous or high risk, ask before modifying behavior.
- Identify data flow, edge cases, and affected modules.

## 2. Simplicity first
- Choose the smallest maintainable solution.
- Prefer existing patterns and dependencies over new abstractions.
- Avoid speculative generalization and unrelated refactors.

## 3. Surgical changes
- Change only what the task requires.
- Preserve existing UI, branding, APIs, data contracts, and unrelated behavior.
- Keep migrations reversible when feasible and review database access controls.

## 4. Goal-driven execution
- Define what success looks like before coding.
- Run relevant lint, typecheck, tests, and build when available.
- Report exactly what was verified, what was not, and any remaining risks.
- Never claim deployment or passing tests without evidence.

## E-Farmer domain guardrails
- Money: use explicit units, currency precision, and reproducible calculations; distinguish revenue, expenses, cash flow, and profit.
- Farming: associate activity, harvest, labor, and cost records with the correct farm, plot, crop cycle, and date.
- Labor: protect wage and advance records from accidental double counting.
- Supabase/PostgreSQL: preserve RLS, permissions, migration safety, and tenant isolation.
- UI: preserve YZ agricultural identity, responsive layout, accessibility, and Indonesian labels.
- Deployment: never modify production secrets or deploy without explicit approval.

## Working checklist
1. Inspect relevant files and identify the current behavior.
2. Explain the minimal plan and potential risks.
3. Implement focused changes.
4. Validate with the available tooling.
5. Summarize changed files, tests, limitations, and rollback guidance.
