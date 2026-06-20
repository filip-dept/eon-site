import type { AnchorHTMLAttributes, ElementType, ReactNode } from 'react';
import { type VariantProps } from 'tailwind-variants';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * Link — styled text link / inline text action. Replaces `.contextEdit` ("Ändern"),
 * `.socialCta` ("Mehr entdecken"), `.articleLink` ("Mehr lesen"). Polymorphic via
 * `as` (default `a`; pass `as="button"` for onClick actions without an href).
 */
const link = tv({
  base: 'inline-flex items-center gap-1.5 font-body text-copy-md cursor-pointer border-0 bg-transparent p-0 whitespace-nowrap',
  variants: {
    tone: { brand: 'text-brand-red', inverse: 'text-white', inherit: '' },
    underline: { true: 'underline', false: 'no-underline' },
    weight: { regular: 'font-regular', medium: 'font-medium' },
  },
  defaultVariants: { tone: 'brand', underline: true, weight: 'regular' },
});

type LinkOwnProps = {
  tone?: VariantProps<typeof link>['tone'];
  underline?: boolean;
  weight?: 'regular' | 'medium';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  /** Element to render — default `a`. Use `button` for actions without an href. */
  as?: ElementType;
};

export type LinkProps = LinkOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkOwnProps>;

export function Link({
  tone = 'brand',
  underline = true,
  weight = 'regular',
  iconLeft,
  iconRight,
  as,
  className,
  children,
  ...rest
}: LinkProps) {
  const Tag = (as ?? 'a') as ElementType;
  return (
    <Tag className={cn(link({ tone, underline, weight }), className)} {...rest}>
      {iconLeft}
      {children}
      {iconRight}
    </Tag>
  );
}

export default Link;
