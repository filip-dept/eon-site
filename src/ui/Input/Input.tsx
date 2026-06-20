import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/**
 * Input — the raw styled text/number/date input. Replaces `.boxInput`.
 * `leading-[normal]` keeps the browser's single-line height (47px) rather than the
 * scale's 24px line-height. (#dcdad8 border / #b5b4b3 placeholder are one-off greys
 * pending tokenisation.)
 */
export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-[#dcdad8] bg-page px-4 py-[13px]',
        'font-body text-copy-md leading-[normal] text-primary outline-none',
        'transition-[border-color,box-shadow] duration-150',
        'placeholder:text-[#b5b4b3]',
        'focus:border-primary focus:shadow-[0_0_0_1px_var(--fg-primary)]',
        className,
      )}
      {...rest}
    />
  );
}

export default Input;
