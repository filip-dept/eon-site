'use client';

import { useEffect, useRef } from 'react';
import styles from './hero.module.css';
import ChatWidget from './ChatWidget';
import { initMask } from '@/lib/mask';
import { buildEntranceTl } from '@/lib/entrance';
import { initScroll } from '@/lib/parallax';
import { ScrollTrigger } from '@/lib/gsap';

/* Background taken from the Figma file. Swap for a video <video> when available. */
const HERO_IMAGE = '/real-bck.png';

export default function Hero() {
  const heroRef       = useRef<HTMLElement>(null);
  const frameRef      = useRef<HTMLDivElement>(null);
  const svgRef        = useRef<SVGSVGElement>(null);
  const maskRef       = useRef<SVGMaskElement>(null);
  const imageRef      = useRef<SVGImageElement>(null);
  const revealRectRef = useRef<SVGRectElement>(null);
  const chatCutRef    = useRef<SVGPathElement>(null);
  const scrollCutRef  = useRef<SVGCircleElement>(null);
  const navRef        = useRef<HTMLElement>(null);
  const headlineRef   = useRef<HTMLHeadingElement>(null);
  const subheadRef    = useRef<HTMLParagraphElement>(null);
  const chatCardRef   = useRef<HTMLDivElement>(null);
  const scrollIndRef  = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const els = {
      hero: heroRef.current, frame: frameRef.current, svg: svgRef.current,
      mask: maskRef.current, image: imageRef.current, revealRect: revealRectRef.current,
      chatCut: chatCutRef.current, scrollCut: scrollCutRef.current, nav: navRef.current,
      headline: headlineRef.current, subhead: subheadRef.current,
      chatCard: chatCardRef.current, scrollInd: scrollIndRef.current,
    };
    if (Object.values(els).some((e) => !e)) return;

    const navItems = Array.from(
      els.nav!.querySelectorAll<HTMLElement>('[data-nav-item]')
    );

    const mask = initMask({
      heroEl: els.hero!,
      frameEl: els.frame!,
      svgEl: els.svg!,
      maskEl: els.mask!,
      imageEl: els.image!,
      revealRectEl: els.revealRect!,
      chatCutEl: els.chatCut!,
      scrollCutEl: els.scrollCut!,
      chatCardEl: els.chatCard!,
      scrollIndicatorEl: els.scrollInd!,
    });

    const st = initScroll(els.hero!, mask);

    /* Size the hero so the page scrolls exactly to the end of the tall image */
    function applyHeroHeight() {
      mask.layout();
      els.hero!.style.height = mask.getHeroHeight() + 'px';
      ScrollTrigger.refresh();
    }

    let resizeRaf = 0;
    function onResize() {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(applyHeroHeight);
    }
    window.addEventListener('resize', onResize);

    /* Read the image's natural aspect ratio so it displays at full (tall) height */
    const probe = new window.Image();
    probe.onload = () => {
      mask.setImageAspect(probe.naturalHeight / probe.naturalWidth);
      applyHeroHeight();
    };
    probe.src = HERO_IMAGE;

    let tl: ReturnType<typeof buildEntranceTl> | null = null;
    document.fonts.ready.then(() => {
      applyHeroHeight();       // re-measure once fonts settle layout
      const chips = Array.from(els.chatCard!.querySelectorAll<HTMLElement>('[data-chip]'));

      tl = buildEntranceTl({
        mask,
        imageEl: els.image!,
        navItems,
        headlineEl: els.headline!,
        subheadEl: els.subhead!,
        chatCardEl: els.chatCard!,
        chips,
        scrollIndicatorEl: els.scrollInd!,
      });
      tl.play();
    });

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(resizeRaf);
      st.kill();
      tl?.kill();
    };
  }, []);

  return (
    <section className={styles.hero} ref={heroRef} aria-label="Hero">
      <div className={styles.stage}>

        {/* ── Navbar ───────────────────────────────────────────────── */}
        <nav className={styles.nav} ref={navRef} aria-label="Hauptnavigation">
          <div className={styles.navLeft}>
            <a href="/" className={styles.navLogo} aria-label="E.ON Startseite" data-nav-item>
              <img src="/icons/logo.svg" alt="E.ON" />
            </a>
            <ul className={styles.navLinks}>
              {['Privatkunden', 'Geschäftskunden', 'Über Uns'].map((label) => (
                <li key={label}>
                  <a href="#" className={styles.navLink} data-nav-item>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.navIcons}>
            <button className={styles.navIconBtn} aria-label="Ideen" data-nav-item>
              <img src="/icons/bulb.svg" alt="" />
            </button>
            <button className={styles.navIconBtn} aria-label="Suche" data-nav-item>
              <img src="/icons/search.svg" alt="" />
            </button>
            <a href="#" className={styles.navAccount} data-nav-item>
              <img src="/icons/user.svg" alt="" />
              Meine E.ON
            </a>
          </div>
        </nav>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className={styles.body}>
          <div className={styles.textWrap}>
            <h1 className={styles.headline} ref={headlineRef}>Energie für Dich</h1>
            <p className={styles.subhead} ref={subheadRef}>Deutschlands führender Energiepartner.</p>
          </div>

          {/* Media frame with subtractive mask */}
          <div className={styles.mediaFrame} ref={frameRef}>
            <svg className={styles.mediaSvg} ref={svgRef} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <mask id="heroMask" ref={maskRef}>
                  {/* white = visible (entrance wipe grows top→bottom). Outer rounding is CSS border-radius on the SVG. */}
                  <rect ref={revealRectRef} fill="white" />
                  {/* black = cut out (gradient shows through), sharp top / rounded bottom corners */}
                  <path ref={chatCutRef} fill="black" />
                  <circle ref={scrollCutRef} fill="black" />
                </mask>
              </defs>
              <image
                ref={imageRef}
                href={HERO_IMAGE}
                className={styles.mediaImage}
                mask="url(#heroMask)"
                preserveAspectRatio="xMidYMid slice"
              />
            </svg>

            {/* Chat card — its top border aligns with the top of the image */}
            <div className={styles.chatWrap}>
              <ChatWidget ref={chatCardRef} />
            </div>

            {/* Scroll indicator straddles the bottom edge */}
            <button
              className={styles.scrollIndicator}
              ref={scrollIndRef}
              aria-label="Nach unten scrollen"
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' })}
            >
              <svg viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="66" height="66" rx="33" fill="white" />
                <path
                  className={styles.scrollChevron}
                  d="M32.9988 38.2206L44.6088 26.6106L46.786 28.7879L32.9988 42.5751L19.2109 28.7872L21.3882 26.6099L32.9988 38.2206Z"
                  fill="#5C5C5C"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
