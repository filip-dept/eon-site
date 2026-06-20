import css from './TariffPreview.module.css';

/* star-in-circle bonus glyph (mirrors the tariff card's bonus icon) */
const RewardIcon = () => (
  <svg className={css.tpBonusIcon} width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 7.5l1.9 3.85 4.25.62-3.08 3 .73 4.23L14 17.2l-3.8 2 .73-4.23-3.08-3 4.25-.62L14 7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

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
          <span className={css.tpBonus}><RewardIcon />75 € Neukunden-Bonus <em>bis 20.04.2026</em></span>
        </div>
      </div>
    </div>
  );
}

export default TariffPreview;
