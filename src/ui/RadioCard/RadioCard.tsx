import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * RadioCard — a selectable option card (title + sub) with either a left checkbox
 * (Wechsel) or a right corner-tick (Datum) indicator. Replaces `.abBox` /
 * `.abCorner`. Selected → red border + faint red ring. (Glass onboarding cards
 * `optionCard`/`presetCard` are a separate look, handled elsewhere.)
 */
const card = tv({
  base: [
    'relative flex w-full items-start gap-6 rounded-md border-[1.5px] bg-page px-6 py-11 text-left',
    'font-body cursor-pointer transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-px',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  ],
  variants: {
    selected: {
      true: 'border-brand-red shadow-[0_0_0_1.5px_rgba(234,27,10,0.12)]',
      false: 'border-[#e0dedd] hover:border-[#c4c3c2]',
    },
    indicator: { checkbox: '', corner: 'pr-[52px]' },
  },
});

export interface RadioCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  indicator?: 'checkbox' | 'corner';
}

export function RadioCard({ selected, onClick, title, sub, indicator = 'checkbox' }: RadioCardProps) {
  return (
    <button type="button" role="radio" aria-checked={selected} className={card({ selected, indicator })} onClick={onClick}>
      {indicator === 'checkbox' && (
        <span
          className={cn(
            'flex size-5.5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-[background-color,border-color] duration-150',
            selected ? 'border-info bg-info text-white' : 'border-[#b5b4b3] bg-page',
          )}
        >
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none" className={selected ? 'opacity-100' : 'opacity-0'} aria-hidden="true">
            <path d="M2 6.2l2.6 2.6L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}

      <span className="flex flex-col">
        <span className="block font-bold text-copy-lg leading-[normal] text-primary">{title}</span>
        <span className="mt-[3px] block text-copy-md leading-[normal] text-secondary">{sub}</span>
      </span>

      {indicator === 'corner' && (
        <span className={cn('absolute right-[18px] top-1/2 -translate-y-1/2 text-brand-red transition-opacity duration-150', selected ? 'opacity-100' : 'opacity-0')} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

export default RadioCard;
