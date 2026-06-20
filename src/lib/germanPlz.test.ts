import { describe, it, expect } from 'vitest';
import { suggestPlz } from './germanPlz';

describe('suggestPlz', () => {
  it('returns [code, city] pairs whose codes match the prefix', () => {
    const out = suggestPlz('20');
    expect(out.length).toBeGreaterThan(0);
    for (const [code, city] of out) {
      expect(code.startsWith('20')).toBe(true);
      expect(typeof city).toBe('string');
      expect(city.length).toBeGreaterThan(0);
    }
  });

  it('respects the limit', () => {
    expect(suggestPlz('1', 3).length).toBeLessThanOrEqual(3);
  });

  it('returns nothing for a non-matching prefix', () => {
    expect(suggestPlz('99999999')).toHaveLength(0);
  });
});
