import type { Profile, Wallet, Tab } from '../types';

interface NavbarProps {
  user: any;
  profile: Profile | null;
  wallet: Wallet | null;
  handleLogout: () => void;
  setShowLoginModal: (show: boolean) => void;
  handleTabClick: (tab: Tab) => void;
}

function Navbar({ user, profile, wallet, handleLogout, setShowLoginModal, handleTabClick }: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="container nav-flex">
        <div className="logo-text" onClick={() => handleTabClick('missions')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
          <span className="logo-text-brand">MISSIONQUEST</span>
        </div>

        <div className="user-status">
          {user ? (
            <>
              {profile && (
                <>
                  <div className="balance-pill">
                    💸 Rs. {wallet?.balance.toFixed(0) || '0'}
                  </div>
                  <div className="xp-pill">
                    ⭐ {profile.xp} XP
                  </div>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px' }}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="btn btn-signin" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.75rem' }}>
              🎮 Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
