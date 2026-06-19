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

## Typography — one clean scale
Replace today's sprawl (`fs-h2/h3/h4/h5/h6`, `copy xl/lg/md/sm`, **plus** alias drift `fs-nav`/`fs-input`/`fs-chip` that just duplicate copy sizes) with **one minimal scale**, each entry = size + line-height + weight:

```
display  (56/100, bold)   — hero
h1 40 · h2 32 · h3 22 · h4 18           (headings, bold)
body-lg 18/27 · body 16/24 · body-sm 14/21   (regular/medium)
label 14 (medium) · caption 12
```
→ Tailwind `fontSize` keys (`text-h2`, `text-body-lg`) + a `<Text variant>`/`<Heading level>` component (see [components.md](./components.md)). Kills the hand-assembled font rules (and the `clamp()` headline bug). Aliases (`fs-nav`=`body-lg`, `fs-chip`=`body`) collapse into the scale.

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

- `scripts/sync-tokens.ts` reads the Figma **variable collections** (colour, number/spacing, radius, …) via the **Figma MCP `get_variable_defs`** (per-frame, available now) and/or the **Figma Variables REST API** (`/v1/files/:key/variables/local`), then writes `styles/colors.css` + `styles/tokens.css` and the Tailwind theme mapping. `npm run sync:tokens`.
- Mapping is by **Figma variable name → token name** (e.g. `grid/spacer-100` → `--space-…`, `border-radius/button-100` → `--radius-button`) — names we already saw in the frames (`var(--grid/spacer-100,24px)`, `--border-radius/button-primary/button-100`).
- ⚠️ Caveat: the **full Variables REST API is Enterprise-gated**; if unavailable we seed/maintain via MCP per-frame reads + a checked-in mapping file. Either way the tokens stay the editable layer and Figma the origin.

## Enforcement
`eslint-plugin-tailwindcss` (class order, no contradictions) + a rule banning arbitrary hex (`text-[#fff]`) and off-scale sizes — values always come from the theme. This is what prevents regression to today's 168-literal drift.
