'use client';

import { useEffect, useRef } from 'react';
import styles from './hero.module.css';
import { AiChat, type AiChatSuggestion } from '@/components/chat/AiChat';
import Navbar from '@/components/Navbar/Navbar';
import { buildEntranceTl } from '@/lib/entrance';
import { emitEon } from '@/lib/eventBus';

const HERO_VIDEO = '/hero-eon.mp4';

/* quick-prompt chips — each opens the onboarding journey with its topic */
const SUGGESTIONS: AiChatSuggestion[] = [
  { id: 'strom-tarif', label: 'Strom-Tarif für mich finden', interactive: true },
  { id: 'wallbox', label: 'Wallbox und passender Autostrom-Tarif', interactive: false },
  { id: 'solar', label: 'Lohnt sich Solar mit Wärmepumpe?', interactive: false },
  { id: 'kosten', label: 'Wie senke ich meine Energiekosten?', interactive: false },
];

export default function Hero() {
  const heroRef     = useRef<HTMLElement>(null);
  const introRef    = useRef<HTMLDivElement>(null);
  const barRef      = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const navRef      = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef  = useRef<HTMLParagraphElement>(null);
  const chatCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = {
      intro: introRef.current, bar: barRef.current, video: videoRef.current, nav: navRef.current,
      headline: headlineRef.current, subhead: subheadRef.current, chatCard: chatCardRef.current,
    };
    if (Object.values(els).some((e) => !e)) return;

    const navItems = Array.from(els.nav!.querySelectorAll<HTMLElement>('[data-nav-item]'));

    let tl: ReturnType<typeof buildEntranceTl> | null = null;
    document.fonts.ready.then(() => {
      tl = buildEntranceTl({
        introEl: els.intro!,
        introBarEl: els.bar!,
        videoEl: els.video!,
        navItems,
        headlineEl: els.headline!,
        subheadEl: els.subhead!,
        chatCardEl: els.chatCard!,
      });
      tl.play();
    });

    return () => { tl?.kill(); };
  }, []);

  return (
    <section className={styles.hero} ref={heroRef} aria-label="Hero">
      {/* Full-bleed video background */}
      <div className={styles.videoWrap}>
        <video
          ref={videoRef}
          className={styles.video}
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      {/* Navbar — transparent variant (white content over the video) */}
      <Navbar variant="transparent" className={styles.nav} ref={navRef} />

      {/* Centred copy */}
      <div className={styles.center}>
        <h1 className={styles.headline} ref={headlineRef}>Energie für Dich</h1>
        <p className={styles.subhead} ref={subheadRef}>Deutschlands führender Energiepartner.</p>
      </div>

      {/* Chat card — floats over the video near the bottom (suggestions variant) */}
      <div className={styles.chatWrap}>
        <AiChat
          variant="suggestions"
          ref={chatCardRef}
          suggestions={SUGGESTIONS}
          onSuggestion={(id) => emitEon('eon:journey-start', { type: id })}
          onSend={() => emitEon('eon:journey-start', { type: 'chat' })}
        />
      </div>

      {/* Red splash / preloader — covers the hero on first load, then lifts away */}
      <div className={styles.intro} ref={introRef} aria-hidden="true">
        <div className={styles.introInner}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.introLogo} src="/icons/logo.svg" alt="" />
          <div className={styles.introBar}>
            <div className={styles.introBarFill} ref={barRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
