import { GAME_OPTIONS, type GameIdLink, type Profile } from '../types';
import { GAME_ICONS } from '../gameIcons';

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
  handleUnlinkGameId: (linkId: string, gameType: string) => void;
  openSupportModal: () => void;
  openFeedbackModal: () => void;
  setShowDeleteAccountModal: (show: boolean) => void;
}

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
  handleUnlinkGameId,
  openSupportModal,
  openFeedbackModal,
  setShowDeleteAccountModal,
}: ProfileScreenProps) {
  const verifiedLinks = gameIdLinks.filter((link) => link.status === 'verified');
  const verifiedGameTypes = new Set(verifiedLinks.map((link) => link.game_type));
  const linkableGames = GAME_OPTIONS.filter((game) => !verifiedGameTypes.has(game));

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

          {verifiedLinks.length > 0 && (
            <div style={{ marginTop: '20px', width: '100%' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Verified Games
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {verifiedLinks.map((link) => (
                  <div
                    key={link.id}
                    title={`${link.game_type}: ${link.in_game_id}${link.ai_extracted_nickname ? ` (${link.ai_extracted_nickname})` : ''}`}
                    style={{ position: 'relative' }}
                  >
                    {GAME_ICONS[link.game_type] ? (
                      <img
                        src={GAME_ICONS[link.game_type]}
                        alt={link.game_type}
                        style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        🎮
                      </div>
                    )}
                    <span style={{
                      position: 'absolute', bottom: '-4px', right: '-4px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'var(--success)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', border: '2px solid var(--bg-card)',
                    }}>
                      ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '4px' }}>
                {gameIdLinks.map((link) => (
                  <div
                    key={link.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', borderRadius: '12px',
                      background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)',
                    }}
                  >
                    {GAME_ICONS[link.game_type] ? (
                      <img
                        src={GAME_ICONS[link.game_type]}
                        alt={link.game_type}
                        style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        🎮
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                        {link.game_type}
                        {link.ai_extracted_nickname && (
                          <span style={{ color: 'var(--accent)', fontWeight: 500 }}> · {link.ai_extracted_nickname}</span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{link.in_game_id}</div>
                    </div>
                    <span className={`badge badge-${link.status}`}>{link.status}</span>
                    <button
                      onClick={() => handleUnlinkGameId(link.id, link.game_type)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.7rem', color: 'var(--danger)', flexShrink: 0 }}
                    >
                      Unlink
                    </button>
                  </div>
                ))}
              </div>
            )}

            {linkableGames.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✅ All supported games are linked and verified.</p>
            ) : (
              <>
                <form onSubmit={handleLinkGameId} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    value={linkableGames.includes(gameIdForm.game_type) ? gameIdForm.game_type : linkableGames[0]}
                    onChange={(e) => setGameIdForm({ ...gameIdForm, game_type: e.target.value })}
                    className="form-control"
                    style={{ flex: '1 1 140px' }}
                  >
                    {linkableGames.map((game) => (
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
              </>
            )}
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
