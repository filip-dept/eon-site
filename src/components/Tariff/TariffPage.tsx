'use client';

import { useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import styles from './tariff.module.css';

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.75}}>
    <path d="M12 21c-4-4-7-7.3-7-10a7 7 0 1 1 14 0c0 2.7-3 6-7 10z"/><circle cx="12" cy="11" r="2"/>
  </svg>
);
const PersonsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.75}}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const PlugIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.75}}>
    <path d="M12 2v6M8 6h8M7 12h10l-1 7H8l-1-7z"/><path d="M12 19v3"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="13" stroke="#ea1b0a" strokeWidth="1.5"/>
    <path d="M8 14l4 4 8-8" stroke="#ea1b0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="10" height="14" viewBox="0 0 10 16" fill="none">
    <path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M1 1h16M1 7h16M1 13h16"/>
  </svg>
);
const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/>
    <path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/>
  </svg>
);
const HomeGreenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1ea354" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>
  </svg>
);
const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4"/>
  </svg>
);

/* ─── Preference slider ───────────────────────────────────────────────────── */
function PrefSlider({ groupLabel, left, right, pct = 55 }: {
  groupLabel: string; left: string; right: string; pct?: number;
}) {
  return (
    <div className={styles.prefItem}>
      <span className={styles.prefLabel}>{groupLabel}</span>
      <div className={styles.prefSlider}>
        <div className={styles.prefSliderLabels}>
          <span>{left}</span><span>{right}</span>
        </div>
        <div className={styles.prefSliderTrack}>
          <div className={styles.prefSliderFill} style={{ width: `${pct}%` }} />
          <div className={styles.prefSliderThumb} style={{ left: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Animation helpers ───────────────────────────────────────────────────── */
// data-al = from left, data-ar = from right, data-ad = drop from above, data-au = rise from below

function qa(frame: HTMLElement, sel: string) {
  return Array.from(frame.querySelectorAll(sel)) as HTMLElement[];
}

function setHidden(frame: HTMLElement) {
  const al = qa(frame, '[data-al]');
  const ar = qa(frame, '[data-ar]');
  const ad = qa(frame, '[data-ad]');
  const au = qa(frame, '[data-au]');
  if (al.length) gsap.set(al, { x: -56, opacity: 0 });
  if (ar.length) gsap.set(ar, { x: 56, opacity: 0 });
  if (ad.length) gsap.set(ad, { y: -44, opacity: 0 });
  if (au.length) gsap.set(au, { y: 36, opacity: 0 });
}

function revealFrame(frame: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.8 } });
  const al = qa(frame, '[data-al]');
  const ar = qa(frame, '[data-ar]');
  const ad = qa(frame, '[data-ad]');
  const au = qa(frame, '[data-au]');
  if (al.length) tl.to(al, { x: 0, opacity: 1, stagger: 0.07 }, 0.04);
  if (ar.length) tl.to(ar, { x: 0, opacity: 1, stagger: 0.07 }, 0.1);
  if (ad.length) tl.to(ad, { y: 0, opacity: 1, stagger: 0.1, duration: 0.65 }, 0);
  if (au.length) tl.to(au, { y: 0, opacity: 1, stagger: 0.06, duration: 0.55 }, 0.4);
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function TariffPage() {
  const params  = useSearchParams();
  const plz     = params.get('plz')     ?? '81245';
  const persons = params.get('persons') ?? '2';
  const kwh     = params.get('kwh')     ?? '3200';
  const kwhFormatted = Number(kwh).toLocaleString('de-DE');

  const pageRef    = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page    = pageRef.current;
    const section = sectionRef.current;
    const track   = trackRef.current;
    if (!page || !section || !track) return;

    const frames = Array.from(track.children) as HTMLElement[];
    frames.forEach((f, i) => (i === 0 ? revealFrame(f) : setHidden(f)));

    /* Size frames off clientWidth (excludes scrollbar) so the track lands flush */
    const setFrameWidth = () =>
      track.style.setProperty('--fw', `${document.documentElement.clientWidth - 32}px`);
    setFrameWidth();
    window.addEventListener('resize', setFrameWidth);

    /* +16 = trailing track padding that scrollWidth doesn't report */
    const getDist = () => track.scrollWidth + 16 - document.documentElement.clientWidth;

    /* Vertical scroll drives continuous horizontal motion (scrubbed = smooth) */
    const tween = gsap.to(track, {
      x: () => -getDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${getDist()}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          /* nav hides + context bar becomes a floating modal once scrolling starts */
          page.classList.toggle(styles.scrolled, self.progress > 0.015);
          /* sliders collapse out of the floating modal on the later frames */
          page.classList.toggle(styles.compact, self.progress > 0.52);
        },
      },
    });

    /* Per-frame entrance animations, triggered inside the horizontal container */
    const triggers = frames.slice(1).map((frame) =>
      ScrollTrigger.create({
        trigger: frame,
        containerAnimation: tween,
        start: 'left 72%',
        once: true,
        onEnter: () => revealFrame(frame),
      })
    );

    /* re-measure once the pin spacer exists (scrollbar changes clientWidth) */
    requestAnimationFrame(() => {
      setFrameWidth();
      ScrollTrigger.refresh();
    });
    const settle = setTimeout(() => {
      setFrameWidth();
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(settle);
      window.removeEventListener('resize', setFrameWidth);
      triggers.forEach((t) => t.kill());
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className={styles.page} ref={pageRef}>

      {/* ── Fixed top nav (transparent, hides on scroll) ── */}
      <header className={styles.topBar}>
        <nav className={styles.nav}>
          <div className={styles.navLeft}>
            <a href="/" className={styles.navLogo} aria-label="E.ON">
              <img src="/icons/logo-red.svg" alt="E.ON" width="96" height="28" />
            </a>
            <ul className={styles.navLinks}>
              {['Mieter', 'Eigenheimbesitzer', 'Geschäftskunden'].map(l => (
                <li key={l}><a href="#" className={styles.navLink}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div className={styles.navRight}>
            <button className={styles.navIconBtn} aria-label="Ideen"><img src="/icons/bulb.svg" alt="" /></button>
            <button className={styles.navIconBtn} aria-label="Suche"><img src="/icons/search.svg" alt="" /></button>
            <a href="#" className={styles.navAccount}><img src="/icons/user.svg" alt="" /> Meine E.ON</a>
            <div className={styles.navDivider} />
            <button className={styles.navMenuBtn} aria-label="Menü"><MenuIcon /></button>
          </div>
        </nav>
      </header>

      {/* ── Context bar (in-flow look, hides on scroll) ── */}
      <div className={styles.ctxWrap}>
        <div className={styles.contextLeft}>
          <span className={styles.contextItem}><LocationIcon />{plz}</span>
          <div className={styles.contextSep} />
          <span className={styles.contextItem}><PersonsIcon />{persons} Pers.</span>
          <div className={styles.contextSep} />
          <span className={styles.contextItem}><PlugIcon />{kwhFormatted} kWh</span>
          <div className={styles.contextSep} />
          <a href="/" className={styles.contextEdit}>Ändern</a>
        </div>
        <div className={styles.contextRight}>
          <PrefSlider groupLabel="Ich lege Wert auf" left="Flexibilität" right="Sicherheit" pct={55} />
          <div className={styles.contextSep} />
          <PrefSlider groupLabel="Mir ist wichtiger" left="Preis" right="Nachhaltigkeit" pct={55} />
        </div>
      </div>

      {/* ── Floating modal (appears during horizontal scroll) ── */}
      <div className={styles.floatBar}>
        <div className={styles.floatInputs}>
          <span className={styles.floatLabel}>Deine Eingaben</span>
          <a href="/" className={styles.contextEdit}>Ändern</a>
        </div>
        <div className={styles.floatDivider} />
        <div className={styles.floatSliders}>
          <PrefSlider groupLabel="" left="Flexibilität" right="Sicherheit" pct={55} />
          <PrefSlider groupLabel="" left="Preis" right="Nachhaltigkeit" pct={55} />
          <div className={styles.floatDivider} />
        </div>
        <div className={styles.floatTariff}>
          <div className={styles.floatTariffText}>
            <span className={styles.floatTariffName}>E.ON SolarStrom Extra 12</span>
            <span className={styles.floatTariffPrice}>55,80 € pro Monat</span>
          </div>
          <button className={styles.cartBtn} aria-label="Zum Warenkorb"><CartIcon /></button>
        </div>
      </div>

      {/* ── Pinned horizontal section ── */}
      <section className={styles.scrollSection} ref={sectionRef}>
        <div className={styles.track} ref={trackRef}>

          {/* ═══ Frame 1: Hero + Tariff card ═══ */}
          <div className={`${styles.frame} ${styles.frameHero}`}>
            <div className={styles.frameImage}>
              <img src="/tariff-hero.png" alt="E.ON Kundin" />
              <div className={styles.socialProof}>
                <div className={styles.avatars}>
                  {[0,1,2].map(i => (
                    <div key={i} className={styles.avatar} style={{
                      background: ['#e8c9a0','#b8d4e8','#c8e0c8'][i],
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                    }}>
                      {['👩','👨','👩‍🦱'][i]}
                    </div>
                  ))}
                </div>
                <div className={styles.socialText}>
                  <p className={styles.socialPct}>68% der Haushalte</p>
                  <p className={styles.socialDesc}>mit ähnlichem Verbrauch wählen diesen Tarif</p>
                </div>
                <button className={styles.socialCta}>Mehr entdecken</button>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader} data-al>
                <h1 className={styles.panelTitle}>Dein Stromtarif,<br />in 15 Sekunden</h1>
                <p className={styles.panelSub}>Ehrlich erklärt, was deinen Tarif besonders macht – und warum du mit E.ON richtig liegst.</p>
              </div>

              <div className={styles.card} data-au>
                <div className={styles.cardNav}>
                  <span className={styles.cardTitle}>E.ON SolarStrom Extra 12</span>
                  <span className={styles.cardBadge}>Unsere Empfehlung für dich</span>
                </div>
                <p className={styles.cardSub}>12 Mo | Solar DE</p>
                <div className={styles.cardBody}>
                  <div className={styles.priceRow}>
                    <div className={styles.priceBlock}>
                      <span className={styles.priceMain}>55,80</span>
                      <span className={styles.priceUnit}>€ pro Monat</span>
                    </div>
                    <div className={styles.bonusBadge}>
                      <svg className={styles.bonusIcon} viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="12" stroke="#8215b4" strokeWidth="1.5"/>
                        <path d="M11 16l3 3 7-7" stroke="#8215b4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className={styles.bonusText}>75 € Neukunden-Bonus</span>
                      <span className={styles.bonusDate}>bis 20.04.2026</span>
                    </div>
                  </div>
                  <div className={styles.divider} />
                  <div className={styles.features}>
                    {[
                      ['12 Monaten','Preisgarantie'],
                      ['100% Solarstrom','aus deutschen Anlagen'],
                      ['Monatlich kündbar','nach der Mindestlaufzeit'],
                    ].map(([name, desc]) => (
                      <div key={name} className={styles.feature}>
                        <CheckCircleIcon />
                        <div className={styles.featureText}>
                          <span className={styles.featureName}>{name}</span>
                          <span className={styles.featureDesc}>{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.cardBtns}>
                    <button className={styles.btnPrimary}>Tarif auswählen</button>
                    <button className={styles.btnSecondary}>Tarif vergleichen <ChevronRight /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Frame 2: Editorial "28 cent" intro ═══ */}
          <div className={`${styles.frame} ${styles.frameEditorial}`}>
            <div className={styles.editorialContent} data-al>
              <span className={styles.editorialLabel}>Unsere Stromtransparenz</span>
              <h2 className={styles.editorialTitle}>Was passiert mit deinen 28 Cent?</h2>
              <p className={styles.editorialDesc}>
                Ehrlich erklärt, was deinen Tarif besonders macht – und warum du mit E.ON richtig liegst.
              </p>
            </div>
            <img src="/tariff-woman-car.png" className={styles.edPhotoTopRight} alt="" data-ar />
            <img src="/tariff-man.png" className={styles.edPhotoBottomLeft} alt="" data-au />
          </div>

          {/* ═══ Frame 3: Stacked bars visualization ═══ */}
          <div className={`${styles.frame} ${styles.frameBars}`}>
            <div className={styles.barsLeft}>
              <div className={styles.editorialContent} data-al>
                <span className={styles.editorialLabel}>Unsere Stromtransparenz</span>
                <h2 className={styles.editorialTitle}>Was passiert mit deinen 28 Cent?</h2>
                <p className={styles.editorialDesc}>
                  Ehrlich erklärt, was deinen Tarif besonders macht – und warum du mit E.ON richtig liegst.
                </p>
              </div>

              <div className={styles.hubWrap} data-au>
                <img src="/tariff-man.png" className={styles.hubPhoto} alt="" />
                <div className={styles.hubCard}>
                  <div className={styles.hubCardLeft}>
                    <div className={styles.articleTag}><DocIcon /> Energie Hub</div>
                    <p className={styles.articleTitle}>Was passiert mit deinen 28 Cent?</p>
                    <button className={styles.articleLink}><ChevronRight /> Mehr lesen</button>
                  </div>
                  <img src="/tariff-man.png" className={styles.hubThumb} alt="" />
                </div>
              </div>
            </div>

            <div className={styles.barsPanel}>
              <div className={styles.stackedBars}>
                <div className={`${styles.bar} ${styles.barBack}`} data-ad>
                  <span className={styles.barPctSm}>21%</span>
                </div>
                <div className={`${styles.bar} ${styles.barMid}`} data-ad>
                  <span className={styles.barPctSm}>32%</span>
                </div>
                <div className={`${styles.bar} ${styles.barFront}`} data-ad>
                  <span className={styles.barPct}>47%</span>
                  <div className={styles.barFooter}>
                    <span>Strom-Einkauf + Vertrieb</span>
                    <span className={styles.barCt}>13,10 ct</span>
                  </div>
                </div>
              </div>

              <div className={styles.totalPrice} data-au>
                <span className={styles.totalLabel}>Gesamtpreis</span>
                <span className={styles.totalValue}>28,13 ct/kWh</span>
              </div>

              <div className={styles.orbDock}>
                <div className={styles.orb} />
              </div>
            </div>
          </div>

          {/* ═══ Frame 4: Full breakdown ═══ */}
          <div className={`${styles.frame} ${styles.frameBreakdown}`}>

            <div className={styles.bdCols}>
              {[
                { bg: '#d63a1f', pct: '47%', price: '13,10', desc: 'Was wir am Markt zahlen und intern abwickeln', cat: 'Strom-Einkauf + Vertrieb', ct: null },
                { bg: '#ac0000', pct: '32%', price: '9,10',  desc: 'Was der Staat einbehält', cat: 'Steuern & Abgaben', ct: '9,10 ct' },
                { bg: '#8a247f', pct: '21%', price: '5,93',  desc: 'Was der Stromtransport kostet', cat: 'Netzentgelte', ct: '5,93 ct' },
              ].map(col => (
                <div key={col.pct} className={styles.bdCol} style={{ background: col.bg }} data-ad>
                  <div className={styles.colTop}>
                    <span className={styles.colPct}>{col.pct}</span>
                    <div className={styles.colPrice}>
                      <span className={styles.colPriceMain}>{col.price}</span>
                      <span className={styles.colPriceUnit}>ct/kWh</span>
                    </div>
                    <p className={styles.colDesc}>{col.desc}</p>
                  </div>
                  <div className={styles.colFooter}>
                    <span>{col.cat}</span>
                    {col.ct && <span className={styles.colFooterCt}>{col.ct}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.bdItems}>
              <div className={styles.lineItemCol}>
                {[
                  ['Beschaffung am Strommarkt', '7,80 ct'],
                  ['Vertrieb, Service & Abrechnung', '2,30 ct'],
                ].map(([label, val]) => (
                  <div key={label} className={styles.lineItem} data-au>
                    <span className={styles.lineLabel}>{label}</span>
                    <span className={styles.lineVal}>{val}</span>
                  </div>
                ))}
                <div className={styles.lineItem} data-au>
                  <span className={styles.lineLabel}>
                    Zukunftsprojekte (Wind- und Solar-Ausbau)
                    <span className={styles.lineInfo}><InfoIcon /></span>
                  </span>
                  <span className={styles.lineValGreen}><span className={styles.greenChip}><HomeGreenIcon /></span> 3,00 ct</span>
                </div>
              </div>
              <div className={styles.lineItemCol}>
                {[
                  ['Mehrwertsteuer (Anteilig)', '4,18 ct'],
                  ['Stromsteuer', '2,05 ct'],
                  ['KWK-/§19-Umlage', '1,60 ct'],
                  ['Konzessionsabgabe', '1,27 ct'],
                ].map(([label, val]) => (
                  <div key={label} className={styles.lineItem} data-au>
                    <span className={styles.lineLabel}>{label}</span>
                    <span className={styles.lineVal}>{val}</span>
                  </div>
                ))}
              </div>
              <div className={styles.lineItemCol}>
                {[
                  ['Verteilnetz (Vor Ort)', '3,78 ct'],
                  ['Vertrieb, Service & Abrechnung', '2,15 ct'],
                ].map(([label, val]) => (
                  <div key={label} className={styles.lineItem} data-au>
                    <span className={styles.lineLabel}>{label}</span>
                    <span className={styles.lineVal}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.bdFooter}>
              <div className={styles.totalPrice} data-au>
                <span className={styles.totalLabel}>Gesamtpreis</span>
                <span className={styles.totalValue}>28,13 ct/kWh</span>
              </div>
              <div className={styles.voiceDock} data-au>
                <div className={styles.orb} />
                <div className={styles.voiceDivider} />
                <button className={styles.micBtn} aria-label="Spracheingabe"><MicIcon /></button>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
