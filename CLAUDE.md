# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Next.js 16 (App Router) — APIs may differ from your training data.** Heed `AGENTS.md` above: when unsure about a Next.js API, read `node_modules/next/dist/docs/` rather than assuming.

## Commands

- `npm run dev` — dev server at http://localhost:3000 (HMR).
- `npm run build` — production build (this is what Vercel runs; a broken build fails the deploy).
- `npm run lint` — ESLint (`eslint-config-next`).
- **Typecheck:** `./node_modules/.bin/tsc --noEmit` — use the local binary explicitly; bare `tsc` / `npx tsc` may resolve a placeholder package and not actually run.
- **No test framework** is configured. Verification is done by running the dev server and observing behavior in the browser (preview tooling), not by unit tests.
- **Deploy:** push to `main` → Vercel auto-deploys. The pre-ship ritual is: `tsc --noEmit` clean → commit → push.

## Stack

Next.js 16 App Router · React 19 · TypeScript · **Tailwind CSS v4** (migrating off CSS Modules) · **GSAP 3 + ScrollTrigger + CustomEase** · **Framer Motion** (component-level motion) · **Lenis** smooth scroll · **date-fns**. Path alias `@/` → `src/`.

> **Styling migration (see `docs/design-system.md` + `docs/refactor-plan.md`).** Tailwind v4 is wired in `src/app/globals.css` via `@theme inline`, with the design tokens in `styles/` (split: `palette` → `colors` · `typography` · `tokens`) as the single source of truth (utilities like `bg-page`/`text-heading-2` resolve to `var(--bg-page)`/`var(--type-heading-2-size)`). Tailwind's **Preflight reset is intentionally not imported** during the migration so existing CSS-Module components are unaffected; the cascade order is `@layer theme, base, components, utilities`. CSS Modules and Tailwind coexist — components migrate to Tailwind as they're touched, and their `.module.css` is deleted in the same change. Class composition: `clsx` + `tailwind-merge`; component variants: `tailwind-variants`.

## Conventions (target architecture — full detail in `docs/` → start at `docs/README.md`)

The codebase is mid-refactor toward the structure below. **New and changed code follows these rules; migrate areas as you touch them** (and delete the old `.module.css` in the same change).

- **Layering & dependency direction:** `app/` (routes, thin — no logic) → `components/` (feature composites) → `ui/` (dumb primitives) · `hooks/` · `lib/` → `styles/` (tokens). Dependencies point **downward only** — `ui/` never imports a feature; features never import a route. Keep files small (~<200 lines) and **co-located** (component + styles + story + types per folder). Data → `data/`, shared types → `types/`.
- **Tokens only — no magic numbers.** Every colour / spacing / radius / shadow / border / z-index / duration is a token in `styles/`, surfaced as a Tailwind utility (`gap-4 p-card rounded-md shadow-rec text-heading-2 z-modal`). No raw hex/px, no `gap-[14px]` arbitrary escapes (lint-enforced). Tokens are **sourced from Figma** (`scripts/sync-tokens.ts`) — edit at the source, then re-sync.
- **One primitive per UI concept** (`ui/`): `Button` (incl. `iconOnly`) ✅ built, `Icon` (Figma registry — **no inline `<svg>`**), `Text`/`Heading` (the type scale — **never hand-assemble fonts**), `Badge`/`Chip`/`Tag`/`Label` (kept distinct), `Card`, `Input`/`Field`/`Dropdown`, `Slider`, `Toggle`, `SegmentedControl`, `Stepper`, `Price`, `Logo`, `Link`, `Avatar`. Compose these — don't re-style buttons/inputs/cards ad-hoc.
  - **Build primitives with the shared `tv` from `@/ui/tv` and `cn` from `@/lib/cn`** (not `tailwind-variants`/`tailwind-merge` directly). ⚠️ tailwind-merge has no knowledge of our custom theme keys, so it would mis-merge them (drop `text-white` as if it conflicted with the font-size `text-copy-lg`; ignore `rounded-button`). `cn.ts` registers the custom groups via `twMergeConfig`; `tv.ts` wires the same config into tailwind-variants. New custom font-size/radius tokens must be added to `twMergeConfig` in `cn.ts`.
- **Consolidated composites:** AI chat = one **`AiChat`** (`variant: full|bare|voice`, orb on the left) built on **`AiOrb`**; **`ContextBar`** is one shared composite (used by both tariff page + journey via `placement`); the **two journeys share `JourneyWizard`** + `useStepWizard` and only *configure* steps.
- **Animation is a system** (see `docs/animation.md`): **Framer Motion** for component motion (named variants in `lib/motion/`, `<Reveal>`/`<Stagger>` wrappers); **GSAP + ScrollTrigger** only for the pinned scroll track (timelines in `hooks/`, eases in `lib/gsap.ts`); shared **motion tokens**; **one** reduced-motion switch.
- **Branding:** E.ON palette + **EON Brix Sans** (body) / EON Head (display) only — never off-brand values.
- **Naming:** name components for what they *are*, not legacy class names. ⚠️ Don't carry over misleading names — e.g. **`Hems` is wrong** (HEMS is one *product* in the connected-home showcase, alongside Solar/Strom/Wallbox/Wärmepumpe); rename the section (`ConnectedHome`/`EnergyHome`) and treat HEMS as a product entry. Prefer domain/intent names over `orbFloat`/`ctxBar`/`redZone`. See `docs/components.md` › Naming.

## Architecture

### Two routes, one event-driven journey
- `/` (`app/page.tsx`) renders `Hero` + `OnboardingModal`.
- `/tariff` (`app/tariff/page.tsx`) renders `TariffPage` inside `<Suspense>` (it reads `plz`/`persons`/`kwh` search params).

Components are **decoupled via DOM `CustomEvent`s** rather than props/context:
- Hero chat chip → dispatches `eon:journey-start` → `OnboardingModal` (lives on `/`) opens a 3-step flow (priority → PLZ+persons → kWh) → on submit calls `router.push('/tariff?plz=…&persons=…&kwh=…')`.
- Tariff cart button → dispatches `eon:checkout-start` → `JourneyModal` (lives on `/tariff`) opens the checkout wizard.

So the trigger components only dispatch; the modals listen via `addEventListener` in an effect. There are **two distinct modals** that share `journey.module.css`: `OnboardingModal` (the 3-question intro) and `JourneyModal` (checkout wizard).

### Scroll + animation backbone
- `SmoothScroller` (mounted in the root layout) initializes **Lenis with native scroll** — driven by `gsap.ticker`, `lenis.on('scroll', ScrollTrigger.update)`, and exposes `window.lenis`. **There is no transform wrapper** (native window scroll); this is deliberate and load-bearing for `position: sticky`.
- `lib/gsap.ts` is the **single place** plugins are registered and custom eases are created (`eonReveal`, `eonOut`, `eonAppear`). Always import `gsap`/`ScrollTrigger` from `@/lib/gsap`, never from `gsap` directly, or plugins/eases won't be registered.
- `lib/entrance.ts` builds the Hero entrance timeline. `lib/germanPlz.ts` powers the PLZ autocomplete. (`lib/mask.ts`, `lib/parallax.ts` are unused scaffolding from the original plan.)

### `TariffPage.tsx` — the heavy component
A single large client component whose one big `useEffect` builds **many coordinated ScrollTriggers** off a shared master pin (`pinST`). Reading it top-to-bottom, the page is:
1. A **pinned horizontal "frames" track** (`.scrollSection`) scrubbed by `pinST`: tariff-hero frame → editorial "28 Cent" frame (one **travelling headline** that docks into the next frame) → Stromtransparenz breakdown (stacked bars rotate, then morph/expand into columns). Phase boundaries (`phase1()`, `ROT`, `MORPH`) are **function-based** so they re-measure on `ScrollTrigger.refresh()`.
2. `.redZone` — a `position: fixed` gradient backdrop behind `storiesIntro`, the parallax `stories` cards, the **HEMS sticky stage** (scroll-through category selector with image hotspots + scroll-drawn connecting "wires"), then FAQ and proof sections.
3. The **AI chat orb** (`.orbFloat`): `position: fixed`, docks bottom-right once scrolled, **drifts to centre at the breakdown morph** (`orbCentered`), and shares one markup for the condensed pill ↔ open card. It idle-auto-opens (3s of no scrolling) **only while the HEMS category is active**, and compacts again when the FAQ section approaches.

### Design tokens
`src/styles/` is split by concern (source of truth, framework-agnostic; bound to Tailwind utilities by the `@theme inline` block in `globals.css`):
- `palette.css` — raw, non-semantic colour ramps (`--red-500`, `--grey-900`…), pulled from the E.ON Figma variable collections.
- `colors.css` — **semantic** colour groups built on the palette (`--bg-page`, `--fg-primary`, `--border-default`, `--success`, `--brand-red`…). These are the names new code uses (via `bg-page`/`text-primary`/`border-line`/`bg-success`). The `--c-*` block at the bottom is the **frozen legacy layer** (today's exact values) — kept so the migration is behaviour-preserving; delete each alias as its consumers migrate.
- `typography.css` — font families, weights, the clean type scale (`--type-*` → `text-display`/`text-h1…h4`/`text-body-*`), plus the **frozen legacy** `--fs-*`/`--lh-*` scale.
- `tokens.css` — dimensions: semantic spacing, radii, shadows, borders, z-index, sizes, motion, opacity. (Numeric spacing `gap-4`/`p-6` comes from Tailwind's 4px grid; only semantic spacing — `p-card`, `gap-field` — is tokenised.)
- `fonts.css` — `@font-face` for `EON Head` + `EON Brix Sans` (local `.otf` in `public/fonts/`).
- The design source of truth is the Figma file (`fileKey K94xaZYEFeZ0QQiqioY2RJ`, "Design eon.de | Intern") via the Figma MCP. Read variables from Figma rather than eyeballing; `scripts/sync-tokens.ts` (deferred) will regenerate these files.

## Critical gotchas (hard-won — read before touching scroll/sticky)

1. **`position: sticky` breaks in two ways, both subtle:**
   - Any ancestor with `transform` / `filter` / `will-change: transform` / `contain` / `perspective` creates a containing block that disables it. **ScrollTrigger pins apply a transform**, so never pin an ancestor of a sticky element.
   - Any ancestor that becomes a **non-scrolling scroll container** (`overflow: hidden` at content height) makes sticky resolve against it and never engage. This is why `html` uses `overflow-x: **clip**` (not `hidden`) in `globals.css` — `clip` prevents horizontal scroll *without* creating a scroll container.
2. **Modals lock the page scroll** with `document.body.style.overflow = 'hidden'`. This **must** be released on unmount — both modals have `useEffect(() => () => { document.body.style.overflow = ''; }, [])`. Without it, submitting the onboarding (`router.push` navigates away without running the close handler) leaks `body { overflow: hidden }` onto `/tariff` and silently kills the HEMS sticky stage — appearing only on soft navigation, and "fixed" by a hard refresh. Don't remove these cleanups.
3. **Cold-load vs refresh measurement:** ScrollTrigger measures pin/trigger positions; layout shift (fonts/images) on first load can mis-measure them. The `TariffPage` effect re-runs `ScrollTrigger.refresh()` on rAF, timeouts, `document.fonts.ready`, late image `load`, and `window load`, and uses `invalidateOnRefresh: true` with function-based start/end. Keep new triggers consistent with this.
