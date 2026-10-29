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

  return (
    <div className="screen animate-fade-in">
      {/* 1b. HOW TO PLAY: short tutorial video, only shown once an admin has
          set platform_settings.tutorial_video_url -- no placeholder/broken
          embed shown to players before that's configured. */}
      {tutorialVideoId && (
        <div className="how-to-play-card">
          <div className="how-to-play-content">
            <div className="how-to-play-copy">
              <span className="how-to-play-badge">✨ New Player Guide</span>
              <h2 className="how-to-play-title">
                How to <span className="how-to-play-title-accent">Play & Get Paid</span>
              </h2>
              <p className="how-to-play-subtitle">
                A 60-second walkthrough of accepting a mission, submitting proof, and cashing out.
              </p>

              <ol className="how-to-play-steps">
                <li>
                  <span className="how-to-play-step-num">1</span>
                  <div>
                    <strong>Pick a mission</strong>
                    <p>Choose one that matches your game and skill level.</p>
                  </div>
                </li>
                <li>
                  <span className="how-to-play-step-num">2</span>
                  <div>
                    <strong>Accept & play</strong>
                    <p>Your 45-minute timer starts the moment you accept.</p>
                  </div>
                </li>
                <li>
                  <span className="how-to-play-step-num">3</span>
                  <div>
                    <strong>Submit proof</strong>
                    <p>Upload screenshots (or video, if the mission allows it).</p>
                  </div>
                </li>
                <li>
                  <span className="how-to-play-step-num">4</span>
                  <div>
                    <strong>Get paid</strong>
                    <p>Once approved, your reward lands straight in your wallet.</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="how-to-play-video-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${tutorialVideoId}`}
                title="How to play MissionQuest"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="how-to-play-video"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. LOGGED-IN VIEW: SHOW A CLEAN WELCOME HEADER */}
      {user && profile && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '16px 24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
            <img
              src={profile.avatar_url || 'https://www.gravatar.com/avatar?d=mp'}
              alt=""
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }}
            />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Welcome back, {profile.display_name || 'Gamer'}!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Tier: <span style={{ color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase' }}>{profile.membership_tier}</span> |{' '}
                {Math.max(profile.daily_mission_limit - attempts.filter(a => isSameNepalDay(a.started_at)).length, 0)} of {profile.daily_mission_limit} quests remaining today
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="balance-pill">💰 Rs. {wallet?.balance.toFixed(0) || '0'}</div>
            <div className="xp-pill">⭐ {profile.xp} XP</div>
          </div>
        </div>
      )}

      {/* 3. GAME CATEGORIES FILTER ROW */}
      <div id="featured-missions-board" style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 32px' }}>
        <div className="game-filters">
          <button onClick={() => setGameFilter('ALL')} className={`filter-btn ${gameFilter === 'ALL' ? 'active' : ''}`}>ALL</button>
          <button onClick={() => setGameFilter('MLBB')} className={`filter-btn ${gameFilter === 'MLBB' ? 'active' : ''}`}>MLBB</button>
          <button onClick={() => setGameFilter('PUBG')} className={`filter-btn ${gameFilter === 'PUBG' ? 'active' : ''}`}>PUBG</button>
          <button onClick={() => setGameFilter('OTHERS')} className={`filter-btn ${gameFilter === 'OTHERS' ? 'active' : ''}`}>OTHERS</button>
        </div>
      </div>

      {filteredMissions.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
          No missions available right now. Check back soon!
        </p>
      ) : (
      <div className="missions-grid">
        {filteredMissions.map((mission) => {
          const sameMissionToday = user ? attempts.filter((a) => a.mission_id === mission.id && isSameNepalDay(a.started_at)).length : 0;
          const maxedOutMission = sameMissionToday >= 2;
          const attemptsToday = user ? attempts.filter((a) => isSameNepalDay(a.started_at)).length : 0;
          const needsPayment = !!(user && profile && attemptsToday >= profile.daily_mission_limit);
          const missionFee = missionFees[mission.difficulty || 'Medium'] || 0;
          const isExpanded = expandedMissionId === mission.id;
          // Guests still see "Accept Mission" (it opens login); the button stays
          // clickable when locked so handleStartMission can explain why.
          const needsGameId = !!user && missionGameIdBlocker(mission.game, gameIdLinks) !== null;

          let acceptLabel = 'Accept Mission →';
          if (maxedOutMission) acceptLabel = 'Completed Today';
          else if (needsGameId) acceptLabel = '🔒 Verify Game ID to Play';
          else if (needsPayment) acceptLabel = `Pay Rs. ${missionFee} to Play`;

          return (
            <div
              key={mission.id}
              className={`mission-card ${mission.game.toLowerCase().includes('pubg') ? 'card-pubg' : 'card-mlbb'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setExpandedMissionId(isExpanded ? null : mission.id)}
            >
              <div className="mission-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <h3 className="mission-card-title">{mission.title}</h3>
                  <span className={`difficulty-chip difficulty-${(mission.difficulty || 'Medium').toLowerCase()}`}>
                    {mission.difficulty || 'Medium'}
                  </span>
                </div>
                <div className="mission-card-game">{mission.game}</div>

                <div className="mission-card-info-row">
                  <div className="info-item info-item-reward">
                    🏆 Rs. {mission.reward_amount.toFixed(0)}
                  </div>
                  {needsPayment && !maxedOutMission && (
                    <div className="info-item" style={{ color: 'var(--warning)', fontWeight: 700 }}>
                      💰 Rs. {missionFee} entry fee
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', background: '#090B15', padding: '12px', borderRadius: '8px', border: '1px solid #1A1F38', width: '100%' }}>
                    <p style={{ marginBottom: '8px', color: '#fff' }}>{mission.description}</p>
                    <p style={{ color: '#94A3B8' }}><strong>Rules:</strong> {mission.rules}</p>
                    <p style={{ marginTop: '6px', color: 'var(--warning)', fontWeight: 600 }}>+{mission.xp_reward} XP Reward</p>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartMission(mission);
                  }}
                  disabled={!!maxedOutMission || !!(user && activeAttempt !== null)}
                  className="btn-accept"
                >
                  {acceptLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* MISSION ATTEMPTS HISTORY (Only visible when logged in) */}
      {user && (
        <>
          <h2 style={{ fontSize: '1.5rem', textAlign: 'left', margin: '2rem 0 1rem' }}>Your Submissions</h2>
          <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
            <table className="leaderboard-table" style={{ margin: '0' }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>Quest</th>
                  <th>Game</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ paddingRight: '1.5rem' }}>Cash Earned</th>
                </tr>
              </thead>
              <tbody>
                {attempts.filter(a => a.status !== 'active').length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No submissions yet. Start a quest to earn rewards!
                    </td>
                  </tr>
                ) : (
                  attempts.filter(a => a.status !== 'active').map((attempt) => (
                    <tr key={attempt.id} className="leaderboard-row">
                      <td style={{ paddingLeft: '1.5rem', fontWeight: 600, color: '#fff' }}>{attempt.mission?.title}</td>
                      <td>
                        <span className={`badge ${attempt.mission?.game === 'MLBB' ? 'badge-mlbb' : 'badge-pubg'}`}>
                          {attempt.mission?.game}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {new Date(attempt.started_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge badge-${attempt.status}`}>
                          {attempt.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ paddingRight: '1.5rem', fontSize: '0.9rem' }}>
                        {attempt.status === 'approved' && (
                          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>+Rs. {attempt.mission?.reward_amount.toFixed(0)}</span>
                        )}
                        {attempt.status === 'rejected' && (
                          <span style={{ color: 'var(--danger)' }}>
                            Reason: {attempt.rejection_reason || 'N/A'}
                          </span>
                        )}
                        {attempt.status === 'pending_review' && (
                          <span style={{ color: 'var(--warning)' }}>Under review (3 days max)</span>
                        )}
                        {attempt.status === 'expired' && (
                          <span style={{ color: 'var(--text-muted)' }}>Expired</span>
                        )}
                        {attempt.status === 'cancelled' && (
                          <span style={{ color: 'var(--text-muted)' }}>Cancelled</span>
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
