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
    <div className="screen animate-fade-in page">
      <div className="page-head">
        <div>
          <h2 className="page-title font-display">Profile</h2>
          <p className="page-subtitle">Your account, game IDs and verification</p>
        </div>
      </div>

      <div className="pf-grid">
        {/* Left: Summary & Stats */}
        <aside className="pf-hero">
          <div className="pf-avatar">
            <img src={profile.avatar_url || 'https://www.gravatar.com/avatar?d=mp'} alt="" />
          </div>
          <h2 className="pf-name font-display">{profile.display_name || 'Gamer'}</h2>
          <div className="pf-tier">{profile.membership_tier} Tier</div>

          <div className="pf-stats">
            <div className="pf-stat">
              <div className="pf-stat-val font-display">⭐ {profile.xp}</div>
              <div className="pf-stat-lbl">XP Score</div>
            </div>
            <div className="pf-stat">
              <div className="pf-stat-val font-display">🏆 {profile.missions_completed}</div>
              <div className="pf-stat-lbl">Completed</div>
            </div>
          </div>

          {verifiedLinks.length > 0 && (
            <div className="pf-verified">
              <div className="section-label">Verified Games</div>
              <div className="pf-verified-icons">
                {verifiedLinks.map((link) => (
                  <div
                    key={link.id}
                    className="pf-verified-icon"
                    title={`${link.game_type}: ${link.in_game_id}${link.ai_extracted_nickname ? ` (${link.ai_extracted_nickname})` : ''}`}
                  >
                    {GAME_ICONS[link.game_type] ? (
                      <img src={GAME_ICONS[link.game_type]} alt={link.game_type} />
                    ) : (
                      <div className="pf-game-fallback">🎮</div>
                    )}
                    <span className="pf-verified-tick">✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleLogout} className="btn btn-danger-outline pf-logout">
            Log Out Account
          </button>
        </aside>

        {/* Right: Details & Verifications */}
        <div className="pf-sections">
          <section className="pf-section">
            <h3 className="pf-section-title font-display">Gamer Account Settings</h3>

            <div className="pf-row">
              <span className="pf-row-label">User ID</span>
              <span className="pf-row-value mono">{user.id}</span>
            </div>

            <div className="pf-row">
              <span className="pf-row-label">Email Address</span>
              <span className="pf-row-value">{user.email}</span>
            </div>

            <div className="pf-row">
              <span className="pf-row-label">Linked Phone</span>
              <span className="pf-row-value">
                {profile.phone ? (
                  <span className="text-success">✓ {profile.phone}</span>
                ) : (
                  <button onClick={() => setShowPhoneModal(true)} className="btn btn-primary btn-sm">
                    Link Phone
                  </button>
                )}
              </span>
            </div>
          </section>

          <section className="pf-section">
            <h3 className="pf-section-title font-display">KYC Identity Verification</h3>

            <div className="pf-kyc">
              <div>
                <div className="pf-kyc-status">
                  Status: <span className={
                    profile.kyc_status === 'verified' ? 'text-success' :
                    profile.kyc_status === 'pending' ? 'text-warning' : 'text-danger'
                  }>{profile.kyc_status}</span>
                </div>
                <p className="pf-help">
                  {profile.kyc_status === 'unverified' && 'Upload a copy of your Citizenship card or Driver License to unlock rewards withdrawals.'}
                  {profile.kyc_status === 'pending' && 'Your document is under review by our moderation team. (Usually verified in 24 hours)'}
                  {profile.kyc_status === 'verified' && 'Your account is fully verified for payouts.'}
                </p>
              </div>

              {profile.kyc_status === 'unverified' && (
                <button onClick={handleSubmitKycDocument} className="btn btn-primary btn-sm pf-kyc-btn">
                  Submit ID Document
                </button>
              )}
            </div>
          </section>

          <section className="pf-section">
            <h3 className="pf-section-title font-display">Linked Game Accounts</h3>
            <p className="pf-help">
              Link your in-game ID and a screenshot of your profile screen — most links are
              auto-verified instantly. If it can't be auto-verified, an admin reviews it manually.
            </p>

            {gameIdLinks.length > 0 && (
              <div className="pf-links">
                {gameIdLinks.map((link) => (
                  <div key={link.id} className="pf-link">
                    {GAME_ICONS[link.game_type] ? (
                      <img src={GAME_ICONS[link.game_type]} alt={link.game_type} className="pf-link-icon" />
                    ) : (
                      <div className="pf-link-icon pf-game-fallback">🎮</div>
                    )}
                    <div className="pf-link-text">
                      <div className="pf-link-game">
                        {link.game_type}
                        {link.ai_extracted_nickname && (
                          <span className="pf-link-nick"> · {link.ai_extracted_nickname}</span>
                        )}
                      </div>
                      <div className="pf-link-id mono">{link.in_game_id}</div>
                    </div>
                    <span className={`badge badge-${link.status}`}>{link.status}</span>
                    <button
                      onClick={() => handleUnlinkGameId(link.id, link.game_type)}
                      className="btn btn-danger-outline btn-sm"
                    >
                      Unlink
                    </button>
                  </div>
                ))}
              </div>
            )}

            {linkableGames.length === 0 ? (
              <p className="pf-help text-success">✅ All supported games are linked and verified.</p>
            ) : (
              <>
                <form onSubmit={handleLinkGameId} className="pf-link-form">
                  <select
                    value={linkableGames.includes(gameIdForm.game_type) ? gameIdForm.game_type : linkableGames[0]}
                    onChange={(e) => setGameIdForm({ ...gameIdForm, game_type: e.target.value })}
                    className="form-control pf-link-form-game"
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
                    className="form-control pf-link-form-id"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGameIdScreenshotFile(e.target.files?.[0] || null)}
                    className="file-input pf-link-form-file"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={linkingGameId || verifyingGameId}
                  >
                    {linkingGameId ? 'Linking...' : verifyingGameId ? 'Verifying...' : 'Link ID'}
                  </button>
                </form>
                {gameIdScreenshotFile && (
                  <p className="pf-help">Selected: {gameIdScreenshotFile.name}</p>
                )}
                {gameIdError && <p className="pf-help text-danger">{gameIdError}</p>}
              </>
            )}
          </section>

          <section className="pf-section">
            <h3 className="pf-section-title font-display">Help & Feedback</h3>
            <div className="pf-actions">
              <button onClick={openSupportModal} className="btn btn-secondary btn-sm">
                Contact Support
              </button>
              <button onClick={openFeedbackModal} className="btn btn-secondary btn-sm">
                ⭐ Rate Us
              </button>
            </div>
          </section>

          <section className="pf-section pf-section-danger">
            <h3 className="pf-section-title font-display text-danger">Danger Zone</h3>
            <div className="pf-actions">
              <button onClick={() => setShowDeleteAccountModal(true)} className="btn btn-danger-outline btn-sm">
                Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;
