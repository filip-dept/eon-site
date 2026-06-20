import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * Chip — an interactive pill (suggestion / quick-select). Replaces the hero
 * `.chip`. `interactive={false}` makes it inert (decorative) without changing the
 * look. (Distinct from Tag = static descriptor, Badge = status — see components.md.)
 * A `selected` state will be added when a selectable-chip site lands (ContextBar, Phase 3/4).
 */
const chip = tv({
  base: [
    'inline-flex items-center h-8 px-3 py-1 rounded-2xl bg-muted text-primary',
    'border border-[#e5e4e4]', // one-off chip border (#e5e4e4 — candidate for tokenisation)
    'font-body text-copy-md whitespace-nowrap cursor-pointer',
    'transition-[color,background-color,border-color] duration-200 ease-out will-change-[transform,opacity]',
    'hover:border-brand-red hover:bg-brand-red hover:text-white',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  ],
  variants: {
    interactive: { true: '', false: 'cursor-default pointer-events-none' },
  },
  defaultVariants: { interactive: true },
});

type ChipOwnProps = {
  interactive?: boolean;
  iconLeft?: ReactNode;
};

export type ChipProps = ChipOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ChipOwnProps>;

export function Chip({ interactive = true, iconLeft, type = 'button', className, children, ...rest }: ChipProps) {
  return (
    <button type={type} className={cn(chip({ interactive }), className)} {...rest}>
      {iconLeft}
      {children}
    </button>
  );
}

export default Chip;
