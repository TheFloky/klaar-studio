import { describe, it, expect } from 'vitest';
import { packages, aboTotal, chf, CARE_MONTHLY, ABO_SETUP, ABO_MONTHS } from '@/lib/pricing';

const get = (id: string) => packages.find((p) => p.id === id)!;

describe('pricing', () => {
  it('one-time prices', () => {
    expect(get('starter').oneTime).toBe(1200);
    expect(get('business').oneTime).toBe(2200);
    expect(get('catalogue').oneTime).toBe(2800);
  });
  it('abo setup and term', () => {
    expect(ABO_SETUP).toBe(300);
    expect(ABO_MONTHS).toBe(24);
  });
  it('24-month totals include setup', () => {
    expect(aboTotal(get('starter').aboMonthly)).toBe(4116);
    expect(aboTotal(get('business').aboMonthly)).toBe(5076);
    expect(aboTotal(get('catalogue').aboMonthly)).toBe(5700);
  });
  it('hosting & care is CHF 119', () => {
    expect(CARE_MONTHLY).toBe(119);
  });
  it('swiss formatting', () => {
    expect(chf(1200)).toBe("CHF 1'200");
  });
});
