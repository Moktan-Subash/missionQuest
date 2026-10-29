import type { GameIdLink, Mission, MissionAttempt, Profile, Wallet } from '../types';
import { isSameNepalDay } from '../dateUtils';
import { missionGameIdBlocker } from '../gameIdUtils';

interface MissionsScreenProps {
  user: any;
  profile: Profile | null;
  wallet: Wallet | null;
  platformSettings: Record<string, string>;
  gameFilter: 'ALL' | 'MLBB' | 'PUBG' | 'OTHERS';
  setGameFilter: (filter: 'ALL' | 'MLBB' | 'PUBG' | 'OTHERS') => void;
  filteredMissions: Mission[];
  expandedMissionId: string | null;
  setExpandedMissionId: (id: string | null) => void;
  attempts: MissionAttempt[];
  missionFees: Record<string, number>;
  activeAttempt: MissionAttempt | null;
  gameIdLinks: GameIdLink[];
  handleStartMission: (mission: Mission) => void;
}

// Accepts a full YouTube URL in any common shape (watch/share/embed) and
// pulls out just the video ID, so whoever sets the platform_settings row
// can paste whatever link YouTube gave them without knowing the embed format.
function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Display-only helpers for the mission card art and difficulty meter.
const GAME_SHORT_NAMES: Record<string, string> = {
  'Mobile Legends': 'MLBB',
  'PUBG Mobile': 'PUBG',
  'Call of Duty Mobile': 'CODM',
  'League of Legends': 'LOL',
  'Free Fire': 'FF',
  'Clash Royale': 'CR',
};

function gameShortName(game: string): string {
  return GAME_SHORT_NAMES[game] || game.split(/\s+/)[0].slice(0, 5).toUpperCase();
}

// Expert has no colour of its own in the design, so it shares hard's.
const DIFFICULTY_LEVEL: Record<NonNullable<Mission['difficulty']>, 'easy' | 'medium' | 'hard'> = {
  Easy: 'easy',
  Medium: 'medium',
  Hard: 'hard',
  Expert: 'hard',
};

function MissionsScreen({
  user,
  profile,
  wallet,
  platformSettings,
  gameFilter,
  setGameFilter,
  filteredMissions,
  expandedMissionId,
  setExpandedMissionId,
  attempts,
  missionFees,
  activeAttempt,
  gameIdLinks,
  handleStartMission,
}: MissionsScreenProps) {
  // Dev-only placeholder so the card is visible while building/testing
  // locally -- import.meta.env.DEV is false in the actual production build,
  // so real players never see this fallback, only the real configured video.
  const devFallback = import.meta.env.DEV ? 'https://youtu.be/dQw4w9WgXcQ' : '';
  const tutorialVideoId = extractYoutubeId(platformSettings.tutorial_video_url || devFallback);
  // Purely visual: the first card with the highest reward in the current
  // (filtered) list gets the "Top reward" treatment.
  const topRewardMissionId = filteredMissions.reduce<Mission | null>(
    (top, m) => (!top || m.reward_amount > top.reward_amount ? m : top),
    null
  )?.id;

  return (
    <div className="screen animate-fade-in missions-page">
      {/* 1b. HOW TO PLAY: short tutorial video, only shown once an admin has
          set platform_settings.tutorial_video_url -- no placeholder/broken
          embed shown to players before that's configured. */}
      {tutorialVideoId && (
        <section className="guide">
          <div className="guide-card">
            <span className="guide-eyebrow"><span className="guide-eyebrow-dot" />New Player Guide</span>
            <h2 className="guide-title font-display">
              Prove your skill.<br />
              <span className="guide-title-accent">Get paid.</span>
            </h2>
            <p className="guide-subtitle">
              A 60-second walkthrough of accepting a mission, submitting proof, and cashing out.
            </p>

            <ol className="guide-steps">
              <li className="guide-step" style={{ '--i': 0 } as React.CSSProperties}>
                <span className="guide-step-num">01</span>
                <strong>Pick a mission</strong>
                <p>Choose one that matches your game and skill level.</p>
              </li>
              <li className="guide-step" style={{ '--i': 1 } as React.CSSProperties}>
                <span className="guide-step-num">02</span>
                <strong>Accept & play</strong>
                <p>Your 45-minute timer starts the moment you accept.</p>
              </li>
              <li className="guide-step" style={{ '--i': 2 } as React.CSSProperties}>
                <span className="guide-step-num">03</span>
                <strong>Submit proof</strong>
                <p>Upload screenshots (or video, if the mission allows it).</p>
              </li>
              <li className="guide-step" style={{ '--i': 3 } as React.CSSProperties}>
                <span className="guide-step-num guide-step-num-accent">04</span>
                <strong>Get paid</strong>
                <p>Once approved, your reward lands straight in your wallet.</p>
              </li>
            </ol>
          </div>

          <div className="guide-video">
            <iframe
              src={`https://www.youtube.com/embed/${tutorialVideoId}`}
              title="How to play MissionQuest"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="guide-video-frame"
            />
          </div>
        </section>
      )}

      {/* 2. LOGGED-IN VIEW: SHOW A CLEAN WELCOME HEADER */}
      {user && profile && (
        <div className="welcome-bar">
          <div className="welcome-bar-user">
            <img
              src={profile.avatar_url || 'https://www.gravatar.com/avatar?d=mp'}
              alt=""
              className="welcome-bar-avatar"
            />
            <div>
              <h3 className="welcome-bar-title">Welcome back, {profile.display_name || 'Gamer'}!</h3>
              <p className="welcome-bar-meta">
                Tier: <span className="tier-name">{profile.membership_tier}</span> |{' '}
                {Math.max(profile.daily_mission_limit - attempts.filter(a => isSameNepalDay(a.started_at)).length, 0)} of {profile.daily_mission_limit} quests remaining today
              </p>
            </div>
          </div>
          <div className="welcome-bar-pills">
            <div className="balance-pill">💰 Rs. {wallet?.balance.toFixed(0) || '0'}</div>
            <div className="xp-pill">⭐ {profile.xp} XP</div>
          </div>
        </div>
      )}


      {/* 3. MISSIONS HEADING + GAME CATEGORIES FILTER ROW */}
      <div id="featured-missions-board" className="board-head">
        <div>
          <h2 className="board-title font-display">Missions</h2>
          <p className="board-subtitle">
            {filteredMissions.length} {filteredMissions.length === 1 ? 'mission' : 'missions'} available
          </p>
        </div>
        <div className="chip-row">
          <button onClick={() => setGameFilter('ALL')} className={`chip ${gameFilter === 'ALL' ? 'active' : ''}`}>ALL</button>
          <button onClick={() => setGameFilter('MLBB')} className={`chip ${gameFilter === 'MLBB' ? 'active' : ''}`}>MLBB</button>
          <button onClick={() => setGameFilter('PUBG')} className={`chip ${gameFilter === 'PUBG' ? 'active' : ''}`}>PUBG</button>
          <button onClick={() => setGameFilter('OTHERS')} className={`chip ${gameFilter === 'OTHERS' ? 'active' : ''}`}>OTHERS</button>
        </div>
      </div>

      {filteredMissions.length === 0 ? (
        <p className="board-empty">
          No missions available right now. Check back soon!
        </p>
      ) : (
      <div className="mq-grid">
        {filteredMissions.map((mission, index) => {
          const sameMissionToday = user ? attempts.filter((a) => a.mission_id === mission.id && isSameNepalDay(a.started_at)).length : 0;
          const maxedOutMission = sameMissionToday >= 2;
          const attemptsToday = user ? attempts.filter((a) => isSameNepalDay(a.started_at)).length : 0;
          const needsPayment = !!(user && profile && attemptsToday >= profile.daily_mission_limit);
          const missionFee = missionFees[mission.difficulty || 'Medium'] || 0;
          const isExpanded = expandedMissionId === mission.id;
          // Guests still see "Accept Mission" (it opens login); the button stays
          // clickable when locked so handleStartMission can explain why.
          const needsGameId = !!user && missionGameIdBlocker(mission.game, gameIdLinks) !== null;

          let acceptLabel = 'Accept Mission';
          if (maxedOutMission) acceptLabel = 'Completed Today';
          else if (needsGameId) acceptLabel = '🔒 Verify Game ID to Play';
          else if (needsPayment) acceptLabel = `Pay Rs. ${missionFee} to Play`;

          const difficulty = mission.difficulty || 'Medium';
          const level = DIFFICULTY_LEVEL[difficulty];
          const isTopReward = mission.id === topRewardMissionId;

          return (
            <div
              key={mission.id}
              className={`mq-card ${isTopReward ? 'is-top' : ''}`}
              style={{ '--i': index } as React.CSSProperties}
              onClick={() => setExpandedMissionId(isExpanded ? null : mission.id)}
            >
              <div className="mq-card-art">
                <div className="mq-card-art-bg" />
                <span className="mq-card-watermark" aria-hidden="true">{gameShortName(mission.game)}</span>
                <span className="mq-tag mq-tag-game">{mission.game}</span>
                <span className={`mq-tag mq-tag-diff diff-${level}`}>
                  <span className="mq-tag-dot" />{difficulty}
                </span>
              </div>

              <div className="mq-card-body">
                {isTopReward && <span className="mq-top-tag">Top reward</span>}
                <h3 className="mq-card-title font-display">{mission.title}</h3>

                <div className={`mq-meter diff-${level}`} aria-label={`Difficulty: ${difficulty}`}>
                  <span />
                </div>

                <div className="mq-facts">
                  <span className="mq-fact">45 min</span>
                  <span className="mq-fact">Proof</span>
                  {needsPayment && !maxedOutMission && (
                    <span className="mq-fact mq-fact-fee">💰 Rs. {missionFee} entry fee</span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mq-card-details">
                    <p className="mq-card-details-desc">{mission.description}</p>
                    <p><strong>Rules:</strong> {mission.rules}</p>
                    <p className="mq-card-details-xp">+{mission.xp_reward} XP Reward</p>
                  </div>
                )}

                <div className="mq-card-foot">
                  <div className="mq-reward">
                    <span className="mq-reward-label">Reward</span>
                    <span className="mq-reward-amount font-display">
                      <small>Rs</small>{mission.reward_amount.toFixed(0)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartMission(mission);
                    }}
                    disabled={!!maxedOutMission || !!(user && activeAttempt !== null)}
                    className="mq-accept"
                  >
                    {acceptLabel}
                    {acceptLabel === 'Accept Mission' && (
                      <svg className="mq-accept-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* MISSION ATTEMPTS HISTORY (Only visible when logged in) */}
      {user && (
        <>
          <h2 className="page-section-title submissions-title">Your Submissions</h2>
          <div className="table-card">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Quest</th>
                  <th>Game</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Cash Earned</th>
                </tr>
              </thead>
              <tbody>
                {attempts.filter(a => a.status !== 'active').length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      No submissions yet. Start a quest to earn rewards!
                    </td>
                  </tr>
                ) : (
                  attempts.filter(a => a.status !== 'active').map((attempt) => (
                    <tr key={attempt.id} className="leaderboard-row">
                      <td className="table-strong">{attempt.mission?.title}</td>
                      <td>
                        <span className={`badge ${attempt.mission?.game === 'MLBB' ? 'badge-mlbb' : 'badge-pubg'}`}>
                          {attempt.mission?.game}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(attempt.started_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge badge-${attempt.status}`}>
                          {attempt.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="table-cash">
                        {attempt.status === 'approved' && (
                          <span className="text-success">+Rs. {attempt.mission?.reward_amount.toFixed(0)}</span>
                        )}
                        {attempt.status === 'rejected' && (
                          <span className="text-danger">
                            Reason: {attempt.rejection_reason || 'N/A'}
                          </span>
                        )}
                        {attempt.status === 'pending_review' && (
                          <span className="text-warning">Under review (3 days max)</span>
                        )}
                        {attempt.status === 'expired' && (
                          <span className="text-muted">Expired</span>
                        )}
                        {attempt.status === 'cancelled' && (
                          <span className="text-muted">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default MissionsScreen;
