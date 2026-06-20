import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { tv } from '@/ui/tv';
import { cn } from '@/lib/cn';

/**
 * SelectableCard — the frosted-glass option card from the onboarding journey.
 * Replaces `.optionCard` (row, with icon) and `.presetCard` (col, no icon) via the
 * `layout` prop. Selected → red-tinted border + brighter glass. (Glass rgba values
 * and #dcdad8 border are one-offs pending tokenisation.)
 */
const card = tv({
  base: [
    'group cursor-pointer text-left rounded-lg border bg-white/[0.14] backdrop-blur-[18px] backdrop-saturate-150',
    'transition-[transform,box-shadow,border-color,background-color] duration-[220ms] ease-out hover:-translate-y-[3px]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  ],
  variants: {
    selected: {
      true: 'border-[rgba(234,27,10,0.6)] bg-white/[0.34]',
      false: 'border-[#dcdad8] hover:border-[rgba(147,147,147,0.75)] hover:bg-white/[0.24]',
    },
    layout: {
      row: 'flex flex-row items-center gap-3 px-6 py-4',
      col: 'flex flex-col gap-2 px-4 pt-[18px] pb-4',
    },
  },
  defaultVariants: { layout: 'row' },
});

type SelectableCardOwnProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  icon?: ReactNode;
  layout?: 'row' | 'col';
};

export type SelectableCardProps = SelectableCardOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SelectableCardOwnProps | 'type'>;

export function SelectableCard({
  selected,
  onClick,
  title,
  sub,
  icon,
  layout = 'row',
  className,
  ...rest
}: SelectableCardProps) {
  const titleEl = <span className="font-body font-bold text-copy-lg leading-[1.25] text-primary">{title}</span>;
  const subEl = <span className="font-body text-copy-md leading-[1.5] text-secondary">{sub}</span>;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={cn(card({ selected, layout }), className)}
      onClick={onClick}
      {...rest}
    >
      {layout === 'row' ? (
        <>
          {icon && (
            <span className="flex size-11 shrink-0 origin-left items-center justify-start text-brand-red transition-transform duration-[220ms] ease-out group-hover:scale-[1.08] group-hover:-rotate-[4deg] [&>svg]:size-[30px]">
              {icon}
            </span>
          )}
          <span className="flex w-full flex-col gap-1.5">
            {titleEl}
            {subEl}
          </span>
        </>
      ) : (
        <>
          {titleEl}
          {subEl}
        </>
      )}
    </button>
  );
}

export default SelectableCard;
