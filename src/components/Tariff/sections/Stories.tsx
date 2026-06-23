import { Icon } from '@/ui/Icon';
import styles from '../tariff.module.css';

const STORY_CARDS = [
  { cls: styles.storyCard1, img: '/tariff-man.png', title: 'Was heißt hier Ökostrom?', sub: 'Kein Marketing – ein Nachweis.' },
  { cls: styles.storyCard2, img: '/tariff-hero.png', title: 'Dein Preis, fair erklärt', sub: 'Wir zeigen dir jeden Cent davon.' },
  { cls: styles.storyCard3, img: '/tariff-woman-car.png', title: 'Wechseln in Minuten', sub: 'Du klickst – Wir kümmern uns.' },
];

/**
 * Stories — the "what's behind your tariff" intro + the parallax card collage.
 * Presentational/static; the scroll choreography (per-card parallax `cardParallax`,
 * the white→gradient `zoneBgST` bg switch) stays in TariffPage and targets these by
 * the shared `tariff.module.css` class names (`.storyCard`, `.storiesText`).
 */
export function Stories() {
  return (
    <>
      {/* Stories text — scrolls normally, nothing sticky */}
      <section className={styles.storiesIntro}>
        <div className={styles.storiesText}>
          <span className={styles.storiesLabel}>Passend zu deinem Tarif</span>
          <h2 className={styles.storiesTitle}>Was hinter deinem Tarif steckt.</h2>
          <p className={styles.storiesDesc}>
            Kurze Stories, die zeigen, was deinen Günstig-Tarif ausmacht – Ökostrom, fairer Preis, persönlicher Service.
          </p>
        </div>
      </section>

      {/* Stories images — frame pins briefly; cards bounce in, then up & out */}
      <section className={styles.stories}>
        <div className={styles.storiesStage}>
          {STORY_CARDS.map((card) => (
            <div key={card.title} className={`${styles.storyCard} ${card.cls}`}>
              {/* inner wrapper carries the magnetic pull + 3D tilt (useMagneticStories);
                  the card itself is reserved for the scroll-driven parallax `y` */}
              <div className={styles.storyInner}>
                <img src={card.img} alt="" className={styles.storyMedia} />
                <div className={styles.storyShade} />
                <div className={styles.storyPlay}><Icon name="play-carrier" /></div>
                <div className={styles.storyCaption}>
                  <p className={styles.storyCaptionTitle}>{card.title}</p>
                  <p className={styles.storyCaptionSub}>{card.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Stories;
