# Design system — tokens, colour, typography

How every visual value is defined and kept on-brand. Consumed by [components.md](./components.md) via the Tailwind theme.

> **Anchored to E.ON branding.** Every colour token derives from the official E.ON / Figma palette (brand red `#ea1b0a`, magenta, purple, the greys/feedback colours) — no off-brand values. Typography is **EON Brix Sans** (`--font-body`, body/UI) and **EON Head** (display only); the type scale uses these exclusively. Icons come from the **E.ON Figma icon library**. The clean-up *consolidates* values onto the brand system — it never invents new ones.

Tokens are the source of truth; Tailwind consumes them. **Split `styles/` into focused files** (one concern each):

```
styles/
  palette.css      # raw, non-semantic values ("ramp"): --red-500, --grey-900, --teal-500…
  colors.css       # SEMANTIC groups built from the palette (the only names components use)
  typography.css   # the clean type scale (+ <Text> variants map to these)
  tokens.css       # spacing, radii, shadows, easings, z-index, layout, durations
  fonts.css        # @font-face
  globals.css      # Tailwind layers + base/reset
```

## Colour system — clear semantic groups (merge duplicates)
Two layers: a small **palette** (raw colours, deduped) → **semantic tokens** grouped by role. Components only use the semantic group names; Tailwind maps them to `bg-*`, `text-*`, `border-*`.

| Group | Tokens (examples) | Merges/fixes |
|------|------|------|
| **background** | `--bg-page` #fff · `--bg-surface` #f8f5f2 · `--bg-muted` #ebebeb · `--bg-brand` #ea1b0a · `--bg-inverse` #262626 | `#fff` (×56) → `--bg-page`/`--fg-inverse` by role |
| **foreground/text** | `--fg-primary` #262626 · `--fg-secondary` · `--fg-muted` · `--fg-inverse` #fff · `--fg-brand` #ea1b0a | **merge** `#535252`+`#5c5c5c` → one `--fg-secondary` |
| **border** | `--border-subtle` · `--border-default` · `--border-strong` | **merge** `#e0dedd`/`#dcdad8`/`#d7d0cc` → 2 tokens |
| **feedback** | `--success` #18a087 · `--info` #0075c2 · `--warning` · `--error` | `#0075c2` (×12) was never a token — add it |
| **brand** | `--brand-red` #ea1b0a · `--brand-magenta` #c11054 · `--brand-purple` #941481 | stop hardcoding brand hex |
| **interactive** | `--btn-primary`, `--btn-primary-hover` #cc1709, `--focus-ring` | derive button states once |

→ Tailwind: `bg-page`, `bg-surface`, `text-primary`, `text-secondary`, `border-default`, `text-brand`, `bg-success`. **Audit target: every one of the 168 literals maps to a group token; 0 raw hex in components.** (Also unlocks dark mode later = swap the semantic layer.)

## Typography — mirror the Figma scale
The scale **mirrors the E.ON Figma type system 1:1** (names + values): `Headings/1…6`,
`Copy/xl|lg|md|sm`, plus `Abstract/*` (lead copy) and `Quote/*`. This replaces today's
sprawl (`fs-h2…h6`, `copy xl/lg/md/sm`, and the alias drift `fs-nav`/`fs-input`/`fs-chip`).
Each entry = size + line-height + weight; headings are bold, copy is regular (Medium/Bold
via `font-*` utilities).

**Headings expose both forms Figma documents — `var` (responsive) and the fixed modes.**
`<Heading level={N}>` (or `text-heading-N`) is the **`var`** style: one utility that resizes
itself per breakpoint (the recommended default). To pin a specific Figma mode, use
`<Heading level={N} size="sm|md|lg|xl|xxl">` (or `text-heading-N-<mode>`) → the exact fixed
size, regardless of viewport. Weight is `<Heading … weight="bold|medium|regular">` (bold default).
The per-breakpoint steps (the `var` ramp = the fixed columns below):

```
                sm     md     lg     xl/xxl
heading-1   48/56  60/68  72/80  88/96
heading-2   40/48  48/56  56/64  72/80
heading-3   32/40  40/48  48/56  56/64
heading-4   28/36  30/38  32/40  36/44
heading-5   22/30  24/32  24/32  26/36
heading-6   16/24  18/24  20/32  20/28
```

Copy (fixed): `copy-xl 20/30 · copy-lg 18/27 · copy-md 16/24 · copy-sm 14/21`.
Abstract (Medium): `sm 18/27 · md/lg 20/27 · xl 22/27`. Quote: `sm 22/33 · md 24/36 · lg/xl 26/39`.

→ Tailwind `fontSize` keys (`text-heading-2`, `text-copy-lg`) + a `<Text variant>`/`<Heading level>`
component (see [components.md](./components.md)). Kills the hand-assembled font rules (and the
`clamp()` headline bug).

> **Rule — type is defined once, only referenced elsewhere.** It lives in the scale (`typography.css`) + the `<Text>`/`<Heading>` primitives. Every other component **references** it — `<Text variant>`/`<Heading level>` for content, or a `text-*` scale utility where a component can't be inserted. **No component declares raw `font-size`/`font-weight`/`line-height`/`font-family`** (lint-enforced: no off-scale or `text-[14px]` escapes). The only family applied at a usage site is `font-head` on the hero display headline.

> **Family:** Figma uses **EON Brix Sans** for everything incl. headings (style *Bold*) —
> the scale is family-agnostic (size/line/weight only). **`EON Head`** is kept solely for the
> hero display headline (a site choice, not in the Figma text-style variables), applied via
> `font-head` at the usage site. **Black (900)** copy weight exists in Figma but the `.otf`
> isn't loaded yet. **Breakpoints** (768/1024/1440/1920) are a best-effort map of the Figma
> viewport modes — confirm with design.

## Full token taxonomy — *every value is a variable*
No magic numbers anywhere. Every spacing, radius, shadow, etc. resolves to a token (→ a Tailwind utility). Groups (in `styles/tokens.css`, mapped into the theme):

| Group | Tokens (scale) | Replaces today |
|---|---|---|
| **Spacing** (gap/padding/margin) | `--space-1`…`--space-20` (4,6,8,10,12,14,16,20,24,28,32,40,48,56,64,80,120) | raw `gap/padding` everywhere |
| **Semantic spacing** | `--gutter`, `--section-y`, `--card-pad`, `--field-gap`, `--stack-*` | ad-hoc per component |
| **Radii** | `--radius-sm` 4 · `--radius-md` 8 · `--radius-lg` 12 · `--radius-pill` 999 · `--radius-button` 14 · `--radius-full` 50% | literals 4/6/8/10/12/14/24 |
| **Shadows** | `--shadow-sm/md/lg`, `--shadow-rec`, `--shadow-chat`, `--shadow-modal` | scattered `box-shadow` literals |
| **Borders** | `--border-1` 1px · `--border-2` 2px (+ colour tokens above) | raw `1px/1.5px/2px` |
| **Z-index** | `--z-base/nav/overlay/modal/orb/intro` (named, not 6/200/201/9999) | magic z-index numbers |
| **Sizes** | `--nav-h`, `--container-max`, `--chat-w`, `--media-radius`, `--scroll-size` | partial today |
| **Motion** | `--duration-fast/base/slow`, `--ease-standard/emphasized/eon` (see [animation.md](./animation.md)) | hardcoded durations |
| **Breakpoints** | `--bp-sm/md/lg/xl` → Tailwind `screens` | scattered `@media` |
| **Opacity / layers** | `--opacity-muted/disabled` | literal `0.5/0.75` |

→ Components write `gap-4 p-card rounded-md shadow-rec z-modal` — **zero raw px**. Lint blocks `gap-[14px]`-style escapes so nothing drifts off-scale.

## Tokens sourced from Figma (editable at the source)
**Single source of truth = Figma Variables.** A sync script regenerates the token files so a designer edits a variable in Figma → we re-pull → the site updates (same model as the icon sync).

- **Built:** `scripts/sync-tokens.mjs` (`npm run sync:tokens`) regenerates `styles/palette.css` (the raw colour ramps) from the Figma colour variables. Source priority: the **Variables REST API** (`/v1/files/:key/variables/local`) when `FIGMA_TOKEN` is set, else the checked-in snapshot `scripts/figma-variables.json` (refreshed via the Figma MCP — select the Colours frame, re-pull, update the JSON). Only the **palette** (raw primitives) is generated; the semantic layer (`colors.css`), type scale, and dimensions stay hand-curated (they encode design decisions a dump can't infer).
- Mapping is by **Figma variable name → token name** (e.g. `grid/spacer-100` → `--space-…`, `border-radius/button-100` → `--radius-button`) — names we already saw in the frames (`var(--grid/spacer-100,24px)`, `--border-radius/button-primary/button-100`).
- ⚠️ The **full Variables REST API is Enterprise-gated** — the REST path is implemented but unverified here; the snapshot path is the tested default. **Not yet generated:** spacing/radius/type primitives (extend the same script) and the **icon** sync (same MCP→SVGR pattern, still pending).

## Enforcement
`eslint-plugin-tailwindcss` (class order, no contradictions) + a rule banning arbitrary hex (`text-[#fff]`) and off-scale sizes — values always come from the theme. This is what prevents regression to today's 168-literal drift.
