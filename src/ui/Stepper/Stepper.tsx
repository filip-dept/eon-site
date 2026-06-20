import { cn } from '@/lib/cn';

/**
 * Stepper — a big numeric value with −/+ controls on an underline field (the
 * onboarding "Personen im Haushalt"). Replaces `.stepper` + `.stepperVal` +
 * `.stepBtn`. (#ccc underline / #f9f6f4 hover are one-off values pending tokenisation.)
 */
const btn =
  'flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-button border-0 bg-transparent text-primary transition-colors duration-150 enabled:hover:bg-[#f9f6f4] disabled:cursor-default disabled:opacity-30';

export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  decLabel?: string;
  incLabel?: string;
  className?: string;
}

export function Stepper({
  value,
  min = 0,
  max = Infinity,
  onChange,
  decLabel = 'Weniger',
  incLabel = 'Mehr',
  className,
}: StepperProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3.5 border-b-[1.5px] border-[#ccc] pb-2', className)}>
      <span className="min-w-12 text-left font-body font-bold leading-none text-primary text-[clamp(40px,7vw,56px)]">
        {value}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={decLabel}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10" /></svg>
        </button>
        <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={incLabel}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
        </button>
      </div>
    </div>
  );
}

export default Stepper;
