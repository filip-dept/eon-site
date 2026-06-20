import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';
import { Icon } from '@/ui/Icon';

/**
 * Toggle — a labelled binary checkbox/switch. Replaces the tariff/journey
 * "Besonders nachhaltig" control (`.checkItem` + `.checkBox`): a 22px box that's
 * blue-filled with a white tick when on, transparent with a grey border when off.
 */
const wrap = tv({
  base: 'inline-flex cursor-pointer items-center border-0 bg-transparent p-0 font-body text-primary whitespace-nowrap',
  variants: { size: { sm: 'gap-2 text-copy-sm', md: 'gap-3 text-copy-md' } },
  defaultVariants: { size: 'md' },
});

const box = tv({
  base: 'inline-flex shrink-0 items-center justify-center rounded-sm border-[1.5px] transition-[background-color,border-color] duration-200 ease-out',
  variants: {
    checked: {
      true: 'border-info bg-info text-white',
      // unchecked border is a one-off light grey (not yet a token — candidate for tokenisation)
      false: 'border-[#b5b4b3] bg-transparent',
    },
    size: { sm: 'size-5', md: 'size-5.5' },
  },
  defaultVariants: { size: 'md' },
});

type ToggleOwnProps = {
  checked: boolean;
  onChange?: () => void;
  label?: ReactNode;
  /** `md` (22px, default) for the tariff bar; `sm` (20px) for the docked journey toolbar. */
  size?: 'sm' | 'md';
};

export type ToggleProps = ToggleOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ToggleOwnProps | 'onChange'>;

export function Toggle({ checked, onChange, label, size = 'md', className, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(wrap({ size }), className)}
      {...rest}
    >
      <span className={box({ checked, size })}>
        <Icon name="check" className={cn('block transition-opacity duration-150', checked ? 'opacity-100' : 'opacity-0')} />
      </span>
      {label}
    </button>
  );
}

export default Toggle;
