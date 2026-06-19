# E.ON site — docs

The refactor turns this codebase into a maintainable, best-practice system **without changing the visual result** (behaviour-preserving, verified in the browser). These docs split into **durable reference** (the design system — lives forever) and the **temporary roadmap** (archived when the migration completes).

| Doc | What it covers | Lifespan |
|---|---|---|
| [architecture.md](./architecture.md) | Principles, stack, folder structure & dependency direction, the scroll engine, how `TariffPage` and the two journeys decompose | durable |
| [components.md](./components.md) | Full component inventory — `ui/` primitives, the feature composites, AI chat, ContextBar, icons | durable |
| [design-system.md](./design-system.md) | Colours, typography, the full token taxonomy, and the Figma → tokens sync | durable |
| [animation.md](./animation.md) | The motion system — tokens, Framer variants, GSAP/Framer split, reduced-motion | durable |
| [refactor-plan.md](./refactor-plan.md) | Where we are today, scope/holes, the phased migration, open decisions | temporary |

> The **always-on conventions** distilled from these docs live in the repo root `CLAUDE.md` (auto-loaded each session). These files are the detail behind those rules.
