import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Field — label + control wrapper (replaces `.fieldCol` + `.fieldLabel`). Renders a
 * `<label>` around the control so clicking the label focuses it. The 11px uppercase
 * caption is off the type scale (one-off) and uses the Figma secondary fg (#5c5c5c,
 * vs the legacy #535252 — an imperceptible reconciliation). Hint/error slots later.
 */
export interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className }: FieldProps) {
  return (
    <label className={cn('flex min-w-0 flex-col', className)}>
      <span className="mb-2.5 font-body text-[11px] font-bold uppercase tracking-[0.12em] text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

export default Field;
