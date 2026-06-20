import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Icon — one typed `<Icon name>` per glyph, coloured via `currentColor`
 * (`className="text-*"`). Replaces the ~55 duplicated inline `<svg>`.
 *
 * The registry is seeded from the existing in-repo SVGs so the look is unchanged.
 * It's the internal-module start of the icon system; the Figma→SVGR sync
 * (`scripts/sync-icons`, pending) will later regenerate these glyph sources —
 * swapping the faked icons for the real E.ON set is a separate, intentional change.
 *
 * `size` overrides width+height (square). Non-square glyphs (e.g. chevron-right,
 * 10×14) keep their natural ratio when `size` is omitted.
 */
type IconDef = { viewBox: string; width: number; height: number; content: ReactNode };

const icons = {
  'chevron-right': {
    viewBox: '0 0 10 16',
    width: 10,
    height: 14,
    content: (
      <path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  leaf: {
    viewBox: '0 0 24 24',
    width: 14,
    height: 14,
    content: (
      <g stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6" />
      </g>
    ),
  },
  'check-circle': {
    viewBox: '0 0 28 28',
    width: 28,
    height: 28,
    content: (
      <>
        <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth={1.5} />
        <path d="M8 14l4 4 8-8" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  bonus: {
    viewBox: '0 0 28 28',
    width: 28,
    height: 28,
    content: (
      <>
        <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth={1.5} />
        <path
          d="M14 7.5l1.9 3.85 4.25.62-3.08 3 .73 4.23L14 17.2l-3.8 2 .73-4.23-3.08-3 4.25-.62L14 7.5z"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </>
    ),
  },
  cart: {
    viewBox: '0 0 24 24',
    width: 20,
    height: 20,
    content: (
      <g stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1.4" />
        <circle cx="19" cy="21" r="1.4" />
        <path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
      </g>
    ),
  },
  check: {
    viewBox: '0 0 12 12',
    width: 12,
    height: 12,
    content: (
      <path d="M2 6.2l2.6 2.6L10 3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  'arrow-right': {
    viewBox: '0 0 16 16',
    width: 16,
    height: 16,
    content: (
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  location: {
    viewBox: '0 0 24 24',
    width: 16,
    height: 16,
    content: (
      <g stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21c-4-4-7-7.3-7-10a7 7 0 1 1 14 0c0 2.7-3 6-7 10z" />
        <circle cx="12" cy="11" r="2" />
      </g>
    ),
  },
  'chevron-down': {
    viewBox: '0 0 16 16',
    width: 14,
    height: 14,
    content: (
      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  persons: {
    viewBox: '0 0 24 24',
    width: 15,
    height: 15,
    content: (
      <g stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </g>
    ),
  },
  plug: {
    viewBox: '0 0 24 24',
    width: 15,
    height: 15,
    content: (
      <g stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6M8 6h8M7 12h10l-1 7H8l-1-7z" />
        <path d="M12 19v3" />
      </g>
    ),
  },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number;
} & Omit<SVGProps<SVGSVGElement>, 'name' | 'width' | 'height' | 'viewBox'>;

export function Icon({ name, size, className, ...rest }: IconProps) {
  const def = icons[name];
  return (
    <svg
      viewBox={def.viewBox}
      width={size ?? def.width}
      height={size ?? def.height}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn(className)}
      {...rest}
    >
      {def.content}
    </svg>
  );
}

export default Icon;
