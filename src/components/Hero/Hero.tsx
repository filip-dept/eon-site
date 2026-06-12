'use client';

import { useEffect, useRef } from 'react';
import styles from './hero.module.css';
import ChatWidget from './ChatWidget';
import Navbar from '@/components/Navbar/Navbar';
import { buildEntranceTl } from '@/lib/entrance';

const HERO_VIDEO = '/hero-eon.mp4';

export default function Hero() {
  const heroRef     = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const navRef      = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef  = useRef<HTMLParagraphElement>(null);
  const chatCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = {
      videoWrap: videoWrapRef.current, video: videoRef.current, nav: navRef.current,
      headline: headlineRef.current, subhead: subheadRef.current, chatCard: chatCardRef.current,
    };
    if (Object.values(els).some((e) => !e)) return;

    const navItems = Array.from(els.nav!.querySelectorAll<HTMLElement>('[data-nav-item]'));

    let tl: ReturnType<typeof buildEntranceTl> | null = null;
    document.fonts.ready.then(() => {
      tl = buildEntranceTl({
        videoWrapEl: els.videoWrap!,
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

      {/* Navbar — transparent variant (white content over the video) */}
      <Navbar variant="transparent" className={styles.nav} ref={navRef} />

      {/* Centred copy */}
      <div className={styles.center}>
        <h1 className={styles.headline} ref={headlineRef}>Energie für Dich</h1>
        <p className={styles.subhead} ref={subheadRef}>Deutschlands führender Energiepartner.</p>
      </div>

      {/* Chat card — floats over the video near the bottom */}
      <div className={styles.chatWrap}>
        <ChatWidget ref={chatCardRef} />
      </div>
    </section>
  );
}
