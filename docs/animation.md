# Animation — the motion system

Motion is treated like colour/type: a **system** with tokens + shared, named definitions + one reduced-motion switch. Nothing animation-related is improvised inline.

> **Target feel:** **zoox.com-style** motion — smooth, scroll-driven, cinematic reveals (specified per section in Phase 4; informs the GSAP scroll choreography + Framer Motion easings/durations).

## Framer Motion vs GSAP — the split
- **Framer Motion** owns **component-level motion** — card stagger (`staggerChildren`), the intro splash, badge/hover. Use it for NEW declarative component motion (the `<Reveal>`/`<Stagger>` wrappers).
- **GSAP + ScrollTrigger** stays for the pinned horizontal track and the breakdown morph (scroll-scrubbed timelines Framer can't do well) **— and for the journey wizard transitions** (see decision below).
- So component CSS shrinks to layout/type/colour (Tailwind); little-to-no keyframe CSS remains — except a couple of ambient effects (the gradient blobs), which stay as CSS or move to Framer.

> **Decision (Phase 3, 2026-06): journey transitions stay on GSAP-in-a-hook.** The
> original plan put the modal/step transitions on Framer Motion (`AnimatePresence`).
> In practice the choreography — the clip-path `inset()` reveal, the y±140 step
> slide with the custom `eonReveal`/`eonOut` eases, the blur-typewriter stagger, the
> `display`-toggle + `animating` guard — is intricate, **verified behaviour-preserving**,
> and now cleanly **isolated inside `hooks/useStepWizard`** (the real architectural
> goal — no animation inline in components). Rewriting it into `AnimatePresence` is a
> high-risk regression for low architectural gain. So GSAP stays here; Framer Motion is
> adopted for genuinely new declarative motion (Phase 4 cards/badges). Revisit only if
> the wizard transitions need capabilities GSAP-in-hook can't give.

## Where it lives

```
styles/tokens.css        --duration-fast/base/slow, --ease-standard/emphasized/eon  (CSS + shared vocabulary)
lib/motion/
  tokens.ts              durations, easings (cubic-bezier arrays for Framer), springs — mirrors the CSS tokens
  variants.ts            shared Framer variants: fadeUp, staggerContainer, cardReveal, modalReveal, …
ui/motion/
  Reveal.tsx             <Reveal> in-view fade/rise wrapper (uses variants + tokens)
  Stagger.tsx            <Stagger> orchestrates children (staggerChildren)
hooks/
  usePinnedTrack.ts …    GSAP/ScrollTrigger timelines (scroll-scrubbed) — built in hooks, never in JSX
lib/gsap.ts              registers plugins + the custom eases (eonReveal/eonOut/eonAppear) — single place
```

## Rules of thumb
- **Motion tokens first.** Durations/easings/distances are tokens (CSS `--duration-*`/`--ease-*` + a TS mirror in `lib/motion/tokens.ts`) so CSS, Framer, and GSAP all move with the same "feel" (the zoox.com target).
- **Framer = declarative component motion** (enter/exit/gesture/`layout`): reusable variants in `lib/motion/variants.ts`; **co-locate** one-off variants in the component. Feature code stays JSX-declarative via `<Reveal>`/`<Stagger>` or `variants={…}`.
- **GSAP = scroll-scrubbed/pinned only**, with **timelines in hooks** (`usePinnedTrack`), never inline effects. Custom eases registered once in `lib/gsap.ts`.
- **Ambient/decorative** (gradient blobs) → CSS `@keyframes` co-located with the component.
- **One reduced-motion source**: `<MotionConfig reducedMotion="user">` at the root + `useReducedMotion()` for JS branches + a `prefers-reduced-motion` media for CSS keyframes. Never re-check ad-hoc.
- **Name by intent** (`fadeUp`, `cardReveal`, `modalReveal`) — not by implementation — so motions are reused, not re-invented.
