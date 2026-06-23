import type { Tariff } from '@/types/Tariff';
import { Icon } from '@/ui/Icon';
import css from './TariffPreview.module.css';

/**
 * TariffPreview — the selected-tariff card shown on the checkout Review step
 * (photo with a floating info panel). Mirrors the tariff chosen on the tariff
 * page (passed in as `tariff`). Will fold into a shared `Card` + `Price`/`Badge` later.
 */
export function TariffPreview({ tariff, showBadge = true }: { tariff: Tariff; showBadge?: boolean }) {
  return (
    <div className={css.tariffPreview}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/tariff-hero.png" alt="" className={css.tpPhoto} />
      <div className={css.tpFooter}>
        <div className={css.tpNameRow}>
          <span className={css.tpName}>{tariff.name}</span>
          {showBadge && <span className={css.tpBadge}>Unsere Empfehlung für dich</span>}
        </div>
        <span className={css.tpSub}>{tariff.sub}</span>
        <div className={css.tpPriceRow}>
          <span className={css.tpPrice}><strong>{tariff.price}</strong> € pro Monat</span>
          <span className={css.tpBonus}><Icon name="bonus" size={22} className={css.tpBonusIcon} />{tariff.bonus} <em>{tariff.bonusUntil}</em></span>
        </div>
      </div>
    </div>
  );
}

export default TariffPreview;
