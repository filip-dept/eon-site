import { describe, it, expect } from 'vitest';
import { cn } from './cn';

/* Guards the load-bearing tailwind-merge custom config: without it, tailwind-merge
   mistakes our custom font-size keys for colours and our custom radii for unknowns,
   silently dropping classes. These tests lock that behaviour in. */
describe('cn (tailwind-merge with custom token groups)', () => {
  it('keeps a custom font-size AND a text colour together (the bug that dropped text-white)', () => {
    const out = cn('text-copy-lg', 'text-white');
    expect(out).toContain('text-copy-lg');
    expect(out).toContain('text-white');
  });

  it('keeps a responsive heading size with a brand text colour', () => {
    const out = cn('text-heading-1', 'text-brand-red');
    expect(out).toContain('text-heading-1');
    expect(out).toContain('text-brand-red');
  });

  it('treats two font-sizes as one group (last wins)', () => {
    expect(cn('text-copy-md', 'text-copy-lg')).toBe('text-copy-lg');
  });

  it('lets a custom radius override another radius (rounded-button beats rounded-md)', () => {
    expect(cn('rounded-md', 'rounded-button')).toBe('rounded-button');
  });

  it('still does ordinary conditional + dedupe merging', () => {
    expect(cn('p-2', false, 'p-4', undefined, 'text-primary')).toBe('p-4 text-primary');
  });
});
