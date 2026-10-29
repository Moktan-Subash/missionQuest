import type { Notification } from './types';

export const UNREAD_VISIBLE_MS = 3 * 24 * 60 * 60 * 1000;
export const READ_VISIBLE_MS = 5 * 60 * 1000;

// UI-only retention: rows are never deleted from the DB, just hidden here.
// Unread notifications show for 3 days after being sent; read ones linger
// 5 minutes after being read. Read rows with no read_at (marked read before
// that column existed) are treated as long expired.
export function isNotificationVisible(n: Notification, now: number = Date.now()): boolean {
  if (n.is_read) {
    return !!n.read_at && now - new Date(n.read_at).getTime() < READ_VISIBLE_MS;
  }
  return now - new Date(n.created_at).getTime() < UNREAD_VISIBLE_MS;
}
