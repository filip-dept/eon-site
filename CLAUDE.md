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

Next.js 16 App Router · React 19 · TypeScript · CSS Modules · **GSAP 3 + ScrollTrigger + CustomEase** · **Lenis** smooth scroll. No CSS framework; styling is plain CSS Modules + design tokens. Path alias `@/` → `src/`.

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
- `src/styles/tokens.css` — brand colors, the **EON type scale mirrored from Figma** ("Design eon.de"), layout vars, easings. `src/styles/fonts.css` — `EON Head` + `EON Brix Sans` loaded from local `.otf` in `public/fonts/`.
- The design source of truth is a Figma file accessed via the Figma Dev Mode MCP. When aligning typography/spacing, read variables from Figma rather than eyeballing.

## Critical gotchas (hard-won — read before touching scroll/sticky)

1. **`position: sticky` breaks in two ways, both subtle:**
   - Any ancestor with `transform` / `filter` / `will-change: transform` / `contain` / `perspective` creates a containing block that disables it. **ScrollTrigger pins apply a transform**, so never pin an ancestor of a sticky element.
   - Any ancestor that becomes a **non-scrolling scroll container** (`overflow: hidden` at content height) makes sticky resolve against it and never engage. This is why `html` uses `overflow-x: **clip**` (not `hidden`) in `globals.css` — `clip` prevents horizontal scroll *without* creating a scroll container.
2. **Modals lock the page scroll** with `document.body.style.overflow = 'hidden'`. This **must** be released on unmount — both modals have `useEffect(() => () => { document.body.style.overflow = ''; }, [])`. Without it, submitting the onboarding (`router.push` navigates away without running the close handler) leaks `body { overflow: hidden }` onto `/tariff` and silently kills the HEMS sticky stage — appearing only on soft navigation, and "fixed" by a hard refresh. Don't remove these cleanups.
3. **Cold-load vs refresh measurement:** ScrollTrigger measures pin/trigger positions; layout shift (fonts/images) on first load can mis-measure them. The `TariffPage` effect re-runs `ScrollTrigger.refresh()` on rAF, timeouts, `document.fonts.ready`, late image `load`, and `window load`, and uses `invalidateOnRefresh: true` with function-based start/end. Keep new triggers consistent with this.
