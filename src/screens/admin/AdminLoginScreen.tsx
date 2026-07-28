interface AdminLoginScreenProps {
  authError: string;
  handleAdminGoogleLogin: () => void;
}

function AdminLoginScreen({ authError, handleAdminGoogleLogin }: AdminLoginScreenProps) {
  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <div className="admin-gate-badge">🛡️</div>
        <h1 className="admin-gate-title">MissionQuest Admin</h1>
        <p className="admin-gate-subtitle">Authorized staff only. Sign in with your admin Google account.</p>

        {authError && (
          <div className="admin-gate-error">{authError}</div>
        )}

        <button type="button" onClick={handleAdminGoogleLogin} className="btn btn-google admin-gate-google-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.89-6.357-6.457 0-3.568 2.848-6.458 6.357-6.458 1.614 0 3.082.587 4.22 1.564l3.202-3.136C19.387 1.83 16.038 1 12.24 1 5.866 1 .7 6.148.7 12.5S5.866 24 12.24 24c5.783 0 10.749-4.148 10.749-11.458 0-.768-.078-1.516-.249-2.257H12.24z"/>
          </svg>
          Sign in with Google
        </button>

        <p className="admin-gate-footnote">This is a restricted area, separate from the player app.</p>
      </div>
    </div>
  );
}

interface AdminAccessDeniedProps {
  email?: string;
  handleLogout: () => void;
}

export function AdminAccessDenied({ email, handleLogout }: AdminAccessDeniedProps) {
  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <div className="admin-gate-badge admin-gate-badge-denied">⛔</div>
        <h1 className="admin-gate-title">Access Denied</h1>
        <p className="admin-gate-subtitle">
          {email ? <>The account <strong>{email}</strong> is</> : 'This account is'} not authorized for admin access.
        </p>
        <button type="button" onClick={handleLogout} className="btn btn-secondary admin-gate-google-btn">
          Sign out and try another account
        </button>
      </div>
    </div>
  );
}

export default AdminLoginScreen;
