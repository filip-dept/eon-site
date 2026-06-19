# Component inventory

The complete component map. Primitives in `ui/`, composites in `components/`. See [architecture.md](./architecture.md) for the layering and [design-system.md](./design-system.md) for the tokens these consume.

## `ui/` — design-system primitives (dumb, brand-anchored, Storybook'd)

| Component | Purpose / props | Replaces today |
|---|---|---|
| **Button** | `variant: primary\|secondary\|outline\|outline-light\|ghost`, `size: sm\|md\|lg`, `iconLeft/Right`, **`iconOnly`**, `loading`, `disabled`, `fullWidth` | `.btnPrimary`, `.btnCompare`, `.ctaBtn`, A/B box CTAs |
| **IconButton** | thin preset = `<Button iconOnly>` with a shape (`round\|square`) + `aria-label` | corner back/close, cart, mic, slider ± steppers |
| **Icon** | `name: IconName`, `size`; from the Figma registry, `currentColor` | ~55 inline `<svg>` |
| **Text** / **Heading** | `variant: display\|h1..h4\|body-lg\|body\|body-sm\|label\|eyebrow\|caption`, `as`, `color`, `weight` | every hand-assembled font rule |
| **Badge** | `tone: success\|brand\|neutral`, `iconLeft` | green/purple recommendation + "nachhaltig" badges |
| **Card** | base surface; `elevated`, `selected`, `as` | `.card`, `.optionCard`, `.presetCard`, `.tariffPreview` |
| **Input** | raw styled `<input>` (text/number/date); states | bare inputs |
| **Field** | label + hint + error wrapper around **Input** | `.boxInput` / `.fieldCol` |
| **Dropdown** | popover list — menu / `Select` / autocomplete results | PLZ autocomplete list (with **PlzField**) |
| **Slider** | `min/max/step/value/onChange`, edge labels, fill, thumb; keyboard + `aria` | kWh slider **and** the preference slider |
| **Toggle** / **Checkbox** | `checked/onChange/label` | "Besonders nachhaltig", A/B `.abCheckbox` |
| **SegmentedControl** | `options/value/onChange` | Anrede (Frau/Herr/Divers) |
| **Stepper** | numeric `value/min/max/onChange` | persons +/- |
| **Chip** | interactive/selectable pill (`icon?`, `selected`) | context chips, quick-select pills |
| **Tag** | small static label pill (`tone?`) | comparison `cardTag`, meta tags |
| **Label** | form-field/eyebrow label (uppercase/caption) | `.fieldLabel` ("POSTLEITZAHL"), section labels |
| **Divider**, **Spinner**, **VisuallyHidden** | small helpers (Spinner feeds Button `loading`) | inline dividers |
| **Overlay** + **Modal** | backdrop + focus-trap + scroll-lock + clip-path reveal (base shell) | the hand-rolled modal scaffolding |
| **Logo** | `variant: white\|red` | raw `<img>` duplicated in Navbar + IntroLoader |
| **Avatar** / **AvatarGroup** | overlapping faces | social-proof strip |
| **Price** | amount + unit ("54,30 € pro Monat") | repeated in Solo + Compare cards |
| **Link** | styled text link | "Ändern", "Mehr entdecken" |
| **EnterHint** | "drücke auf Enter ↵" cue | repeated across journey steps |
| **ProgressStep** | rail item: icon + label + state | journey sidebar/topbar item |

> **Badge vs Chip vs Tag vs Label** (kept distinct): **Badge** = status/recommendation (success/brand) · **Chip** = *interactive* selectable pill · **Tag** = small *static* descriptor pill · **Label** = form/eyebrow caption text.

### Button (and friends), done right
- A single `ui/Button` replaces all 7 ad-hoc button styles. **Variants/states via `tailwind-variants` (or `cva`) + `clsx`/`tailwind-merge`** — one type-safe map for default / hover / active / focus-visible / disabled / loading.
- Existing looks map to: `primary` = red fill (`.btnPrimary`/`.ctaBtn`), `outline` = red border (`.btnCompare`, extra-card CTA), `outline-light`/`ghost` for the red-panel CTAs.
- Same treatment for **Card**, **Badge**, **Field**, **Slider**, **Checkbox/Toggle**, **SegmentedControl**.
- **Every primitive gets a Storybook story** documenting all variants/states — the visual contract + manual-QA surface.

## `components/layout/`
- **Navbar** — top nav (transparent↔solid on scroll). **PageShell** — page frame (nav slot, max-width, paddings). **Footer** (if/when needed).

## `components/common/` — cross-feature composites
- **ContextBar** — the "Deine Eingaben" bar (PLZ/persons/kWh chips · "Ändern" link · preference Slider · "Besonders nachhaltig" toggle · tariff name + Price · cart `IconButton`). **One component composed entirely of `ui/` primitives.** Used by **both** the tariff page (floating `ctxBar`) and the journey (docked toolbar) via a `placement` prop — replaces today's duplicated `ctxBar` *and* `ContextToolbar`.

## `components/chat/` — one AI chat component, 3 variants
Today the chat/orb is implemented **three times** (hero `ChatWidget`, the `orbFloat` in `TariffPage`, the journey `ConvSphere`). Collapse to a single **`AiChat`** built from two atoms:
- **AiOrb** — the animated orb **video** (`orb-anim.mp4`), one definition, reused everywhere (the journey renders `<AiOrb/>` alone).
- **AiChat** — the bar: **the orb video sits on the left**, then content per variant:

| `variant` | Layout | Used by |
|---|---|---|
| **`full`** | orb · placeholder input · **suggestion chips (labels)** · send | hero entry ("Was beschäftigt dich heute?" + chips) |
| **`bare`** *(no labels)* | orb · placeholder input · mic | hero alt / inline — same bar, **chips hidden** |
| **`voice`** | orb · **separator** · mic only | the compact "Start mit deine Stimme" control |

- Props: `variant: 'full' \| 'bare' \| 'voice'`, `placeholder`, `suggestions?`, `onSubmit`, `onVoice`.
- **TariffChatOrb** = `AiChat` + a `useChatOrb` hook that adds the floating/docking/idle-open behaviour (position only — the visual is the same `AiChat`).

## `components/hero/`
- **Hero** — landing section (bg media, headline, scroll cue) — composes `chat/AiChat variant="full"`. **ScrollIndicator**.

## `components/intro/`
- **IntroLoader** — branded splash (logo · "It's on us" · load bar · lift-away).

## `components/journey/`
- **JourneyWizard** — *shared shell*: overlay, modal frame, corner buttons, progress nav, step transitions (Framer Motion), keyboard, scroll-lock.
- **OnboardingJourney** — steps `[Priority, Location, Consumption]`, on complete → `/tariff` (+ intro flag).
- **CheckoutJourney** — steps `[Review, Wechsel, Anbieter, Kundennummer, Zähler, Datum, Daten]`, on complete → close.
- **ProgressSidebar** / **ProgressTopbar** — the step rail / docked toolbar. (The inputs bar is the shared `common/ContextBar`, `placement="docked"`.)
- **Typewriter** — blurred word-stagger headline. **PlzField** — Field + Dropdown autocomplete (uses `lib/germanPlz`). (Orb + voice come from `chat/`.)
- **journey/steps/** — one small component per step, built from `ui/` primitives.

## `components/tariff/`
- **TariffSection** — composes the scroll frames + the `redZone` sections.
- **TariffHero** — frame 1: media + panel + **SoloCard** + the shared `common/ContextBar` (`placement="float"`).
- **TariffCompare** — the 3-card comparison; **SoloCard**, **CompareCard**, **TariffFeature** (icon+name+desc row); owns `useCompareTransition`.
- **Breakdown** — "28 Cent" travelling headline + Stromtransparenz; decomposes into **BreakdownBar** / **BreakdownColumn** (bars → columns morph).
- **Stories** + **StoryCard** — parallax collage.
- **Hems** — sticky category stage → **HemsCategory** (selector item), **HemsHotspot** (pin + pulse + label, one per `HEMS_PINS`), **HemsWires** (scroll-drawn SVG connectors).
- **Faq** + **FaqItem**. **Proof** — social-proof strip → composes **AvatarGroup**.

## ⚠️ Naming — don't carry over legacy/ambiguous names
When extracting, **name components for what they *are*, not the old CSS-class/variable name.** Several current names are wrong or misleading and must be reconsidered:

- **`Hems`** is the biggest offender: **HEMS is a *product*** (Home Energy Management System) — *one* of the items in that house showcase (alongside **Solar, Strom, Wallbox, Wärmepumpe**). So the *section* should NOT be called `Hems`. Rename the section to what it depicts — e.g. **`ConnectedHome`** / **`EnergyHome`** (the smart-home stage) — and keep HEMS as one **product entry** in `data/` rendered by a generic `ProductHotspot` / `ProductCategory`. (Names above like `HemsCategory`/`HemsHotspot` are placeholders pending this rename.)
- Audit the rest the same way: prefer **domain/intent names** over implementation leftovers. Pick names a newcomer (or designer in Figma) would recognise; align with the Figma layer names where possible.

Concrete offenders found (rename as part of extraction):

**Components / internal names**
- **`JourneyModal`** → `CheckoutJourney`/`CheckoutWizard` — it's the *checkout* wizard, but the name is generic and collides conceptually with `OnboardingModal` (both are "journeys"). Pair them as `OnboardingJourney` / `CheckoutJourney`.
- **`ConvSphere` / `convOrb`** → `AiOrb` — "Conv"(ersational) is an opaque abbreviation.
- **`PrefSlider`** → `PreferenceSlider`. **`Feature`** (in TariffPage) → `TariffFeature` (too generic). Local **`Icon`/`Field`/`Step`** helpers collide with the planned `ui/` primitives — fold into those.
- **Icons named by appearance** — `CheckRed`, `TickSmall`, `HomeGreenIcon` — rename **semantically** (`check`, `checkSm`, `homeEco`); colour/size belong to props, not the name. (All become the Figma `<Icon name>` set anyway.)

**Data / constants**
- **`HEMS_PINS` / `HEMS_HUB` / `HEMS_IMG_W` / `HEMS_LINKS` / `HEMS_N`** → product/home naming (`HOME_PRODUCTS`, `PRODUCT_HOTSPOTS`, …) — same HEMS-is-a-product issue.
- **Cryptic scroll/geometry consts** in `TariffPage` — `ROT`, `MORPH`, `RISE`, `POS`, `DOT`, `FILLET`, `SPEED`, `CARD_SPEED/START`, `CLIP_HIDDEN/VISIBLE`, `HR_HIDDEN/SHOWN` — give descriptive names (`ROTATE_PHASE`, `MORPH_PHASE`, `CLIP_*`→`reveal/hide`…) when they move into `hooks/usePinnedTrack`.

**Sections / CSS concepts** (most dissolve into Tailwind + `ui/`, but the *section/wrapper* concepts need real names)
- **`redZone`** → the fixed gradient backdrop section (`StoriesBackdrop`/`RedSection`). **`panelGlow`** → `panelGradient`.
- **`ctx*`** (`ctxBar/ctxRow/ctxChip/ctxSliders/…`) → fold into `ContextBar`. **`float*`** (`floatTariff*/floatLabel`) → drop the impl `float` prefix.
- **`frameEditorial` / `frameBars`** → name by content (`frameCostBreakdown` / `frameTransparency`). **`hems*`** classes → connected-home/product naming.

## `hooks/`
- **usePinnedTrack** (GSAP master pin + phases) · **useStepWizard** · **useCompareTransition** · **useReveal** (`data-au/al/ar` entrance) · **useScrollLock** · **useIdle** (orb auto-open) · **useChatOrb** · **useReducedMotion**.

## `data/` · `types/` · `lib/`
- `data/tariffs.ts`, `data/hemsPins.ts`, `data/priorities.ts` · `types/Tariff.ts`, `types/Journey.ts` · `lib/gsap.ts`, `lib/smoothScroll.ts`, `lib/eventBus.ts`, `lib/germanPlz.ts`, `lib/format.ts` (date-fns), `lib/motion/`.

## Icons — generated package, sourced from Figma
**A designer adds/updates an icon in the Figma library → run a sync → it's available as `<Icon name="…"/>`** (typed). Replaces the ~55 inline duplicated SVGs.
- **Pipeline:** `scripts/sync-icons.ts` pulls icon nodes from the EON Figma file (Figma API / Dev Mode MCP), saves SVGs to `src/ui/Icon/svg/`, runs **SVGR** to generate typed components + a `name → component` registry (`IconName` union).
- **Usage:** `<Icon name="check" />` / `<Icon name="leaf" size={20} />`, colour via `currentColor` (Tailwind `text-*`). Tree-shakeable.
- **Packaging:** start as `src/ui/Icon`; promote to `@eon/icons` only if a second app needs it.
- The faked EON sidebar/feature glyphs get replaced by the real Figma set in the same pass.
