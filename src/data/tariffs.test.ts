import { describe, it, expect } from 'vitest';
import { TARIFFS, stopsFor, snapTo, tariffFor } from './tariffs';

describe('tariff selection logic', () => {
  it('has three tariffs per family', () => {
    expect(TARIFFS.standard).toHaveLength(3);
    expect(TARIFFS.zukunft).toHaveLength(3);
  });

  it('tariffFor picks within the family by slider position', () => {
    // eco=true → Zukunft family; p maps Flexibilität→Sicherheit to [0,1,2]
    expect(tariffFor(true, 6).id).toBe('zukunft-flex');
    expect(tariffFor(true, 50).id).toBe('zukunft-extra-12');
    expect(tariffFor(true, 94).id).toBe('zukunft-festpreis-24');
    // eco=false → Standard family
    expect(tariffFor(false, 6).id).toBe('oeko-flex');
    expect(tariffFor(false, 94).id).toBe('festpreis-24');
  });

  it('snapTo snaps a position to the nearest stop', () => {
    const stops = stopsFor(true); // [6, 50, 94]
    expect(snapTo(0, stops)).toBe(6);
    expect(snapTo(40, stops)).toBe(50);
    expect(snapTo(60, stops)).toBe(50);
    expect(snapTo(100, stops)).toBe(94);
  });
});
