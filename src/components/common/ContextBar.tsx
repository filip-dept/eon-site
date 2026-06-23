'use client';

import { useRef } from 'react';
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
  /** preference slider position 0 (Flexibilität) → 100 (Sicherheit) */
  pref?: number;
  /** when set, the preference slider becomes interactive (drag/click → new 0–100 value) */
  onPrefChange?: (pref: number) => void;
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
  pref = 55,
  onPrefChange,
  eco,
  onEcoChange,
  onEdit,
}: ContextBarProps) {
  const trackRef = useRef<HTMLSpanElement>(null);
  const interactive = !!onPrefChange;

  /* map a pointer x onto a 0–100 track position */
  const prefFromPointer = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
  };
  const handlePointer = (e: React.PointerEvent) => {
    if (!onPrefChange) return;
    onPrefChange(prefFromPointer(e.clientX));
  };

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
        <span
          ref={trackRef}
          className={cn(css.miniTrack, interactive && css.miniTrackInteractive)}
          onPointerDown={interactive ? (e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); } : undefined}
          onPointerMove={interactive ? (e) => { if (e.buttons) handlePointer(e); } : undefined}
        >
          <span className={css.miniFill} style={{ width: `${pref}%` }} /><span className={css.miniDot} style={{ left: `${pref}%` }} />
        </span>
      </span>
      <span className={css.ctxSep} />
      <Toggle size="sm" checked={eco} onChange={onEcoChange} label="Besonders nachhaltig" />
    </div>
  );
}

export default ContextBar;
