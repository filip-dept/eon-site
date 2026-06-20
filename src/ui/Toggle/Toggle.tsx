import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';
import { Icon } from '@/ui/Icon';

/**
 * Toggle — a labelled binary checkbox/switch. Replaces the tariff/journey
 * "Besonders nachhaltig" control (`.checkItem` + `.checkBox`): a 22px box that's
 * blue-filled with a white tick when on, transparent with a grey border when off.
 */
const box = tv({
  base: 'inline-flex size-5.5 shrink-0 items-center justify-center rounded-sm border-[1.5px] transition-[background-color,border-color] duration-200 ease-out',
  variants: {
    checked: {
      true: 'border-info bg-info text-white',
      // unchecked border is a one-off light grey (not yet a token — candidate for tokenisation)
      false: 'border-[#b5b4b3] bg-transparent',
    },
  },
});

type ToggleOwnProps = {
  checked: boolean;
  onChange?: () => void;
  label?: ReactNode;
};

export type ToggleProps = ToggleOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ToggleOwnProps | 'onChange'>;

export function Toggle({ checked, onChange, label, className, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'inline-flex cursor-pointer items-center gap-3 border-0 bg-transparent p-0 font-body text-copy-md text-primary whitespace-nowrap',
        className,
      )}
      {...rest}
    >
      <span className={box({ checked })}>
        <Icon name="check" className={cn('block transition-opacity duration-150', checked ? 'opacity-100' : 'opacity-0')} />
      </span>
      {label}
    </button>
  );
}

export default Toggle;
