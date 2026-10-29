import type { Notification } from '../types';

interface NotificationsScreenProps {
  notifications: Notification[];
  handleMarkNotificationRead: (notificationId: string) => void;
  handleMarkAllNotificationsRead: () => void;
  handleNotificationClick: (n: Notification) => void;
}

const CATEGORY_ICON: Record<Notification['category'], string> = {
  broadcast: '📢',
  mission: '🎯',
  payout: '💰',
  deposit: '💵',
  membership: '⭐',
  tournament: '🏆',
  game_id: '🎮',
  support: '🛟',
  admin: '🛠️',
  account: '👋',
  challenge: '⚔️',
  admin_gameid: '🎮',
  admin_mission: '🎯',
  admin_deposit: '💵',
  admin_payout: '💰',
  admin_membership: '⭐',
  admin_support: '🛟',
  admin_challenge: '⚔️',
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

function NotificationsScreen({ notifications, handleMarkNotificationRead, handleMarkAllNotificationsRead, handleNotificationClick }: NotificationsScreenProps) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const openNotification = (n: Notification) => {
    if (!n.is_read) handleMarkNotificationRead(n.id);
    handleNotificationClick(n);
  };

  return (
    <div className="screen animate-fade-in page">
      <div className="page-head">
        <div>
          <h2 className="page-title font-display">Notifications</h2>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You\'re all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllNotificationsRead} className="btn btn-secondary btn-sm">
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="page-empty">
          No notifications yet.
        </div>
      ) : (
        <div className="nt-list">
          {notifications.map((n, index) => (
            <div
              key={n.id}
              onClick={() => openNotification(n)}
              className={`nt-item ${n.is_read ? '' : 'is-unread'}`}
              style={{ '--i': index } as React.CSSProperties}
            >
              <span className="nt-icon">{CATEGORY_ICON[n.category]}</span>
              <div className="nt-body">
                <div className="nt-head">
                  <strong>{n.title}</strong>
                  <span className="nt-time">{timeAgo(n.created_at)}</span>
                </div>
                <p>{n.body}</p>
              </div>
              {!n.is_read && <span className="nt-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsScreen;
