import { useState } from 'react';
import type { Notification } from '../types';

const ADMIN_CATEGORIES: Notification['category'][] = [
  'admin', 'admin_gameid', 'admin_mission', 'admin_deposit', 'admin_payout', 'admin_membership', 'admin_support', 'admin_challenge',
];

interface AdminNavbarProps {
  notifications: Notification[];
  handleMarkNotificationRead: (notificationId: string) => void;
  handleNotificationClick: (n: Notification) => void;
  handleLogout: () => void;
}

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

function AdminNavbar({ notifications, handleMarkNotificationRead, handleNotificationClick, handleLogout }: AdminNavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const adminNotifications = notifications.filter((n) => ADMIN_CATEGORIES.includes(n.category));
  const unreadCount = adminNotifications.filter((n) => !n.is_read).length;

  const openNotification = (n: Notification) => {
    setShowNotifications(false);
    if (!n.is_read) handleMarkNotificationRead(n.id);
    handleNotificationClick(n);
  };

  return (
    <nav className="navbar admin-navbar">
      <div className="container nav-flex">
        <div className="logo-text">
          <div className="logo-icon-circle admin-logo-icon-circle">🛡️</div>
          <span className="logo-text-brand">MissionQuest Admin</span>
        </div>

        <div className="user-status">
          <div className="admin-notification-wrap">
            <button
              type="button"
              className="admin-notification-bell"
              onClick={() => setShowNotifications((s) => !s)}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              🔔{unreadCount > 0 && <span className="admin-notification-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="admin-notification-dropdown">
                {adminNotifications.length === 0 ? (
                  <p className="admin-notification-empty">No admin notifications.</p>
                ) : (
                  adminNotifications.slice(0, 12).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => openNotification(n)}
                      className={`admin-notification-item ${n.is_read ? '' : 'admin-notification-item-unread'}`}
                    >
                      <div className="admin-notification-item-head">
                        <strong>{n.title}</strong>
                        <span>{timeAgo(n.created_at)}</span>
                      </div>
                      <p>{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
