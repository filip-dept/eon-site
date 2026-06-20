import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * SegmentedControl — pick one of N options (e.g. Anrede Frau/Herr/Divers).
 * Replaces `.segmented` + `.segBtn`. Equal-width segments; the active one goes
 * red-tinted. (#e0dedd/#c4c3c2/#fdf1ef are one-off values pending tokenisation.)
 */
const seg = tv({
  base: [
    'flex-1 rounded-md border-[1.5px] bg-page p-3 cursor-pointer',
    'font-body text-copy-md leading-[normal] text-primary',
    'transition-[color,background-color,border-color] duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  ],
  variants: {
    active: {
      true: 'border-brand-red bg-[#fdf1ef] text-brand-red font-medium',
      false: 'border-[#e0dedd] hover:border-[#c4c3c2]',
    },
  },
});

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T | '';
  onChange: (value: T) => void;
  className?: string;
  'aria-label'?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('flex gap-3.5', className)} role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={seg({ active })}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
