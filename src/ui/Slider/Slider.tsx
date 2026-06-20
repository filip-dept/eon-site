import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import styles from './Slider.module.css';

/**
 * Slider — a range input with a red fill + thumb and optional edge labels.
 * Replaces the onboarding kWh `.slider`. The fill % is derived from the value, so
 * callers just pass min/max/step/value. Extra props (e.g. `data-appear`) spread to
 * the wrapper for entrance animations.
 */
export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  /** Edge labels shown beneath the track. */
  labels?: string[];
  'aria-label'?: string;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  labels,
  className,
  'aria-label': ariaLabel,
  ...rest
}: SliderProps) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn(styles.wrap, className)} {...rest}>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--fill': `${fill}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
      />
      {labels && labels.length > 0 && (
        <div className={styles.labels}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

export default Slider;
