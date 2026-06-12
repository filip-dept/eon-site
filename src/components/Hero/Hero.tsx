'use client';

import { useEffect, useRef } from 'react';
import styles from './hero.module.css';
import ChatWidget from './ChatWidget';
import Navbar from '@/components/Navbar/Navbar';
import { initMask } from '@/lib/mask';
import { buildEntranceTl } from '@/lib/entrance';
import { initScroll } from '@/lib/parallax';
import { ScrollTrigger } from '@/lib/gsap';

const HERO_VIDEO = '/hero-video.mp4';

export default function Hero() {
  const heroRef       = useRef<HTMLElement>(null);
  const frameRef      = useRef<HTMLDivElement>(null);
  const svgRef        = useRef<SVGSVGElement>(null);
  const maskRef       = useRef<SVGMaskElement>(null);
  const mediaRef      = useRef<SVGForeignObjectElement>(null);
  const videoRef      = useRef<HTMLVideoElement>(null);
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
      mask: maskRef.current, media: mediaRef.current, video: videoRef.current,
      revealRect: revealRectRef.current,
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
      mediaEl: els.media!,
      revealRectEl: els.revealRect!,
      chatCutEl: els.chatCut!,
      scrollCutEl: els.scrollCut!,
      chatCardEl: els.chatCard!,
      scrollIndicatorEl: els.scrollInd!,
    });

    const st = initScroll(els.hero!, mask);

    function relayout() {
      mask.layout();
      ScrollTrigger.refresh();
    }

    let resizeRaf = 0;
    function onResize() {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(relayout);
    }
    window.addEventListener('resize', onResize);

    let tl: ReturnType<typeof buildEntranceTl> | null = null;
    document.fonts.ready.then(() => {
      relayout();              // re-measure once fonts settle layout
      const chips = Array.from(els.chatCard!.querySelectorAll<HTMLElement>('[data-chip]'));

      tl = buildEntranceTl({
        mask,
        mediaEl: els.video!,
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

        {/* ── Navbar (brand variant — white content on red) ─────────── */}
        <Navbar variant="brand" className={styles.nav} ref={navRef} />

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className={styles.body}>
          <div className={styles.textWrap}>
            <h1 className={styles.headline} ref={headlineRef}>Energie für Dich</h1>
            <p className={styles.subhead} ref={subheadRef}>Deutschlands führender Energiepartner.</p>
          </div>

          {/* Media frame — 1:1.35 portrait, taller than the first viewport */}
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
              {/* mask lives on the static group — the video can zoom inside
                  it without dragging the mask geometry along */}
              <g mask="url(#heroMask)">
                <foreignObject ref={mediaRef} className={styles.mediaBox}>
                  <video
                    ref={videoRef}
                    className={styles.mediaVideo}
                    src={HERO_VIDEO}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </foreignObject>
              </g>
            </svg>

            {/* Chat card — its top border aligns with the top of the image */}
            <div className={styles.chatWrap}>
              <ChatWidget ref={chatCardRef} />
            </div>

            {/* Scroll indicator — two bare chevrons pulsing downward, sticky near the viewport bottom */}
            <button
              className={styles.scrollIndicator}
              ref={scrollIndRef}
              aria-label="Nach unten scrollen"
              onClick={() => window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' })}
            >
              {[0, 1].map((i) => (
                <svg
                  key={i}
                  className={styles.scrollChevron}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M5 9L12 16L19 9"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ))}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
