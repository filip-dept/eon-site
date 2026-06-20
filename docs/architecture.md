# Architecture

Target architecture for the refactor. Companion docs: [components](./components.md) · [design-system](./design-system.md) · [animation](./animation.md) · [roadmap](./refactor-plan.md).

## Goals & principles

1. **Tokens are the only source of colour/type/spacing.** No hex/px literals in components (lint-enforced). See [design-system.md](./design-system.md).
2. **Small, single-responsibility components.** Target < ~200 lines/file; a "page" only composes sections.
3. **One primitive per UI concept** (Button, Card, Badge, Field, Icon…) reused everywhere. See [components.md](./components.md).
4. **Logic out of views**: data → `data/`, types → `types/`, animation → `hooks/` + `lib/motion/`, cross-cutting → `lib/`.
5. **Behaviour-preserving migration.** Each PR is a structural move with a visual diff of "no change".
6. **Tailwind CSS** is the styling system (replacing CSS Modules), with the design tokens fed into the Tailwind theme so "tokens only" still holds — utilities resolve to the same Figma values.

## Stack & dependencies (decided)

| Concern | Choice | Notes |
|--------|--------|-------|
| Styling | **Tailwind CSS** + `@tailwindcss/postcss` | theme generated from the design tokens (colours, type scale, spacing, radii, easings). |
| Class composition | **clsx** (+ **tailwind-merge**) | conditional/variant classNames; `tailwind-merge` dedupes conflicts. |
| Component variants | **tailwind-variants** (or `cva`) | type-safe variant maps for `Button`, `Badge`, `Card` (variant/size/state). |
| Icons | **generated package, sourced from Figma** | see [components.md §Icons](./components.md#icons--generated-package-sourced-from-figma). |
| Component animation | **Framer Motion** | declarative enter/exit/`layout`/gesture (see [animation.md](./animation.md)). |
| Scroll engine | **keep GSAP + ScrollTrigger** | the pinned horizontal track + breakdown scrub is beyond Framer; they coexist. |
| Dates | **date-fns** | bonus/contract dates, Geburtsdatum, "Datum" step. |
| (later) forms | consider **react-hook-form + zod** | the 7-step checkout has real validation; optional Phase 5. |

## Folder structure

```
src/
  app/                      # routes only — compose features, no logic
    layout.tsx
    page.tsx                # <HomePage/>
    tariff/page.tsx         # <TariffPage/>
  ui/                       # design-system primitives (dumb, reusable, Storybook'd)
    Button/                 # Button.tsx + Button styles + Button.stories.tsx
    Card/  Badge/  Field/  Slider/  Checkbox/  SegmentedControl/
    Text/                   # typographic component (maps to type scale)
    Icon/                   # <Icon name="check"/> from the Figma registry
    motion/                 # <Reveal>, <Stagger> wrappers
  components/               # feature/composite components (use ui/ primitives)
    layout/                 # Navbar, Footer, PageShell
    common/                 # ContextBar (shared composites)
    chat/                   # AiOrb, AiChat, TariffChatOrb
    hero/                   # Hero, ScrollIndicator
    journey/                # JourneyWizard (shared), Onboarding/CheckoutJourney, steps/
    tariff/                 # TariffSection + sub-sections (Hero, Compare, Breakdown, Hems…)
    intro/                  # IntroLoader
  hooks/                    # usePinnedTrack, useStepWizard, useReveal, useIdle…
  lib/                      # gsap.ts, smoothScroll, eventBus, germanPlz, format, motion/
  data/                     # tariffs.ts, hemsPins.ts, priorities.ts (typed catalogues)
  types/                    # Tariff, JourneyAnswers, … shared interfaces
  styles/                   # palette.css, colors.css, typography.css, tokens.css, fonts.css, globals.css
```

**Dependency direction (one-way):** `app/` → `components/` → `ui/` · `hooks/` · `lib/` → `styles/`. `ui/` never imports a feature; features never import a route. Rule of thumb: **`app/` and feature components describe *what*; `ui/`, `hooks/`, `lib/` describe *how*.**

## Decomposing `TariffPage` (1850 → a thin composition)

`TariffPage` becomes a layout that renders independent sections, each owning its markup + styles + animation hook:

- `TariffHero/` — hero frame + panel + `SoloCard`.
- `TariffCompare/` — `CompareCard` ×3 + open/close orchestration (its `useCompareTransition` hook).
- `Breakdown/` — the "28 Cent" editorial + Stromtransparenz bars→columns morph.
- `Stories/`, `Hems/`, `Faq/`, `Proof/` (the floating orb is `chat/TariffChatOrb`).
- `hooks/usePinnedTrack` — owns the master `pinST` ScrollTrigger + phase functions; sections subscribe.
- `data/tariffs.ts` + `types/Tariff.ts` — the catalogue leaves the component.

Result: each section ~100–250 lines, independently readable/testable; the giant `useEffect` splits into per-section hooks.

## The two journeys — shared, not duplicated

They are (and stay) two components — different content/steps/routes — but today they duplicate the shell + step machine + transitions. Extract:

- `journey/JourneyWizard.tsx` — the **shared shell**: modal frame, overlay, open/close, corner buttons, progress, the vertical step transition + blur reveal (one `useStepWizard` hook), scroll-lock cleanup, keyboard (Enter/Esc).
- `OnboardingJourney` & `CheckoutJourney` — just **configure** the wizard: a list of step components + validation + `onComplete`. (Onboarding → `/tariff` + intro flag; checkout → close.)
- `journey/steps/` — each step is its own small component built from `ui/` primitives.

## Layout & the horizontal-scroll engine

- `components/layout/PageShell` — consistent page frame (Navbar slot, max-width, paddings from tokens).
- **The pinned horizontal track is the riskiest piece** — isolate it in `hooks/usePinnedTrack` (or a `<PinnedTrack>` wrapper) encapsulating the ScrollTrigger master pin, `invalidateOnRefresh`, function-based start/end, and the refresh-on-fonts/images choreography. Keep the **sticky/transform gotchas documented next to the code** (currently in `CLAUDE.md`). Sections become declarative "frames" the engine scrubs.
- Keep `SmoothScroller` (Lenis) at the root; expose `window.lenis`.

> ⚠️ Sticky/transform & scroll-measurement gotchas are load-bearing — see `CLAUDE.md` › "Critical gotchas" before touching the scroll engine.
