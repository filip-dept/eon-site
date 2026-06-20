'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import styles from './hero.module.css';
import { AiChat, type AiChatSuggestion } from '@/components/chat/AiChat';
import Navbar from '@/components/Navbar/Navbar';
import { buildEntranceTl } from '@/lib/entrance';
import { emitEon, onEon } from '@/lib/eventBus';

/* layout effect on the client (runs before paint → no hero flash), no-op on the server */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

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
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const navRef      = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef  = useRef<HTMLParagraphElement>(null);
  const chatWrapRef = useRef<HTMLDivElement>(null);
  const chatCardRef = useRef<HTMLDivElement>(null);

  /* Set the hidden states + build the (paused) timeline before paint, then play
     it when the IntroLoader signals it is lifting away (`eon:intro-done`). A
     fallback timer covers the case where the cue never arrives. */
  useIsoLayoutEffect(() => {
    const els = {
      videoWrap: videoWrapRef.current, video: videoRef.current, nav: navRef.current,
      headline: headlineRef.current, subhead: subheadRef.current,
      chatWrap: chatWrapRef.current, chatCard: chatCardRef.current,
    };
    if (Object.values(els).some((e) => !e)) return;

    const navItems = Array.from(els.nav!.querySelectorAll<HTMLElement>('[data-nav-item]'));

    const tl = buildEntranceTl({
      videoWrapEl: els.videoWrap!,
      videoEl: els.video!,
      navItems,
      headlineEl: els.headline!,
      subheadEl: els.subhead!,
      chatWrapEl: els.chatWrap!,
      chatCardEl: els.chatCard!,
    });

    let played = false;
    const play = () => { if (played) return; played = true; tl.play(); };
    const off = onEon('eon:intro-done', play);
    const fallback = window.setTimeout(play, 4000); // safety net if no loader cues us

    return () => { off(); window.clearTimeout(fallback); tl.kill(); };
  }, []);

  return (
    <section className={styles.hero} ref={heroRef} aria-label="Hero">
      {/* Full-bleed video background */}
      <div className={styles.videoWrap} ref={videoWrapRef}>
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

      {/* Soft top gradient — lifts nav legibility over a bright video (below nav, above video) */}
      <div className={styles.navScrim} aria-hidden="true" />

      {/* Navbar — transparent variant (white content over the video) */}
      <Navbar variant="transparent" className={styles.nav} ref={navRef} />

      {/* Centred copy */}
      <div className={styles.center}>
        <h1 className={styles.headline} ref={headlineRef}>Energie für Dich</h1>
        <p className={styles.subhead} ref={subheadRef}>Deutschlands führender Energiepartner.</p>
      </div>

      {/* Chat card — floats over the video near the bottom (suggestions variant) */}
      <div className={styles.chatWrap} ref={chatWrapRef}>
        <AiChat
          variant="suggestions"
          ref={chatCardRef}
          suggestions={SUGGESTIONS}
          onSuggestion={(id) => emitEon('eon:journey-start', { type: id })}
          onSend={() => emitEon('eon:journey-start', { type: 'chat' })}
        />
      </div>
    </section>
  );
}
