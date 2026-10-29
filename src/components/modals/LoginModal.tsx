interface LoginModalProps {
  setShowLoginModal: (show: boolean) => void;
  authError: string;
  handleGoogleLogin: () => void;
}

function LoginModal({ setShowLoginModal, authError, handleGoogleLogin }: LoginModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className="modal-header">
          <h3>Gamer Sign In</h3>
          <button className="modal-close" onClick={() => setShowLoginModal(false)}>×</button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Sign in with Google to start quests, complete missions, and unlock real cash withdrawals.
        </p>

        {authError && (
          <div className="form-error">
            {authError}
          </div>
        )}

        {/* OAUTH GOOGLE BUTTON */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn btn-google"
          style={{ width: '100%', padding: '12px 16px', display: 'flex', gap: '8px', justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.89-6.357-6.457 0-3.568 2.848-6.458 6.357-6.458 1.614 0 3.082.587 4.22 1.564l3.202-3.136C19.387 1.83 16.038 1 12.24 1 5.866 1 .7 6.148.7 12.5S5.866 24 12.24 24c5.783 0 10.749-4.148 10.749-11.458 0-.768-.078-1.516-.249-2.257H12.24z"/>
          </svg>
          Google Account
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
