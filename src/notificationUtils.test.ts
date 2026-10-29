import { describe, expect, it } from 'vitest';
import { isNotificationVisible } from './notificationUtils';
import type { Notification } from './types';

const NOW = new Date('2026-10-29T12:00:00.000Z').getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

const base: Notification = {
  id: 'n1',
  user_id: 'u1',
  title: 'Mission started',
  body: 'Go!',
  category: 'mission',
  related_id: null,
  is_read: false,
  read_at: null,
  created_at: ago(MIN),
};

describe('isNotificationVisible', () => {
  it('shows unread notifications for 3 days after they are sent', () => {
    expect(isNotificationVisible({ ...base, created_at: ago(2 * DAY) }, NOW)).toBe(true);
    expect(isNotificationVisible({ ...base, created_at: ago(3 * DAY + MIN) }, NOW)).toBe(false);
  });

  it('hides old unread notifications like the 90-day-old ones', () => {
    expect(isNotificationVisible({ ...base, created_at: ago(90 * DAY) }, NOW)).toBe(false);
  });

  it('keeps read notifications for 5 minutes after being read', () => {
    expect(isNotificationVisible({ ...base, is_read: true, read_at: ago(4 * MIN) }, NOW)).toBe(true);
    expect(isNotificationVisible({ ...base, is_read: true, read_at: ago(6 * MIN) }, NOW)).toBe(false);
  });

  it('hides read notifications that have no read_at', () => {
    expect(isNotificationVisible({ ...base, is_read: true, read_at: null }, NOW)).toBe(false);
  });
});
