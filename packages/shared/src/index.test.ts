import { describe, expect, it } from 'vitest';
import { getRemainingSeconds, isValidPhone, isValidSmsCode, normalizePhone } from './index';

describe('login validation', () => {
  it('normalizes the documented mainland prefix', () => {
    expect(normalizePhone(' +86 13800138000 ')).toBe('13800138000');
    expect(isValidPhone('+8613800138000')).toBe(true);
    expect(isValidPhone('1380013800')).toBe(false);
    expect(isValidPhone('not a phone')).toBe(false);
  });
  it('accepts exactly four digits without losing leading zeroes', () => {
    expect(isValidSmsCode('0012')).toBe(true);
    expect(isValidSmsCode('123456')).toBe(false);
    expect(isValidSmsCode('12a4')).toBe(false);
  });
  it('uses a deadline rather than accumulating timer drift', () => {
    expect(getRemainingSeconds(61000, 1000)).toBe(60);
    expect(getRemainingSeconds(61000, 60500)).toBe(1);
    expect(getRemainingSeconds(61000, 90000)).toBe(0);
  });
});
