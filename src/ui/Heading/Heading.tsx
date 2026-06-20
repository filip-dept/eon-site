import type { ElementType, HTMLAttributes } from 'react';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * Heading — the Figma `Headings/1…6` scale (bold).
 *
 * Two axes mirror Figma exactly:
 *   • `level` 1–6 — which heading.
 *   • `size` — `'var'` (default) is the RESPONSIVE style: it resizes per breakpoint
 *     automatically (Figma's recommended mode). Or pin a fixed mode: `'sm' | 'md' |
 *     'lg' | 'xl' | 'xxl'` → the exact Figma `Headings/N/<mode>` size.
 *   • `weight` — `'bold'` (default, the Figma heading weight) / `'medium'` / `'regular'`.
 *
 * So `<Heading level={1} />` = `Headings/1/var`; `<Heading level={1} size="xl" />` =
 * `Headings/1/xl` (88/96, fixed); `<Heading level={2} size="md" weight="regular" />`
 * = a md-pinned H2 in regular.
 *
 * Family is EON Brix Sans; `display` switches to the hero-only EON Head face. Visual
 * size and document level are decoupled via `as`.
 */
const heading = tv({
  base: 'font-body',
  variants: {
    // level-size → the literal Figma style utility (must be literal for Tailwind scanning)
    scale: {
      '1-var': 'text-heading-1', '1-sm': 'text-heading-1-sm', '1-md': 'text-heading-1-md', '1-lg': 'text-heading-1-lg', '1-xl': 'text-heading-1-xl', '1-xxl': 'text-heading-1-xxl',
      '2-var': 'text-heading-2', '2-sm': 'text-heading-2-sm', '2-md': 'text-heading-2-md', '2-lg': 'text-heading-2-lg', '2-xl': 'text-heading-2-xl', '2-xxl': 'text-heading-2-xxl',
      '3-var': 'text-heading-3', '3-sm': 'text-heading-3-sm', '3-md': 'text-heading-3-md', '3-lg': 'text-heading-3-lg', '3-xl': 'text-heading-3-xl', '3-xxl': 'text-heading-3-xxl',
      '4-var': 'text-heading-4', '4-sm': 'text-heading-4-sm', '4-md': 'text-heading-4-md', '4-lg': 'text-heading-4-lg', '4-xl': 'text-heading-4-xl', '4-xxl': 'text-heading-4-xxl',
      '5-var': 'text-heading-5', '5-sm': 'text-heading-5-sm', '5-md': 'text-heading-5-md', '5-lg': 'text-heading-5-lg', '5-xl': 'text-heading-5-xl', '5-xxl': 'text-heading-5-xxl',
      '6-var': 'text-heading-6', '6-sm': 'text-heading-6-sm', '6-md': 'text-heading-6-md', '6-lg': 'text-heading-6-lg', '6-xl': 'text-heading-6-xl', '6-xxl': 'text-heading-6-xxl',
    },
    weight: { regular: 'font-regular', medium: 'font-medium', bold: 'font-bold' },
    color: {
      inherit: '',
      primary: 'text-primary',
      secondary: 'text-secondary',
      inverse: 'text-on-inverse',
      brand: 'text-brand-red',
    },
    display: { true: 'font-head', false: '' },
  },
  defaultVariants: { weight: 'bold', color: 'inherit', display: false },
});

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = 'var' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

type HeadingOwnProps = {
  /** Which heading (1–6). Default 2. */
  level?: HeadingLevel;
  /** `'var'` = responsive (default), or a fixed Figma mode. */
  size?: HeadingSize;
  weight?: 'regular' | 'medium' | 'bold';
  color?: 'inherit' | 'primary' | 'secondary' | 'inverse' | 'brand';
  /** Rendered tag — defaults to `h{level}`; override to keep the document outline correct. */
  as?: ElementType;
  /** Use the EON Head display face (hero headline). */
  display?: boolean;
};

export type HeadingProps = HeadingOwnProps &
  Omit<HTMLAttributes<HTMLHeadingElement>, keyof HeadingOwnProps>;

export function Heading({
  level = 2,
  size = 'var',
  weight = 'bold',
  color = 'inherit',
  as,
  display = false,
  className,
  ...rest
}: HeadingProps) {
  const Tag = (as ?? `h${level}`) as ElementType;
  const scale = `${level}-${size}` as `${HeadingLevel}-${HeadingSize}`;
  return (
    <Tag className={cn(heading({ scale, weight, color, display }), className)} {...rest} />
  );
}

export default Heading;
