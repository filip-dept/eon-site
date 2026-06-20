import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { type VariantProps } from 'tailwind-variants';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * The single button primitive. Replaces the ad-hoc `.btnPrimary` / `.btnCompare`
 * / `.ctaBtn` / `.proofStatsBtn` styles. All looks/states derive from one
 * type-safe variant map; colours/radii/type come from the design tokens.
 *
 * Note: `iconLeft`/`iconRight` take a ReactNode for now (callers pass the
 * existing inline SVGs). They move to `<Icon name>` once the Figma icon registry
 * lands (Phase 2 cont.). The `primary + iconRight` combo reproduces the journey
 * CTA's arrow-nudge hover.
 */
const button = tv({
  base: [
    'group inline-flex items-center justify-center whitespace-nowrap select-none',
    'font-body font-bold rounded-md cursor-pointer',
    'transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
    'disabled:cursor-default',
  ],
  variants: {
    variant: {
      primary:
        'border-0 bg-brand-red text-white hover:bg-btn-primary-hover disabled:bg-btn-disabled disabled:text-btn-disabled-fg disabled:hover:bg-btn-disabled',
      secondary:
        'border-2 border-line bg-surface text-primary hover:bg-muted',
      outline:
        'border-2 border-brand-red bg-transparent text-brand-red hover:bg-brand-red/[0.06]',
      'outline-light':
        'border-2 border-white bg-transparent text-white hover:bg-white/[0.12]',
      ghost: 'border-0 bg-transparent text-brand-red hover:bg-brand-red/[0.06]',
    },
    size: {
      sm: 'h-10 gap-2 text-copy-md',
      md: 'h-12 gap-2.5 text-copy-lg',
      lg: 'h-14 gap-3 text-copy-xl',
    },
    fullWidth: { true: 'min-w-0 flex-1', false: '' },
    iconOnly: { true: 'aspect-square p-0', false: '' },
    /** primary CTAs with a right icon nudge right on hover (was `.ctaBtn:hover`). */
    nudge: {
      true: 'hover:translate-x-[3px] hover:shadow-[-4px_0_0_0_rgba(234,27,10,0.2)]',
      false: '',
    },
  },
  compoundVariants: [
    // auto-width text buttons get horizontal padding (full-width ones size via flex)
    { fullWidth: false, iconOnly: false, size: 'sm', class: 'px-5' },
    { fullWidth: false, iconOnly: false, size: 'md', class: 'px-8' },
    { fullWidth: false, iconOnly: false, size: 'lg', class: 'px-10' },
    // outline CTAs sit their icon tighter (was `.btnCompare` gap 6px vs primary 10px)
    { variant: 'outline', class: 'gap-1.5' },
  ],
  defaultVariants: { variant: 'primary', size: 'md', fullWidth: false, iconOnly: false },
});

type ButtonOwnProps = {
  variant?: VariantProps<typeof button>['variant'];
  size?: VariantProps<typeof button>['size'];
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>;

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  iconOnly = false,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const nudge = variant === 'primary' && !!iconRight && !iconOnly && !disabled && !loading;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(button({ variant, size, fullWidth, iconOnly, nudge }), className)}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && iconLeft}
      {children}
      {!loading && iconRight && (
        <span
          aria-hidden
          className={nudge ? 'inline-flex transition-transform duration-150 group-hover:translate-x-[2px]' : 'inline-flex'}
        >
          {iconRight}
        </span>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-[1em] animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export default Button;
