import { describe, expect, it } from 'vitest';
import { isSameNepalDay, nepalDateString } from './dateUtils';

describe('nepalDateString', () => {
  it('returns the Nepal-local calendar date for a mid-day UTC timestamp', () => {
    expect(nepalDateString('2026-01-01T12:00:00.000Z')).toBe('2026-01-01');
  });

  it('accepts a Date object as well as an ISO string', () => {
    expect(nepalDateString(new Date('2026-01-01T12:00:00.000Z'))).toBe('2026-01-01');
  });

  it('rolls over to the next Nepal day at 18:15 UTC (Nepal is UTC+5:45)', () => {
    expect(nepalDateString('2026-07-14T18:14:59.000Z')).toBe('2026-07-14');
    expect(nepalDateString('2026-07-14T18:15:00.000Z')).toBe('2026-07-15');
  });
});

describe('isSameNepalDay', () => {
  it('treats two timestamps on the same UTC day but different Nepal days as different', () => {
    // 2026-07-14T17:00Z = Nepal 2026-07-14 22:45; 2026-07-14T19:00Z = Nepal 2026-07-15 00:45
    expect(isSameNepalDay('2026-07-14T17:00:00.000Z', new Date('2026-07-14T19:00:00.000Z'))).toBe(false);
  });

  it('treats two timestamps on different UTC days but the same Nepal day as the same', () => {
    // 2026-07-14T23:00Z = Nepal 2026-07-15 04:45; 2026-07-15T01:00Z = Nepal 2026-07-15 06:45
    expect(isSameNepalDay('2026-07-14T23:00:00.000Z', new Date('2026-07-15T01:00:00.000Z'))).toBe(true);
  });

  it('defaults the reference to now', () => {
    expect(isSameNepalDay(new Date().toISOString())).toBe(true);
  });
});
