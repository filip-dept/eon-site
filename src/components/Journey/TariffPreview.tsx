import { Icon } from '@/ui/Icon';
import css from './TariffPreview.module.css';

/**
 * TariffPreview — the selected-tariff card shown on the checkout Review step
 * (photo with a floating info panel). Content is placeholder until wired to the
 * real selection. Will fold into a shared `Card` + `Price`/`Badge` later.
 */
export function TariffPreview() {
  return (
    <div className={css.tariffPreview}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/tariff-hero.png" alt="" className={css.tpPhoto} />
      <div className={css.tpFooter}>
        <div className={css.tpNameRow}>
          <span className={css.tpName}>E.ON SolarStrom Extra 12</span>
          <span className={css.tpBadge}>Unsere Empfehlung für dich</span>
        </div>
        <span className={css.tpSub}>12 Mo | Solar DE</span>
        <div className={css.tpPriceRow}>
          <span className={css.tpPrice}><strong>55,80</strong> € pro Monat</span>
          <span className={css.tpBonus}><Icon name="bonus" size={22} className={css.tpBonusIcon} />75 € Neukunden-Bonus <em>bis 20.04.2026</em></span>
        </div>
      </div>
    </div>
  );
}

export default TariffPreview;
