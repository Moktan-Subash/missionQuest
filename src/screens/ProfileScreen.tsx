import { GAME_OPTIONS, type GameIdLink, type Profile } from '../types';

interface ProfileScreenProps {
  user: any;
  profile: Profile;
  handleLogout: () => void;
  setShowPhoneModal: (show: boolean) => void;
  handleSubmitKycDocument: () => void;
  gameIdLinks: GameIdLink[];
  gameIdForm: { game_type: string; in_game_id: string };
  setGameIdForm: (form: { game_type: string; in_game_id: string }) => void;
  gameIdScreenshotFile: File | null;
  setGameIdScreenshotFile: (file: File | null) => void;
  linkingGameId: boolean;
  verifyingGameId: boolean;
  gameIdError: string;
  handleLinkGameId: (e: React.FormEvent) => void;
  openSupportModal: () => void;
  openFeedbackModal: () => void;
  setShowDeleteAccountModal: (show: boolean) => void;
}

const GAME_ID_STATUS_COLOR: Record<GameIdLink['status'], string> = {
  verified: 'var(--success)',
  pending: 'var(--warning)',
  rejected: 'var(--danger)',
};

function ProfileScreen({
  user,
  profile,
  handleLogout,
  setShowPhoneModal,
  handleSubmitKycDocument,
  gameIdLinks,
  gameIdForm,
  setGameIdForm,
  gameIdScreenshotFile,
  setGameIdScreenshotFile,
  linkingGameId,
  verifyingGameId,
  gameIdError,
  handleLinkGameId,
  openSupportModal,
  openFeedbackModal,
  setShowDeleteAccountModal,
}: ProfileScreenProps) {
  return (
    <div className="screen animate-fade-in">
      <div className="profile-grid">
        {/* Left Card: Summary & Stats */}
        <div className="card profile-card-left">
          <img
            src={profile.avatar_url || 'https://www.gravatar.com/avatar?d=mp'}
            className="profile-avatar-large"
            alt=""
          />
          <h2 className="profile-name-title">{profile.display_name || 'Gamer'}</h2>
          <div className="profile-tier-badge">{profile.membership_tier} Tier</div>

          <div className="profile-stats-grid">
            <div className="profile-stat-box">
              <div className="profile-stat-val">⭐ {profile.xp}</div>
              <div className="profile-stat-lbl">XP Score</div>
            </div>
            <div className="profile-stat-box">
              <div className="profile-stat-val">🏆 {profile.missions_completed}</div>
              <div className="profile-stat-lbl">Completed</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '24px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
          >
            Log Out Account
          </button>
        </div>

        {/* Right Card: Details & Verifications */}
        <div className="card profile-card-right">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="profile-section-title">Gamer Account Settings</h3>

            <div className="profile-row">
              <span className="profile-row-label">User ID</span>
              <span className="profile-row-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{user.id}</span>
            </div>

            <div className="profile-row">
              <span className="profile-row-label">Email Address</span>
              <span className="profile-row-value">{user.email}</span>
            </div>

            <div className="profile-row">
              <span className="profile-row-label">Linked Phone</span>
              <span className="profile-row-value">
                {profile.phone ? (
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ {profile.phone}</span>
                ) : (
                  <button onClick={() => setShowPhoneModal(true)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    Link Phone
                  </button>
                )}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="profile-section-title">KYC Identity Verification</h3>

            <div className="kyc-status-container">
              <div style={{ textAlign: 'left', paddingRight: '12px' }}>
                <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  Status: <span style={{
                    color: profile.kyc_status === 'verified' ? 'var(--success)' :
                           profile.kyc_status === 'pending' ? 'var(--warning)' : 'var(--danger)'
                  }}>{profile.kyc_status}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.4 }}>
                  {profile.kyc_status === 'unverified' && 'Upload a copy of your Citizenship card or Driver License to unlock rewards withdrawals.'}
                  {profile.kyc_status === 'pending' && 'Your document is under review by our moderation team. (Usually verified in 24 hours)'}
                  {profile.kyc_status === 'verified' && 'Your account is fully verified for payouts.'}
                </p>
              </div>

              {profile.kyc_status === 'unverified' && (
                <button
                  onClick={handleSubmitKycDocument}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.75rem', flexShrink: 0 }}
                >
                  Submit ID Document
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="profile-section-title">Linked Game Accounts</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
              Link your in-game ID and a screenshot of your profile screen — most links are
              auto-verified instantly. If it can't be auto-verified, an admin reviews it manually.
            </p>

            {gameIdLinks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px' }}>
                {gameIdLinks.map((link) => (
                  <div key={link.id} className="profile-row">
                    <span className="profile-row-label">{link.game_type}</span>
                    <span className="profile-row-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{link.in_game_id}</span>
                      <span style={{ color: GAME_ID_STATUS_COLOR[link.status], fontWeight: 600, textTransform: 'capitalize', fontSize: '0.75rem' }}>
                        {link.status}
                      </span>
                      {link.verification_method === 'ai_vision' && link.status === 'verified' && (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>(auto)</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleLinkGameId} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={gameIdForm.game_type}
                onChange={(e) => setGameIdForm({ ...gameIdForm, game_type: e.target.value })}
                className="form-control"
                style={{ flex: '1 1 140px' }}
              >
                {GAME_OPTIONS.map((game) => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
              <input
                type="text"
                value={gameIdForm.in_game_id}
                onChange={(e) => setGameIdForm({ ...gameIdForm, in_game_id: e.target.value })}
                placeholder="Your in-game user ID"
                className="form-control"
                style={{ flex: '2 1 160px' }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setGameIdScreenshotFile(e.target.files?.[0] || null)}
                style={{ flex: '1 1 100%', fontSize: '0.75rem' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={linkingGameId || verifyingGameId}
                style={{ padding: '8px 16px', fontSize: '0.75rem' }}
              >
                {linkingGameId ? 'Linking...' : verifyingGameId ? 'Verifying...' : 'Link ID'}
              </button>
            </form>
            {gameIdScreenshotFile && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Selected: {gameIdScreenshotFile.name}</p>
            )}
            {gameIdError && <p style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{gameIdError}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="profile-section-title">Help & Feedback</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={openSupportModal} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                Contact Support
              </button>
              <button onClick={openFeedbackModal} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                ⭐ Rate Us
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 className="profile-section-title" style={{ color: 'var(--danger)' }}>Danger Zone</h3>
            <button
              onClick={() => setShowDeleteAccountModal(true)}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)', alignSelf: 'flex-start' }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;
