export function normalizePhone(value: string): string {
  return value.trim().replace(/^\+86\s*/, '');
}

export function isValidPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(normalizePhone(value));
}

export function isValidSmsCode(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export function getRemainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
export * from './catalog';
export * from './themes';
export * from './summary';
