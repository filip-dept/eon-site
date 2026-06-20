import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/* tailwind-merge has no knowledge of our custom theme keys, so by default it
   misclassifies them — e.g. it treats the font-size `text-copy-lg` as conflicting
   with the colour `text-white` (dropping one), and won't let `rounded-button`
   override `rounded-md`. Register the custom scales so conflict-resolution is
   correct. Shared by `cn()` and the `tv()` wrapper (src/ui/tv.ts). */
/** Our font-size scale keys (the `text-*` value, sans the `text-` prefix):
 *  heading-1…6 (+ optional -sm|md|lg|xl|xxl fixed mode), copy-*, abstract-*, quote-*. */
const isFontSize = (value: string): boolean =>
  /^(heading-[1-6](-(sm|md|lg|xl|xxl))?|copy-(xl|lg|md|sm)|abstract-(sm|md|lg|xl)|quote-(sm|md|lg|xl))$/.test(value);

export const twMergeConfig = {
  extend: {
    classGroups: {
      'font-size': [{ text: [isFontSize] }],
      rounded: [{ rounded: ['button', 'pill'] }],
    },
  },
};

export const twMerge = extendTailwindMerge(twMergeConfig);

/** Merge class names: clsx for conditionals, tailwind-merge to dedupe conflicts
 *  (so a caller's `className` can override a component's defaults). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
