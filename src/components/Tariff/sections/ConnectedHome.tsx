import type { Ref } from 'react';
import type { HemsCat } from '@/data/hems';
import { HEMS_CATS, HEMS_PINS, HEMS_LINKS } from '@/data/hems';
import { Hotspot } from './Hotspot';
import styles from '../tariff.module.css';

/**
 * ConnectedHome — the smart-home showcase stage (HEMS is one *product* in it,
 * alongside Solar/Strom/Wallbox/Wärmepumpe — hence the section is named for what
 * it depicts, per the naming convention). Presentational: the scroll choreography
 * (reveal, scrub category-select, wire-drawing geometry, idle) still lives in
 * TariffPage and drives this markup through the forwarded `textRef`/`linesRef` and
 * the shared `tariff.module.css` class names. Hook extraction (useHemsStage) comes
 * with the scroll-engine capstone.
 */
export interface ConnectedHomeProps {
  cat: HemsCat;
  activeIndex: number;
  pinsReady: boolean;
  onCatClick: (i: number) => void;
  textRef: Ref<HTMLDivElement>;
  linesRef: Ref<SVGSVGElement>;
}

export function ConnectedHome({ cat, activeIndex, pinsReady, onCatClick, textRef, linesRef }: ConnectedHomeProps) {
  return (
    <section className={styles.hems}>
      <div className={styles.hemsStage}>
        <div className={styles.hemsLeft}>
          <div ref={textRef}>
            <p className={styles.hemsLogo}>{cat.menu}</p>
            <h2 className={styles.hemsTitle}>{cat.title}</h2>
            <p className={styles.hemsDesc}>{cat.desc}</p>
          </div>
          <div className={styles.hemsMenu}>
            {HEMS_CATS.map((c, i) => (
              <button
                key={c.key}
                className={`${styles.hemsMenuItem} ${i === activeIndex ? styles.hemsMenuActive : ''}`}
                onClick={() => onCatClick(i)}
              >
                {c.menu}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.hemsRight}>
          <img src="/houseproduct.png" alt="Haus mit Solaranlage, Wallbox und E-Auto" className={styles.hemsPhoto} />
          <div className={styles.hemsShade} />
          {/* connecting wires from the HEMS hub to each device; drawn on scroll */}
          <svg
            className={styles.hemsLines}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            data-ready={pinsReady ? 'true' : 'false'}
            ref={linesRef}
          >
            {HEMS_LINKS.map((p) => (
              <g key={p.title} className={styles.hemsLink}>
                <path className={styles.hemsTrack} d="" pathLength={1} />
                <path className={styles.hemsWire} d="" pathLength={1} />
                <path className={styles.hemsCharge} d="" pathLength={1} />
              </g>
            ))}
          </svg>
          {/* Figma "Hotspot" set — a dot + glass pill per device, wired to the HEMS hub.
              Only the live device (its category is the active one) is highlighted with
              a solid white disc + red dot; the rest keep a plain white dot. */}
          {HEMS_PINS.map((pin) => {
            const catIdx = HEMS_CATS.findIndex((c) => c.pin === pin.title);
            return (
              <Hotspot
                key={pin.title}
                title={pin.title}
                sub={pin.sub}
                layout={pin.variant}
                ready={pinsReady}
                active={pinsReady && activeIndex === catIdx}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ConnectedHome;
