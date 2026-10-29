import { useEffect } from 'react';
import type { Challenge, GameIdLink } from '../types';
import { TOURNAMENT_GAME_ID_TYPE } from '../types';
import CountdownTimer from '../components/CountdownTimer';

interface ChallengesScreenProps {
  user: any;
  challenges: Challenge[];
  myChallenges: Challenge[];
  gameIdLinks: GameIdLink[];
  challengeGameFilter: 'ALL' | Challenge['game_type'];
  setChallengeGameFilter: (f: 'ALL' | Challenge['game_type']) => void;
  setShowLoginModal: (show: boolean) => void;
  handleTabClick: (tab: 'profile') => void;
  deepLinkChallengeId: string | null;
  clearDeepLinkChallenge: () => void;
  openCreateChallengeModal: () => void;
  openAcceptChallengeModal: (challenge: Challenge) => void;
  handleAcceptSoloChallenge: (challenge: Challenge) => void;
  handleCancelChallenge: (challengeId: string) => void;
  openChallengeChat: (challenge: Challenge) => void;
  openSubmitChallengeResultModal: (challenge: Challenge) => void;
}

// Stick to basic/older Unicode emoji (🎮🎯👑-family) -- newer glyphs have
// rendered unreliably as garbled fallback icons in this app before.
const GAME_ICON: Record<Challenge['game_type'], string> = {
  MLBB: '🎮',
  PUBG: '🎯',
  FREEFIRE: '🔥',
  COD: '🔫',
  CR: '👑',
};

const GAME_FILTERS: Array<'ALL' | Challenge['game_type']> = ['ALL', 'MLBB', 'PUBG', 'FREEFIRE', 'COD', 'CR'];

function sideLabel(challenge: Challenge, side: 'creator' | 'acceptor'): string {
  const teamName = side === 'creator' ? challenge.creator_team_name : challenge.acceptor_team_name;
  const profile = side === 'creator' ? challenge.creator_profile : challenge.acceptor_profile;
  return teamName || profile?.display_name || 'Unknown';
}

function ChallengesScreen({
  user,
  challenges,
  myChallenges,
  gameIdLinks,
  challengeGameFilter,
  setChallengeGameFilter,
  setShowLoginModal,
  handleTabClick,
  deepLinkChallengeId,
  clearDeepLinkChallenge,
  openCreateChallengeModal,
  openAcceptChallengeModal,
  handleAcceptSoloChallenge,
  handleCancelChallenge,
  openChallengeChat,
  openSubmitChallengeResultModal,
}: ChallengesScreenProps) {
  const openChallenges = challenges
    .filter((c) => c.status === 'open')
    .filter((c) => challengeGameFilter === 'ALL' || c.game_type === challengeGameFilter);

  const activeMyChallenges = myChallenges.filter((c) => c.status === 'accepted' || c.status === 'awaiting_review');
  const historyMyChallenges = myChallenges.filter((c) =>
    c.status === 'completed' || c.status === 'cancelled' || c.status === 'expired'
  );

  // Notification deep-link: no dedicated detail modal here (unlike
  // tournaments), so scroll the matching card into view and briefly
  // highlight it instead, then clear the pending target.
  useEffect(() => {
    if (!deepLinkChallengeId) return;
    const el = document.getElementById(`challenge-card-${deepLinkChallengeId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('deep-link-highlight');
      setTimeout(() => el.classList.remove('deep-link-highlight'), 2000);
    }
    clearDeepLinkChallenge();
  }, [deepLinkChallengeId, challenges, myChallenges]);

  return (
    <div className="screen animate-fade-in page">
      <div className="page-head">
        <div>
          <h2 className="page-title font-display">Challenges</h2>
          <p className="page-subtitle page-subtitle-wide">
            Wager real money on a 1v1 or team match. Open challenges are broadcast to every verified player of that game --
            first to accept plays for the pot.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="chip-row">
          {GAME_FILTERS.map((g) => (
            <button
              key={g}
              className={`chip ${challengeGameFilter === g ? 'active' : ''}`}
              onClick={() => setChallengeGameFilter(g)}
            >
              {g === 'ALL' ? 'ALL' : `${GAME_ICON[g]} ${g}`}
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => (user ? openCreateChallengeModal() : setShowLoginModal(true))}
        >
          + Create Challenge
        </button>
      </div>

      {activeMyChallenges.length > 0 && (
        <div className="page-section">
          <h3 className="page-section-title">My Active Challenges</h3>
          <div className="missions-grid">
            {activeMyChallenges.map((c) => {
              const isCreator = c.creator_user_id === user?.id;
              const opponentLabel = sideLabel(c, isCreator ? 'acceptor' : 'creator');
              return (
                <div key={c.id} id={`challenge-card-${c.id}`} className="mission-card">
                  <div className="mission-card-image-wrap">
                    <div className="card-art-fallback">
                      {GAME_ICON[c.game_type]}
                    </div>
                    <span className="floating-badge floating-badge-featured">{GAME_ICON[c.game_type]} {c.game_type}</span>
                    <span className={`floating-badge floating-badge-difficulty badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  </div>
                  <div className="mission-card-body">
                    <h3 className="mission-card-title">vs {opponentLabel}</h3>
                    <div className="mission-card-info-row">
                      <div className="info-item info-item-reward">💰 Rs. {(c.stake_amount * 2).toLocaleString()} pot</div>
                      <div className="info-item">{c.mode === 'team' ? `Team of ${c.team_size}` : 'Solo'}</div>
                    </div>

                    {c.status === 'awaiting_review' ? (
                      <div className="tournament-registered-recap">⏳ Result submitted, awaiting admin review.</div>
                    ) : (
                      <div className="card-actions">
                        <button onClick={() => openChallengeChat(c)} className="btn btn-secondary btn-sm">
                          💬 Chat
                        </button>
                        <button onClick={() => openSubmitChallengeResultModal(c)} className="btn btn-primary btn-sm">
                          Submit Result
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h3 className="page-section-title">Open Challenges</h3>
      {openChallenges.length === 0 ? (
        <div className="page-empty">
          No open challenges right now{challengeGameFilter !== 'ALL' ? ` for ${challengeGameFilter}` : ''}. Be the first to create one!
        </div>
      ) : (
        <div className="missions-grid">
          {openChallenges.map((c) => {
            const isMine = c.creator_user_id === user?.id;
            const mappedGameIdType = TOURNAMENT_GAME_ID_TYPE[c.game_type];
            const isVerified = gameIdLinks.some((link) => link.game_type === mappedGameIdType && link.status === 'verified');

            return (
              <div key={c.id} id={`challenge-card-${c.id}`} className="mission-card">
                <div className="mission-card-image-wrap">
                  <div className="card-art-fallback">
                    {GAME_ICON[c.game_type]}
                  </div>
                  <span className="floating-badge floating-badge-featured">{GAME_ICON[c.game_type]} {c.game_type}</span>
                  <span className="floating-badge floating-badge-difficulty">{c.mode === 'team' ? `Team of ${c.team_size}` : 'Solo'}</span>
                </div>
                <div className="mission-card-body">
                  <h3 className="mission-card-title">{sideLabel(c, 'creator')}'s Challenge</h3>
                  <div className="mission-card-info-row">
                    <div className="info-item info-item-reward">💰 Rs. {c.stake_amount.toLocaleString()} stake</div>
                    <div className="info-item">🏆 Rs. {(c.stake_amount * 2 * 0.99).toLocaleString(undefined, { maximumFractionDigits: 2 })} to win</div>
                  </div>
                  <div className="mission-card-info-row">
                    <div className="info-item info-item-sm">
                      🕒 Expires in <CountdownTimer target={c.expires_at} />
                    </div>
                  </div>

                  {isMine ? (
                    <button onClick={() => handleCancelChallenge(c.id)} className="btn btn-danger-outline tournament-cta">
                      Cancel Challenge
                    </button>
                  ) : !user ? (
                    <button onClick={() => setShowLoginModal(true)} className="btn btn-primary tournament-cta">
                      Accept Challenge
                    </button>
                  ) : !isVerified ? (
                    <div className="tournament-registered-recap is-warning">
                      Link &amp; verify your <strong>{mappedGameIdType}</strong> ID to accept.
                      <button
                        onClick={() => handleTabClick('profile')}
                        className="btn btn-secondary btn-sm"
                      >
                        Go to Profile
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => (c.mode === 'team' ? openAcceptChallengeModal(c) : handleAcceptSoloChallenge(c))}
                      className="btn btn-primary tournament-cta"
                    >
                      Accept Challenge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {historyMyChallenges.length > 0 && (
        <div className="page-section">
          <h3 className="page-section-title">My Challenge History</h3>
          <div className="missions-grid">
            {historyMyChallenges.map((c) => {
              const isCreator = c.creator_user_id === user?.id;
              const opponentLabel = sideLabel(c, isCreator ? 'acceptor' : 'creator');
              const won = c.status === 'completed' && c.winner_user_id === user?.id;

              return (
                <div key={c.id} id={`challenge-card-${c.id}`} className="mission-card">
                  <div className="mission-card-image-wrap">
                    <div className="card-art-fallback">
                      {GAME_ICON[c.game_type]}
                    </div>
                    <span className="floating-badge floating-badge-featured">{GAME_ICON[c.game_type]} {c.game_type}</span>
                    <span className={`floating-badge floating-badge-difficulty ${won ? 'floating-badge-won' : 'floating-badge-past'}`}>
                      {c.status === 'completed' ? (won ? '🏆 Won' : 'Lost') : c.status === 'cancelled' ? 'Cancelled' : 'Expired'}
                    </span>
                  </div>
                  <div className="mission-card-body">
                    <h3 className="mission-card-title">vs {c.status === 'completed' ? opponentLabel : '—'}</h3>
                    <div className="mission-card-info-row">
                      <div className="info-item info-item-reward">💰 Rs. {c.stake_amount.toLocaleString()} stake</div>
                    </div>
                    {c.status === 'completed' && (
                      <div className={`tournament-history-result ${won ? 'won' : 'lost'}`}>
                        {won
                          ? `🏆 You won! Rs. ${(c.stake_amount * 2 * 0.99).toLocaleString(undefined, { maximumFractionDigits: 2 })} credited to your wallet.`
                          : 'You lost this challenge.'}
                      </div>
                    )}
                    {c.status !== 'completed' && (
                      <div className="tournament-history-result lost">
                        {c.status === 'cancelled' ? 'Cancelled -- your stake was refunded.' : 'Nobody accepted in time -- your stake was refunded.'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChallengesScreen;
