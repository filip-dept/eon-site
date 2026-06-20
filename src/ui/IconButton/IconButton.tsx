import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { type VariantProps } from 'tailwind-variants';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * IconButton — a square/round icon-only button (cart, close, mic, FAQ toggle…).
 * `aria-label` is required (icon-only has no text). Pass an `<Icon>` as children.
 * Replaces `.cartBtn`, `.chatClose`, `.chatSend`, `.faqToggle`, etc.
 */
const iconButton = tv({
  base: [
    'inline-flex shrink-0 items-center justify-center cursor-pointer',
    'transition-[color,background-color] duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
    'disabled:cursor-default disabled:opacity-disabled',
  ],
  variants: {
    variant: {
      primary: 'border-0 bg-brand-red text-white hover:bg-btn-primary-hover',
      surface: 'border-0 bg-page text-primary hover:bg-surface',
      ghost: 'border-0 bg-transparent text-primary hover:bg-surface',
    },
    size: {
      sm: 'size-9', // 36px
      md: 'size-12', // 48px
    },
    shape: {
      square: 'rounded-lg', // 12px
      round: 'rounded-full',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md', shape: 'square' },
});

type IconButtonOwnProps = {
  variant?: VariantProps<typeof iconButton>['variant'];
  size?: VariantProps<typeof iconButton>['size'];
  shape?: VariantProps<typeof iconButton>['shape'];
  /** Required — icon-only buttons need an accessible name. */
  'aria-label': string;
  children: ReactNode;
};

export type IconButtonProps = IconButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof IconButtonOwnProps>;

export function IconButton({
  variant = 'primary',
  size = 'md',
  shape = 'square',
  type = 'button',
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button type={type} className={cn(iconButton({ variant, size, shape }), className)} {...rest}>
      {children}
    </button>
  );
}

export default IconButton;
