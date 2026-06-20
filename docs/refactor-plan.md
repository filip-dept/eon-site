# Refactor plan (roadmap)

> **Temporary doc** — the migration roadmap. The durable reference is in [architecture](./architecture.md) · [components](./components.md) · [design-system](./design-system.md) · [animation](./animation.md). Archive this when the phases are done.
>
> Goal: move from "it works" to a maintainable, best-practice codebase **without changing the visual result**. Behaviour-preserving, verified in the browser, on the `refactor/tailwind-architecture` branch.

## 1. Where we are today (measured)

| File | Lines | Problem |
|------|------:|---------|
| `components/Tariff/TariffPage.tsx` | **1850** | God-component: hero frame, pinned track, "28 Cent" editorial, breakdown, parallax stories, HEMS stage, AI orb, cards, comparison, data catalogue, ~20 inline icons — all in one client component + one `useEffect`. |
| `components/Tariff/tariff.module.css` | **2679** | One stylesheet for all of the above. |
| `components/Journey/OnboardingModal.tsx` | 750 | Intro wizard (3 steps) + Typewriter + PLZ autocomplete + step machine. |
| `components/Journey/JourneyModal.tsx` | 744 | Checkout wizard (7 steps) — near-duplicate shell/animation of onboarding. |
| `components/Journey/journey.module.css` | 1118 | Shared by **both** modals; mixes shell, steps, fields, buttons. |
| `lib/germanPlz.ts` | 451 | OK, but a blob in `lib`. |

**Systemic issues**
- **No UI primitives** — buttons re-declared in ≥7 places; **~55 inline `<svg>`**; badges/fields copy-pasted.
- **168 hardcoded hex literals** (vs 333 `var()`) — ~⅓ of colours bypass tokens (`#fff`×56, `#262626`×14, a blue `#0075c2`×12 that isn't a token, brand hex hardcoded).
- **Type styles not composed** — every component re-assembles fonts by hand (caused the `clamp()` headline bug).
- **Animation inlined** as imperative GSAP in components (the TariffPage `useEffect` is hundreds of lines).
- **Data + types inlined** (`TARIFFS`, `Tariff`, `HEMS_PINS`, `PRIORITIES`) in views.
- **Dead scaffolding** (`lib/mask.ts`, `lib/parallax.ts`). **No tests, no Storybook, no lint rules.**

**Already good** (keep): `styles/tokens.css`, `lib/gsap.ts` single registration, event-decoupled modals, Lenis/ScrollTrigger setup, `data-*`-driven CSS.

## 2. Phased migration (incremental, low-risk, shippable each step)

0. **Tooling** — install Tailwind + `clsx` + `tailwind-merge` + `tailwind-variants` + `framer-motion` + `date-fns`; wire `tailwind.config.ts` → tokens; PostCSS + `@tailwind` layers; set up the **Figma→tokens sync** + **Figma→SVGR icon sync**, **Storybook**, and `eslint-plugin-tailwindcss` (incl. no-magic-number rule). Build/preview unchanged. *(No visual change.)*
1. **Design system** — split `styles/` (palette/colors/typography/tokens); build the grouped semantic colours + clean type scale **and the full dimension taxonomy** (spacing, radii, shadows, borders, z-index, motion, breakpoints), seeded from Figma; map all into the Tailwind theme. *(No visual change.)* → [design-system.md](./design-system.md)
2. **`ui/` primitives** — `Button` first (replace all 7 sites), then `Badge`, `Card`, `Field`, `Icon` (Figma-sourced), `Text`. Storybook each; delete dead CSS as replaced. → [components.md](./components.md)
3. **Journey extraction** — `JourneyWizard` + `useStepWizard`; both modals configure it; transitions → **Framer Motion** (`AnimatePresence`); styling → Tailwind.
4. **Tariff decomposition** — pull sections out of `TariffPage` one at a time (cards → `TariffCompare` first; then Hero, Breakdown, Hems…); component motion → **Framer Motion**; keep **GSAP `usePinnedTrack`** for the scrubbed track; styling → Tailwind.
5. **Data / types / hooks / forms** — catalogues → `data/`, shared `types/`, animation → `hooks/`; optional `react-hook-form + zod` for the 7-step checkout.
6. **Cross-cutting** — a11y, lazy-loading, responsive pass, Playwright flow tests; delete dead `lib/`.

> The bulk is migrating ~4,400 lines of CSS Modules → Tailwind. Do it **per component as it's touched** (phases 2–4), not a big-bang. Each phase = its own PR with before/after screenshots; `tsc` + lint + the manual preview flow gate it.

## 3. Cross-cutting / the holes to also cover
- **TypeScript**: shared `types/`, no implicit `any`; props typed via the primitives.
- **Accessibility**: focus-trap + return-focus in modals, `aria` labels, consistent `prefers-reduced-motion`, keyboard for slider/segmented control.
- **Performance**: split + memoize the 1850-line component; lazy-load below-the-fold sections (`next/dynamic`) + the heavy modals; audit GSAP cleanup.
- **Responsive**: define breakpoint tokens + a mobile pass per section (today desktop-first with scattered `@media`).
- **Assets**: icon registry; check `.mp4`/`.png` sizes for the Vercel deploy; `next/image` for raster.
- **Eventing**: the DOM `CustomEvent` bus is untyped — wrap in `lib/eventBus.ts` (typed) or move to context.
- **Tooling/tests**: stylelint/eslint (token-only, no inline hex), Vitest for `lib/`/hooks, Playwright for the journey/comparison flows, Storybook for `ui/`.

## 4. Decisions
**Settled:** full refactor (phases 0→6) · Tailwind + clsx/tailwind-merge/tailwind-variants (theme from tokens) · Framer Motion for components + GSAP for the scroll track · type scale via Tailwind `fontSize` + `<Text>` · icons generated from Figma (SVGR) · date-fns · grouped semantic colour tokens + full dimension taxonomy, Figma-sourced.

**Still open:**
- **Eventing:** typed DOM `CustomEvent`s vs React context for journey triggers.
- **Forms:** `react-hook-form + zod` for checkout (Phase 5) or keep hand-rolled validation.
- **Testing depth:** Playwright flows + Storybook for `ui/` (recommended) — add Vitest for `lib/`/hooks too?
- **Icons package scope:** internal `src/ui/Icon` now, promote to `@eon/icons` later — confirm not going monorepo yet.
