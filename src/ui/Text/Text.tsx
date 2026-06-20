import type { ElementType, HTMLAttributes } from 'react';
import { type VariantProps } from 'tailwind-variants';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * Text — body/copy typography. `variant` maps to the Figma copy families
 * (`Copy/xl|lg|md|sm`, `Abstract/*`, `Quote/*`); `weight` is the second axis
 * (`Regular|Medium|Bold`). So a Figma style like `Copy/xl/Bold` is
 * `<Text variant="copy-xl" weight="bold">`, and `Copy/md/Regular` is just
 * `<Text>` (the defaults). Abstract variants default to medium (as in Figma).
 */
const text = tv({
  base: 'font-body',
  variants: {
    variant: {
      'copy-xl': 'text-copy-xl',
      'copy-lg': 'text-copy-lg',
      'copy-md': 'text-copy-md',
      'copy-sm': 'text-copy-sm',
      'abstract-sm': 'text-abstract-sm',
      'abstract-md': 'text-abstract-md',
      'abstract-lg': 'text-abstract-lg',
      'abstract-xl': 'text-abstract-xl',
      'quote-sm': 'text-quote-sm',
      'quote-md': 'text-quote-md',
      'quote-lg': 'text-quote-lg',
      'quote-xl': 'text-quote-xl',
    },
    /** Overrides the variant's built-in weight when set. */
    weight: {
      inherit: '',
      regular: 'font-regular',
      medium: 'font-medium',
      bold: 'font-bold',
    },
    color: {
      inherit: '',
      primary: 'text-primary',
      secondary: 'text-secondary',
      tertiary: 'text-tertiary',
      inverse: 'text-on-inverse',
      brand: 'text-brand-red',
    },
  },
  defaultVariants: { variant: 'copy-md', weight: 'inherit', color: 'inherit' },
});

type TextOwnProps = {
  variant?: VariantProps<typeof text>['variant'];
  weight?: VariantProps<typeof text>['weight'];
  color?: VariantProps<typeof text>['color'];
  /** Rendered tag — default `p`. Use `span` for inline. */
  as?: ElementType;
};

export type TextProps = TextOwnProps &
  Omit<HTMLAttributes<HTMLElement>, keyof TextOwnProps>;

export function Text({
  variant = 'copy-md',
  weight = 'inherit',
  color = 'inherit',
  as,
  className,
  ...rest
}: TextProps) {
  const Tag = (as ?? 'p') as ElementType;
  return <Tag className={cn(text({ variant, weight, color }), className)} {...rest} />;
}

export default Text;
