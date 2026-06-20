'use client';

import { Toggle } from '@/ui/Toggle';
import { Icon } from '@/ui/Icon';
import { cn } from '@/lib/cn';
import css from './ContextBar.module.css';


export interface ContextBarProps {
  /** `docked` (journey toolbar) tightens spacing; `float` (default, inline / tariff later). */
  placement?: 'docked' | 'float';
  plz?: string;
  persons?: number;
  kwh?: number;
  eco: boolean;
  onEcoChange: () => void;
  onEdit?: () => void;
}

/**
 * ContextBar — the shared "Deine Eingaben" bar: PLZ/persons/kWh · Ändern ·
 * preference · "Besonders nachhaltig" toggle. One composite used by the journey
 * (docked toolbar) and, later, the tariff page (floating) via `placement`.
 */
export function ContextBar({
  placement = 'float',
  plz = '81245',
  persons = 2,
  kwh = 3200,
  eco,
  onEcoChange,
  onEdit,
}: ContextBarProps) {
  return (
    <div className={cn(css.ctxRow, placement === 'docked' && css.docked)}>
      <span className={css.ctxChip}><Icon name="location" size={15} />{plz}</span>
      <span className={css.ctxSep} />
      <span className={css.ctxChip}><Icon name="persons" size={15} />{persons} Pers.</span>
      <span className={css.ctxSep} />
      <span className={css.ctxChip}><Icon name="plug" size={15} />{kwh.toLocaleString('de-DE')} kWh</span>
      <a className={css.ctxEdit} href="#" onClick={(e) => { e.preventDefault(); onEdit?.(); }}>Ändern</a>
      <span className={css.ctxSep} />
      <span className={css.miniPrefLabel}>Ich lege Wert auf</span>
      <span className={css.miniPref}>
        <span className={css.miniPrefSides}><span>Flexibilität</span><span>Sicherheit</span></span>
        <span className={css.miniTrack}><span className={css.miniFill} /><span className={css.miniDot} /></span>
      </span>
      <span className={css.ctxSep} />
      <Toggle size="sm" checked={eco} onChange={onEcoChange} label="Besonders nachhaltig" />
    </div>
  );
}

export default ContextBar;
