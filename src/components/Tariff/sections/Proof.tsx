import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import styles from './Proof.module.css';

/** Proof — the social-proof strip (independent: no scroll JS; the white panel just
 *  scrolls up over the fixed gradient). Extracted from TariffPage. */
export interface ProofProps {
  plz: string;
}

export function Proof({ plz }: ProofProps) {
  return (
    <div className={styles.proofWrap}>
      <section className={styles.proof}>
        <div className={styles.proofLeft}>
          <span className={styles.proofLabel}>In deiner Nähe</span>
          <h2 className={styles.proofTitle}>Du bist nicht der<br />Erste rund um</h2>
          <div className={styles.proofZip}>
            <Icon name="location" className="opacity-75" />
            <span className={styles.proofZipNum}>{plz}</span>
          </div>
          <p className={styles.proofDesc}>
            Diesen Monat haben 7 Haushalte rund um {plz} zu E.ON gewechselt.
            Drei davon erzählen, was sie überzeugt hat – echte Stimmen statt Werbeversprechen.
          </p>
        </div>

        <div className={styles.proofRight}>
          <img src="/proof-town.jpg" alt="Luftaufnahme der Nachbarschaft" className={`${styles.proofPhoto} ${styles.proofPhotoTown}`} />
          <img src="/hems-house.jpg" alt="Haus mit E-Auto" className={`${styles.proofPhoto} ${styles.proofPhotoHouse}`} />

          <div className={styles.proofCardStack}>
            <div className={styles.proofCardBehind} />
            <div className={styles.proofCard}>
              <div>
                <p className={styles.proofQuoteTitle}>In 10 Minuten gewechselt.</p>
                <p className={styles.proofQuoteText}>Bei E.ON hab ich das gute Gefühl, wirklich grün unterwegs zu sein. Da ich mit meinem Ökostrom nachhaltige Projekte in dieser Region unterstütze.</p>
              </div>
              <div className={styles.proofAuthor}>
                <div className={styles.proofAvatar}>AK</div>
                <div className={styles.proofAuthorMeta}>
                  <div className={styles.proofAuthorName}>Andrea K.</div>
                  <div className={styles.proofAuthorRow}>
                    <span className={styles.proofAuthorTariff}>Ökostrom 12</span>
                    <span className={styles.proofAuthorWhen}>Gewechselt vor 3 Wochen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.proofDots}>
            <div className={`${styles.proofDot} ${styles.proofDotActive}`} />
            <div className={styles.proofDot} />
            <div className={styles.proofDot} />
          </div>

          <div className={styles.proofStats}>
            <div className={styles.proofStat}>
              <span className={styles.proofStatNum}>~12 Min</span>
              <span className={styles.proofStatLabel}>bis zum Abschluss</span>
            </div>
            <div className={styles.proofStat}>
              <span className={styles.proofStatNum}>94%</span>
              <span className={styles.proofStatLabel}>würden wieder wechseln</span>
            </div>
            <Button variant="primary" className="ml-auto shrink-0 rounded-button">Mehr Erfahrungen</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Proof;
