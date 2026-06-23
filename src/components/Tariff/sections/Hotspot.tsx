import type { HotspotLayout } from '@/data/hems';
import { cn } from '@/lib/cn';
import css from './Hotspot.module.css';

/* HotspotLayout (the six label placements from the Figma set, node 1904:1302)
   lives with the pin data in @/data/hems. */

const LAYOUT_CLASS: Record<HotspotLayout, string> = {
  right: css.right,
  left: css.left,
  'top-right': css.topRight,
  'top-left': css.topLeft,
  'bottom-right': css.bottomRight,
  'bottom-left': css.bottomLeft,
};

export interface HotspotProps {
  title: string;
  sub: string;
  layout: HotspotLayout;
  /** revealed by the stage after the house unmasks */
  ready?: boolean;
  /** currently the live device → solid white disc + red centre dot
      (passed and not-yet-reached devices keep the translucent disc + white dot) */
  active?: boolean;
}

/**
 * Hotspot — a dot anchor + a glass pill label, the label placed in one of six
 * positions around the dot. The dot is the positioned anchor: the connected-home
 * stage sets `left`/`top` on the root, and `data-hotspot` lets it find them.
 * Only the live device (`active`) is highlighted (solid white disc + red centre);
 * every other device shows a plain translucent disc with a white dot.
 */
export function Hotspot({ title, sub, layout, ready = false, active = false }: HotspotProps) {
  return (
    <div
      data-hotspot
      className={cn(css.hotspot, LAYOUT_CLASS[layout])}
      data-ready={ready ? 'true' : 'false'}
      data-active={active ? 'true' : 'false'}
    >
      <span className={css.dot} />
      <div className={css.label}>
        <span className={css.title}>{title}</span>
        <span className={css.sub}>{sub}</span>
      </div>
    </div>
  );
}

export default Hotspot;
