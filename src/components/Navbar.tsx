import type { Profile, Wallet, Tab } from '../types';
import { NAV_ITEMS, NavIcon } from './navItems';

interface NavbarProps {
  user: any;
  profile: Profile | null;
  wallet: Wallet | null;
  handleLogout: () => void;
  setShowLoginModal: (show: boolean) => void;
  handleTabClick: (tab: Tab) => void;
  // Display-only: which nav pill to highlight (null on pages outside the
  // tab system, e.g. the landing page) and the bell's unread badge.
  activeTab?: Tab | null;
  unreadNotificationCount?: number;
}

function Navbar({ user, profile, wallet, handleLogout, setShowLoginModal, handleTabClick, activeTab = null, unreadNotificationCount = 0 }: NavbarProps) {
  return (
    <nav className="site-header">
      <div className="site-header-inner">
        <div className="site-logo" onClick={() => handleTabClick('missions')}>
          <div className="site-logo-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="3.5" />
              <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" />
            </svg>
          </div>
          <span className="site-logo-text">MissionQuest</span>
        </div>

        <div className="site-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.tab}
              onClick={() => handleTabClick(item.tab)}
              className={`nav-pill ${activeTab === item.tab ? 'active' : ''}`}
            >
              {item.label}{item.tab === 'challenges' && user && profile?.membership_tier === 'free' ? ' 🔒' : ''}
            </button>
          ))}
        </div>

        <div className="site-actions">
          {user && profile && (
            <>
              <div className="balance-pill">
                💸 Rs. {wallet?.balance.toFixed(0) || '0'}
              </div>
              <div className="xp-pill">
                ⭐ {profile.xp} XP
              </div>
            </>
          )}

          <button
            onClick={() => handleTabClick('membership')}
            className={`upgrade-pill ${activeTab === 'membership' ? 'active' : ''}`}
            aria-label="Upgrade"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
            </svg>
            <span className="upgrade-pill-label">Upgrade</span>
          </button>

          {user && (
            <button
              onClick={() => handleTabClick('notifications')}
              className={`icon-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              aria-label={`Notifications${unreadNotificationCount > 0 ? ` (${unreadNotificationCount} unread)` : ''}`}
            >
              <NavIcon name="bell" />
              {unreadNotificationCount > 0 && <span className="icon-btn-badge">{unreadNotificationCount}</span>}
            </button>
          )}

          <button
            onClick={() => handleTabClick('profile')}
            className={`avatar-btn ${activeTab === 'profile' ? 'active' : ''}`}
            aria-label="Profile"
          >
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : <NavIcon name="user" />}
          </button>

          {user ? (
            <button onClick={handleLogout} className="logout-pill" aria-label="Logout">
              <NavIcon name="logout" />
              <span className="logout-pill-label">Logout</span>
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="signin-pill">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
