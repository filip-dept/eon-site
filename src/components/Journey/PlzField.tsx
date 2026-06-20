'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { suggestPlz } from '@/lib/germanPlz';
import { Field } from '@/ui/Field';
import { Icon } from '@/ui/Icon';
import css from './PlzField.module.css';

/**
 * PlzField — German postal-code field with autocomplete (Field label + big input +
 * suggestion dropdown with Arrow/Enter/Esc nav + resolved city + validity check).
 * Owns its suggestion/active/city state; reports the chosen PLZ via `onChange`.
 * (A generic `ui/Dropdown` can be factored out if a second autocomplete appears.)
 */
export interface PlzFieldProps {
  value: string;
  onChange: (plz: string) => void;
}

export function PlzField({ value, onChange }: PlzFieldProps) {
  const plz = value ?? '';
  const plzValid = /^\d{5}$/.test(plz);

  const [suggestions, setSuggestions] = useState<[string, string][]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [city, setCity] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  function pick(p: string, c: string) {
    setCity(c.split(',')[1]?.trim() ?? c);
    onChange(p);
    setSuggestions([]);
    setActiveIdx(-1);
  }

  function handleChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 5);
    onChange(digits);
    setCity('');
    setSuggestions(digits.length >= 2 ? suggestPlz(digits) : []);
    setActiveIdx(-1);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      pick(...suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIdx(-1);
    }
  }

  /* keep the active suggestion in view */
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    (listRef.current.children[activeIdx] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  return (
    <>
      <Field label="Postleitzahl">
        <div className={css.plzField}>
          <div className={css.plzRow}>
            <input
              className={css.plzInput}
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="20095"
              value={plz}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              aria-label="Postleitzahl"
              aria-autocomplete="list"
              aria-expanded={suggestions.length > 0}
            />
            {city && <span className={css.plzCity}>{city}</span>}
            {plzValid && <Icon name="check" size={20} className="shrink-0 text-[#22a053]" />}
            <Icon name="location" size={34} className="ml-auto shrink-0 text-[#9e9d9c]" />
          </div>

          {suggestions.length > 0 && (
            <ul ref={listRef} className={css.plzDropdown} role="listbox">
              {suggestions.map(([p, c], i) => (
                <li
                  key={p}
                  className={css.plzOption}
                  data-active={i === activeIdx ? 'true' : 'false'}
                  role="option"
                  aria-selected={i === activeIdx}
                  onMouseDown={(e) => { e.preventDefault(); pick(p, c); }}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <span className={css.plzOptionCode}>{p}</span>
                  <span className={css.plzOptionCity}>{c}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>
      <p className={css.plzHint}>Brauchen wir nur, um den passenden Tarif zu finden — wir speichern nichts.</p>
    </>
  );
}

export default PlzField;
