import type { Notification } from '../types';

interface NotificationsScreenProps {
  notifications: Notification[];
  handleMarkNotificationRead: (notificationId: string) => void;
  handleMarkAllNotificationsRead: () => void;
}

const CATEGORY_ICON: Record<Notification['category'], string> = {
  broadcast: '📢',
  mission: '🎯',
  payout: '💰',
  deposit: '💵',
  membership: '⭐',
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationsScreen({ notifications, handleMarkNotificationRead, handleMarkAllNotificationsRead }: NotificationsScreenProps) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="screen animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', textAlign: 'left' }}>Notifications</h2>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllNotificationsRead} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
          No notifications yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkNotificationRead(n.id)}
              className="card"
              style={{
                textAlign: 'left',
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'flex-start',
                padding: '1rem 1.25rem',
                cursor: n.is_read ? 'default' : 'pointer',
                borderColor: n.is_read ? 'var(--border-color)' : 'var(--accent)',
                background: n.is_read ? undefined : 'rgba(63, 131, 248, 0.05)',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{CATEGORY_ICON[n.category]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <strong style={{ color: '#fff' }}>{n.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{timeAgo(n.created_at)}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>{n.body}</p>
              </div>
              {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '6px' }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsScreen;
