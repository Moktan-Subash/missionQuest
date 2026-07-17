import type { Feedback, Mission, MissionAttempt, Profile, Tournament, Wallet } from '../types';
import { isSameNepalDay } from '../dateUtils';

interface MissionsScreenProps {
  user: any;
  profile: Profile | null;
  wallet: Wallet | null;
  gameFilter: 'ALL' | 'MLBB' | 'PUBG' | 'OTHERS';
  setGameFilter: (filter: 'ALL' | 'MLBB' | 'PUBG' | 'OTHERS') => void;
  filteredMissions: Mission[];
  expandedMissionId: string | null;
  setExpandedMissionId: (id: string | null) => void;
  attempts: MissionAttempt[];
  missionFees: Record<string, number>;
  activeAttempt: MissionAttempt | null;
  handleStartMission: (mission: Mission) => void;
  publicFeedback: Feedback[];
  tournaments: Tournament[];
  goToTournaments: () => void;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--warning)', letterSpacing: '1px' }}>
      {'★'.repeat(rating)}
      <span style={{ color: 'var(--border-color)' }}>{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function MissionsScreen({
  user,
  profile,
  wallet,
  gameFilter,
  setGameFilter,
  filteredMissions,
  expandedMissionId,
  setExpandedMissionId,
  attempts,
  missionFees,
  activeAttempt,
  handleStartMission,
  publicFeedback,
  tournaments,
  goToTournaments,
}: MissionsScreenProps) {
  const activeTournaments = tournaments.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const totalTournamentPrize = activeTournaments.reduce((sum, t) => sum + t.prize_pool, 0);

  return (
    <div className="screen animate-fade-in">
      {/* 0. TOURNAMENT PROMO BANNER */}
      {activeTournaments.length > 0 && (
        <div className="tournament-promo-banner" onClick={goToTournaments}>
          <div>
            <div className="tournament-promo-text">🏆 Live Tournaments — Rs. {totalTournamentPrize.toLocaleString()} Total Prize Pool</div>
            <div className="tournament-promo-sub">Register now for MLBB &amp; PUBG tournaments before spots fill up.</div>
          </div>
          <button
            className="btn btn-gold"
            onClick={(e) => { e.stopPropagation(); goToTournaments(); }}
          >
            View Tournaments →
          </button>
        </div>
      )}

      {/* 1. ANONYMOUS GUEST VIEW: SHOW THE HERO MARKETING PORTAL */}
      {!user && (
        <div className="hero-section">
          <div className="hero-badge">
            <span className="pulse-dot"></span> Complete missions. Earn rewards. Level up.
          </div>
          <h1 className="hero-title">
            Gaming Missions.<br />
            <span className="text-real">Real</span><span className="text-rewards">Rewards.</span>
          </h1>
          <p className="hero-desc">
            Join the ultimate gaming challenge platform. Complete missions in your favorite games, earn real cash rewards, and connect with gamers worldwide.
          </p>
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

          let acceptLabel = 'Accept Mission →';
          if (maxedOutMission) acceptLabel = 'Completed Today';
          else if (needsPayment) acceptLabel = `Pay Rs. ${missionFee} to Play`;

          return (
            <div key={mission.id} className={`mission-card ${mission.game.toLowerCase().includes('pubg') ? 'card-pubg' : 'card-mlbb'}`}>
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
                  <div className="info-item">
                    🕒 {mission.duration_days || 3} days
                  </div>
                  {needsPayment && !maxedOutMission && (
                    <div className="info-item" style={{ color: 'var(--warning)', fontWeight: 700 }}>
                      💰 Rs. {missionFee} entry fee
                    </div>
                  )}
                </div>

                {isExpanded ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', background: '#090B15', padding: '12px', borderRadius: '8px', border: '1px solid #1A1F38', width: '100%' }}>
                    <p style={{ marginBottom: '8px', color: '#fff' }}>{mission.description}</p>
                    <p style={{ color: '#94A3B8' }}><strong>Rules:</strong> {mission.rules}</p>
                    <p style={{ marginTop: '6px', color: 'var(--warning)', fontWeight: 600 }}>+{mission.xp_reward} XP Reward</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: '16px', padding: '0' }}
                    onClick={() => setExpandedMissionId(mission.id)}
                  >
                    Show rules & details...
                  </button>
                )}
                {isExpanded && (
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: '16px', padding: '0' }}
                    onClick={() => setExpandedMissionId(null)}
                  >
                    Hide details
                  </button>
                )}

                <button
                  onClick={() => handleStartMission(mission)}
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

      {/* PLAYER REVIEWS: public testimonials, visible to everyone incl. guests */}
      {publicFeedback.length > 0 && (
        <div style={{ margin: '32px 0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', textAlign: 'left' }}>
            Player Reviews{' '}
            <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
              ⭐ {(publicFeedback.reduce((sum, f) => sum + f.rating, 0) / publicFeedback.length).toFixed(1)}
            </span>
          </h3>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {publicFeedback.map((f) => (
              <div
                key={f.id}
                className="card"
                style={{ textAlign: 'left', minWidth: '240px', maxWidth: '240px', flexShrink: 0, padding: '14px 16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{f.profile?.display_name || 'Gamer'}</strong>
                  <Stars rating={f.rating} />
                </div>
                {f.comment && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.comment}</p>
                )}
              </div>
            ))}
          </div>
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
