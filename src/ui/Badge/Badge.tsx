import type { HTMLAttributes, ReactNode } from 'react';
import { type VariantProps } from 'tailwind-variants';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * Badge — a small status/recommendation pill. Replaces the `.cardBadge` looks:
 * `success` = green "Besonders nachhaltig" (eco), `brand` = purple "Unsere
 * Empfehlung für dich" (the comparison recommendation). `neutral` is net-new.
 * (Distinct from Chip = interactive, Tag = static descriptor — see components.md.)
 */
const badge = tv({
  base: 'inline-flex shrink-0 items-center gap-1.5 h-6 px-2.5 rounded-sm whitespace-nowrap text-copy-sm font-medium',
  variants: {
    tone: {
      success: 'bg-success text-white',
      brand: 'bg-brand-purple text-white',
      neutral: 'bg-muted text-primary',
    },
  },
  defaultVariants: { tone: 'success' },
});

type BadgeOwnProps = {
  tone?: VariantProps<typeof badge>['tone'];
  iconLeft?: ReactNode;
};

export type BadgeProps = BadgeOwnProps &
  Omit<HTMLAttributes<HTMLSpanElement>, keyof BadgeOwnProps>;

export function Badge({ tone = 'success', iconLeft, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn(badge({ tone }), className)} {...rest}>
      {iconLeft}
      {children}
    </span>
  );
}

export default Badge;
