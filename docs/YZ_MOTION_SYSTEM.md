# YZ Motion System — selective rollout

## Scope
First stage intentionally uses **native CSS**, not Motion.dev or Anime.js. The repository already has an accessible motion foundation in `globals.css`. Adding a new animation runtime for a single entry transition would increase bundle and lockfile churn without proportional benefit.

- Applied: home workspace entry transition (220ms, opacity + translateY only).
- Preserved: authentication, data fetching, Supabase policies, form values, modal focus, financial amounts, tables, reports, exports and API behavior.
- Accessibility: `prefers-reduced-motion` disables the transition.
- Performance: only opacity and transform; no layout-affecting height/width animations.
- Not applied: automatic stagger on long tables, fake count-ups, continuous loops, map marker motion.

## Follow-up gate
Evaluate on staging before expanding. If future interactions require enter/exit orchestration or shared-layout transitions, add `motion/react` with its lockfile updated in the same PR and cover it with UI tests. Anime.js is not justified at this stage.

## Verification
1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`
5. `npm run test:ui`
6. Check home on mobile, keyboard navigation and OS reduced-motion setting.
