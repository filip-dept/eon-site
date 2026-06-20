'use client';

import { Toggle } from '@/ui/Toggle';
import { cn } from '@/lib/cn';
import css from './ContextBar.module.css';

const LocationIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21c-4-4-7-7.3-7-10a7 7 0 1 1 14 0c0 2.7-3 6-7 10z" /><circle cx="12" cy="11" r="2" />
  </svg>
);
const PersonsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const PlugIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2v6M8 6h8M7 12h10l-1 7H8l-1-7z" /><path d="M12 19v3" />
  </svg>
);

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
      <span className={css.ctxChip}><LocationIcon />{plz}</span>
      <span className={css.ctxSep} />
      <span className={css.ctxChip}><PersonsIcon />{persons} Pers.</span>
      <span className={css.ctxSep} />
      <span className={css.ctxChip}><PlugIcon />{kwh.toLocaleString('de-DE')} kWh</span>
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
