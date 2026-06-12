'use client';

import { forwardRef, type CSSProperties } from 'react';
import styles from './navbar.module.css';

export type NavbarVariant = 'transparent' | 'solid';

const LINKS = ['Strom', 'Erdgas', 'Solar', 'E-Mobilität', 'Energiemanagement', 'Wärmepumpe'];

/* icon shape comes from the SVG file via mask; color from currentColor */
function Icon({ src, w = 20, h = 20 }: { src: string; w?: number; h?: number }) {
  return (
    <span
      className={styles.icon}
      style={{ width: w, height: h, '--icon': `url(${src})` } as CSSProperties}
      aria-hidden="true"
    />
  );
}

interface NavbarProps {
  /** transparent = white content over media; solid = white pill for light pages */
  variant: NavbarVariant;
  className?: string;
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  { variant, className },
  ref
) {
  const solid = variant === 'solid';
  return (
    <nav
      ref={ref}
      className={`${styles.nav} ${solid ? styles.solid : styles.transparent} ${className ?? ''}`}
      aria-label="Hauptnavigation"
    >
      <div className={styles.left}>
        <a href="/" className={styles.logo} aria-label="E.ON Startseite" data-nav-item>
          <img
            src={solid ? '/icons/logo-red.svg' : '/icons/logo.svg'}
            alt="E.ON"
            width="96"
            height="28"
          />
        </a>
        <ul className={styles.links}>
          {LINKS.map((label) => (
            <li key={label}>
              <a href="#" className={styles.link} data-nav-item>{label}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.icons}>
        <button className={styles.iconBtn} aria-label="Ideen" data-nav-item>
          <Icon src="/icons/bulb.svg" />
        </button>
        <button className={styles.iconBtn} aria-label="Suche" data-nav-item>
          <Icon src="/icons/search.svg" />
        </button>
        <a href="#" className={styles.account} data-nav-item>
          <Icon src="/icons/user.svg" w={16} h={20} />
          Mein E.ON
        </a>
      </div>
    </nav>
  );
});

export default Navbar;
