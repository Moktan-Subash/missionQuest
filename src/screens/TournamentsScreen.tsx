import { useEffect, useState } from 'react';
import type { GameIdLink, Tournament, TournamentRegistration, TournamentTeamMember, TournamentMatch } from '../types';
import { TOURNAMENT_GAME_ID_TYPE } from '../types';
import CountdownTimer from '../components/CountdownTimer';

interface TournamentsScreenProps {
  user: any;
  tournaments: Tournament[];
  myRegistrations: TournamentRegistration[];
  myTeamMembers: TournamentTeamMember[];
  myMatches: TournamentMatch[];
  gameIdLinks: GameIdLink[];
  openTournamentRegistration: (tournament: Tournament) => void;
  openTeamRosterModal: (registration: TournamentRegistration) => void;
  setShowLoginModal: (show: boolean) => void;
  handleTabClick: (tab: 'profile') => void;
  handleCheckInForMatch: (matchId: string) => void;
  openMatchChat: (match: TournamentMatch) => void;
  openSubmitResultModal: (match: TournamentMatch) => void;
  bracketMatches: TournamentMatch[];
  fetchTournamentBracket: (tournamentId: string) => void;
}

const CHECKIN_WINDOW_MS = 30 * 60 * 1000;

// Stick to basic/older Unicode emoji (🎮🎯👑-family) -- newer glyphs have
// rendered unreliably as garbled fallback icons in this app before.
const GAME_ICON: Record<Tournament['game_type'], string> = {
  MLBB: '🎮',
  PUBG: '🎯',
  FREEFIRE: '🔥',
  COD: '🔫',
  CR: '👑',
};

const STATUS_LABEL: Record<Tournament['status'], string> = {
  upcoming: 'Upcoming',
  registration_open: 'Registration Open',
  ongoing: 'Live Now',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function TournamentsScreen({
  user,
  tournaments,
  myRegistrations,
  myTeamMembers,
  myMatches,
  gameIdLinks,
  openTournamentRegistration,
  openTeamRosterModal,
  setShowLoginModal,
  handleTabClick,
  handleCheckInForMatch,
  openMatchChat,
  openSubmitResultModal,
  bracketMatches,
  fetchTournamentBracket,
}: TournamentsScreenProps) {
  // Forces a re-render every second so the check-in button appears/disappears
  // live as the 30-minute window opens, without needing a page refresh.
  const [, setClockTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const [detailsTournament, setDetailsTournament] = useState<Tournament | null>(null);
  const [expandedTournamentId, setExpandedTournamentId] = useState<string | null>(null);
  const activeTournaments = tournaments.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const historyTournaments = tournaments.filter((t) => t.status === 'completed' || t.status === 'cancelled');

  const openDetails = (t: Tournament) => {
    setDetailsTournament(t);
    fetchTournamentBracket(t.id);
  };

  return (
    <div className="screen animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: '0.5rem' }}>Tournaments</h2>
      <p style={{ textAlign: 'left', marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Compete for real cash prizes. Register now before spots fill up.
      </p>

      {activeTournaments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No tournaments scheduled right now. Check back soon!
        </div>
      ) : (
        <div className="missions-grid">
          {activeTournaments.map((t) => {
            const myReg = myRegistrations.find((r) => r.tournament_id === t.id);
            const myRoster = myReg ? myTeamMembers.filter((m) => m.registration_id === myReg.id) : [];
            const myTournamentMatches = myReg ? myMatches.filter((m) => m.tournament_id === t.id) : [];
            const pct = Math.min(100, Math.round((t.registered_count / t.min_participants) * 100));
            const minReached = t.registered_count >= t.min_participants;
            const unit = t.registration_unit === 'team' ? 'teams' : 'players';
            const mappedGameIdType = TOURNAMENT_GAME_ID_TYPE[t.game_type];
            const isVerified = gameIdLinks.some((link) => link.game_type === mappedGameIdType && link.status === 'verified');

            return (
              <div key={t.id} className={`mission-card tournament-card-${t.game_type.toLowerCase()}`}>
                <div className="mission-card-image-wrap">
                  {t.banner_url ? (
                    <img src={t.banner_url} alt="" className="mission-card-img" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                      {GAME_ICON[t.game_type]}
                    </div>
                  )}
                  <span className="floating-badge floating-badge-featured">{GAME_ICON[t.game_type]} {t.game_type}</span>
                  <span className={`floating-badge floating-badge-difficulty badge badge-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </div>
                <div className="mission-card-body">
                  <h3 className="mission-card-title">{t.title}</h3>
                  <div className="mission-card-info-row">
                    <div className="info-item info-item-reward">💰 Rs. {t.prize_pool.toLocaleString()}</div>
                    {t.xp_reward > 0 && <div className="info-item">⭐ {t.xp_reward} XP</div>}
                    <div className="info-item">{t.registered_count}/{t.min_participants} {unit}</div>
                  </div>

                  {(t.registration_deadline || t.start_date) && (
                    <div className="mission-card-info-row" style={{ marginTop: '-10px' }}>
                      {t.registration_deadline && (
                        <div className="info-item" style={{ fontSize: '0.75rem' }}>
                          🕒 Reg. closes {new Date(t.registration_deadline).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {t.start_date && (
                        <div className="info-item" style={{ fontSize: '0.75rem' }}>
                          🚀 Starts {new Date(t.start_date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginBottom: '12px' }}>
                    <div className="tournament-progress-track">
                      <div
                        className={`tournament-progress-fill ${minReached ? 'min-reached' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {minReached && <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.75rem', marginTop: '4px' }}>✅ Minimum reached!</div>}
                  </div>

                  {expandedTournamentId === t.id ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', background: '#090B15', padding: '12px', borderRadius: '8px', border: '1px solid #1A1F38' }}>
                      {t.description && <p style={{ marginBottom: '8px', color: '#fff' }}>{t.description}</p>}
                      {t.rules && <p style={{ color: '#94A3B8' }}><strong>Rules:</strong> {t.rules}</p>}
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginTop: '6px', padding: '0' }}
                        onClick={() => setExpandedTournamentId(null)}
                      >
                        Hide details
                      </button>
                    </div>
                  ) : (
                    (t.description || t.rules) && (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: '10px', padding: '0' }}
                        onClick={() => setExpandedTournamentId(t.id)}
                      >
                        Show rules & details...
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', marginBottom: '10px', padding: '0', display: 'block' }}
                    onClick={() => openDetails(t)}
                  >
                    View bracket & details →
                  </button>

                  {t.status === 'ongoing' && t.livestream_url && (
                    <a
                      href={t.livestream_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ background: 'var(--danger)', textAlign: 'center', marginBottom: '10px' }}
                    >
                      🔴 Watch Live
                    </a>
                  )}

                  {myReg ? (
                    <div className="tournament-registered-recap">
                      ✅ You're registered{myReg.team_name ? ` as "${myReg.team_name}"` : ''}.
                      {t.registration_unit === 'team' && (
                        <>
                          <div style={{ marginTop: '6px', color: 'var(--text-muted)' }}>
                            Roster ({myRoster.length}/{t.team_size}): {myRoster.map((m) => m.profile?.display_name).join(', ')}
                          </div>
                          {myRoster.length < t.team_size && t.status === 'registration_open' && (
                            <button
                              onClick={() => openTeamRosterModal(myReg)}
                              className="btn btn-secondary"
                              style={{ marginTop: '8px', padding: '4px 12px', fontSize: '0.75rem' }}
                            >
                              Manage Roster
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ) : !user ? (
                    <button onClick={() => setShowLoginModal(true)} className="btn btn-primary tournament-cta" disabled={t.status !== 'registration_open'}>
                      {t.status === 'registration_open' ? 'Register Now' : 'Registration Closed'}
                    </button>
                  ) : !isVerified ? (
                    <div className="tournament-registered-recap" style={{ background: 'rgba(245, 158, 11, 0.06)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                      Link &amp; verify your <strong>{mappedGameIdType}</strong> ID to register.
                      <button
                        onClick={() => handleTabClick('profile')}
                        className="btn btn-secondary"
                        style={{ marginTop: '8px', padding: '4px 12px', fontSize: '0.75rem', display: 'block' }}
                      >
                        Go to Profile
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openTournamentRegistration(t)}
                      disabled={t.status !== 'registration_open'}
                      className="btn btn-primary tournament-cta"
                    >
                      {t.status === 'registration_open' ? 'Register Now' : 'Registration Closed'}
                    </button>
                  )}

                  {myReg && myTournamentMatches.length > 0 && (
                    <div className="tournament-registered-recap" style={{ marginTop: '10px' }}>
                      <strong style={{ display: 'block', marginBottom: '6px' }}>
                        Your Match{myTournamentMatches.length > 1 ? 'es' : ''}
                      </strong>
                      {myTournamentMatches.map((m) => {
                        const others = (m.participants || []).filter((p) => p.registration_id !== myReg.id);
                        const otherNames = others
                          .map((p) => p.registration?.team_name || p.registration?.profile?.display_name || 'TBD')
                          .join(', ');
                        const myParticipant = (m.participants || []).find((p) => p.registration_id === myReg.id);
                        const isCaptain = myRoster.some((tm) => tm.user_id === user.id && tm.is_captain);
                        const withinCheckinWindow = !!m.scheduled_time
                          && new Date(m.scheduled_time).getTime() - Date.now() <= CHECKIN_WINDOW_MS;
                        const checkinOpensAt = m.scheduled_time
                          ? new Date(new Date(m.scheduled_time).getTime() - CHECKIN_WINDOW_MS).toISOString()
                          : null;

                        return (
                          <div key={m.id} style={{ marginBottom: '10px', color: 'var(--text-muted)' }}>
                            <div>
                              <span className={`badge badge-${m.status}`} style={{ marginRight: '6px' }}>{m.status.replace('_', ' ')}</span>
                              {m.label}{m.best_of > 1 ? ` (Bo${m.best_of})` : ''}
                              {m.match_type === 'bracket' ? (
                                others.length > 0 ? (
                                  <> vs <strong style={{ color: '#fff' }}>{otherNames}</strong></>
                                ) : (
                                  <> — Bye, you advance automatically</>
                                )
                              ) : (
                                others.length > 0 && <> with <strong style={{ color: '#fff' }}>{otherNames}</strong></>
                              )}
                            </div>

                            {m.status !== 'completed' && others.length > 0 && (
                              <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                                {m.scheduled_time ? (
                                  <>Starts in: <CountdownTimer target={m.scheduled_time} /></>
                                ) : (
                                  'Not scheduled yet'
                                )}
                              </div>
                            )}

                            {m.status !== 'completed' && others.length > 0 && checkinOpensAt && !withinCheckinWindow && !myParticipant?.checked_in_at && (
                              <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                Check-in opens in: <CountdownTimer target={checkinOpensAt} />
                              </div>
                            )}

                            {m.status !== 'completed' && others.length > 0 && myParticipant && (
                              <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
                                You: {myParticipant.checked_in_at ? '✅ Checked in' : '⏳ Not checked in'}
                                {' · '}
                                {others.map((p) => p.registration?.team_name || p.registration?.profile?.display_name || 'Opponent').join(', ')}: {' '}
                                {others.every((p) => p.checked_in_at) ? '✅ Checked in' : '⏳ Not checked in'}
                              </div>
                            )}

                            {m.status !== 'completed' && others.length > 0 && isCaptain && !myParticipant?.checked_in_at && withinCheckinWindow && (
                              <button
                                onClick={() => handleCheckInForMatch(m.id)}
                                className="btn btn-primary"
                                style={{ marginTop: '6px', padding: '4px 12px', fontSize: '0.75rem' }}
                              >
                                Check In
                              </button>
                            )}

                            {m.status !== 'completed' && others.length > 0 && isCaptain && myParticipant?.checked_in_at && (
                              <button
                                onClick={() => openMatchChat(m)}
                                className="btn btn-secondary"
                                style={{ marginTop: '6px', padding: '4px 12px', fontSize: '0.75rem' }}
                              >
                                💬 Open Chat
                              </button>
                            )}

                            {isCaptain && myParticipant?.checked_in_at && m.status !== 'completed' && m.status !== 'awaiting_review' && (
                              <button
                                onClick={() => openSubmitResultModal(m)}
                                className="btn btn-primary"
                                style={{ marginTop: '6px', marginLeft: '6px', padding: '4px 12px', fontSize: '0.75rem' }}
                              >
                                Submit Result
                              </button>
                            )}

                            {m.status === 'awaiting_review' && (
                              <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--warning)' }}>
                                ⏳ Result submitted, awaiting admin review.
                              </div>
                            )}

                            {m.status === 'completed' && m.match_type === 'bracket' && others.length > 0 && (
                              <div style={{ marginTop: '4px', fontWeight: 700, color: m.winner_registration_id === myReg.id ? 'var(--success)' : 'var(--danger)' }}>
                                {m.winner_registration_id === myReg.id ? '🏆 You won!' : 'You lost this match.'}
                              </div>
                            )}

                            {m.status === 'completed' && m.match_type === 'lobby' && myParticipant && (myParticipant.result_placement != null || myParticipant.result_points != null) && (
                              <div style={{ marginTop: '4px' }}>
                                Result: {myParticipant.result_placement != null ? `#${myParticipant.result_placement} placement` : ''}
                                {myParticipant.result_placement != null && myParticipant.result_points != null ? ', ' : ''}
                                {myParticipant.result_points != null ? `${myParticipant.result_points} points` : ''}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {historyTournaments.length > 0 && (
        <div style={{ margin: '32px 0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', textAlign: 'left' }}>Tournament History</h3>
          <div className="missions-grid">
            {historyTournaments.map((t) => {
            const myReg = myRegistrations.find((r) => r.tournament_id === t.id);
            const won = !!myReg && t.winner_registration_id === myReg.id;
            const winnerName = t.winner?.team_name || t.winner?.profile?.display_name;

            return (
              <div
                key={t.id}
                className="mission-card"
                onClick={() => openDetails(t)}
                style={{ cursor: 'pointer' }}
              >
                <div className="mission-card-image-wrap">
                  {t.banner_url ? (
                    <img src={t.banner_url} alt="" className="mission-card-img" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                      {GAME_ICON[t.game_type]}
                    </div>
                  )}
                  <span className="floating-badge floating-badge-featured">{GAME_ICON[t.game_type]} {t.game_type}</span>
                  <span
                    className="floating-badge floating-badge-difficulty"
                    style={{
                      background: won ? 'rgba(16, 185, 129, 0.85)' : 'rgba(9, 9, 11, 0.75)',
                      color: '#fff',
                      backdropFilter: 'blur(4px)',
                      border: won ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {won ? '🏆 Winner' : t.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                  </span>
                </div>
                <div className="mission-card-body">
                  <h3 className="mission-card-title">{t.title}</h3>
                  <div className="mission-card-game">
                    {winnerName ? `🏆 ${winnerName}` : 'Winner not announced'}
                  </div>
                  <div className="mission-card-info-row">
                    <div className="info-item info-item-reward">💰 Rs. {t.prize_pool.toLocaleString()}</div>
                    {t.xp_reward > 0 && <div className="info-item">⭐ {t.xp_reward} XP</div>}
                    {t.completed_at && (
                      <div className="info-item">📅 {new Date(t.completed_at).toLocaleDateString()}</div>
                    )}
                  </div>
                  <button type="button" className="btn-accept" onClick={() => openDetails(t)}>
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {detailsTournament && (
        <div className="modal-overlay" onClick={() => setDetailsTournament(null)}>
          <div className="modal-content" style={{ maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{detailsTournament.title}</h3>
              <button className="modal-close" onClick={() => setDetailsTournament(null)}>×</button>
            </div>

            {detailsTournament.banner_url && (
              <img
                src={detailsTournament.banner_url}
                alt=""
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '10px', marginBottom: '1rem' }}
              />
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span className={`badge badge-${detailsTournament.status}`}>{STATUS_LABEL[detailsTournament.status]}</span>
              <span className="badge">{GAME_ICON[detailsTournament.game_type]} {detailsTournament.game_type}</span>
            </div>

            {(() => {
              const myReg = myRegistrations.find((r) => r.tournament_id === detailsTournament.id);
              const myRoster = myReg ? myTeamMembers.filter((m) => m.registration_id === myReg.id) : [];
              const won = !!myReg && detailsTournament.winner_registration_id === myReg.id;
              const winnerName = detailsTournament.winner?.team_name || detailsTournament.winner?.profile?.display_name;

              return (
                <>
                  {detailsTournament.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{detailsTournament.description}</p>
                  )}
                  {detailsTournament.rules && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <strong style={{ color: '#fff' }}>Rules:</strong> {detailsTournament.rules}
                    </p>
                  )}

                  <div className="tournament-registered-recap" style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Prize Pool</span>
                      <strong style={{ color: 'var(--warning)' }}>Rs. {detailsTournament.prize_pool.toLocaleString()}</strong>
                    </div>
                    {detailsTournament.xp_reward > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>XP Reward</span>
                        <strong style={{ color: '#fff' }}>⭐ {detailsTournament.xp_reward} XP</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Winner</span>
                      <strong style={{ color: '#fff' }}>{winnerName || 'Not announced'}</strong>
                    </div>
                    {detailsTournament.completed_at && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Completed</span>
                        <strong style={{ color: '#fff' }}>
                          {new Date(detailsTournament.completed_at).toLocaleString()}
                        </strong>
                      </div>
                    )}
                  </div>

                  {myReg && (detailsTournament.status === 'completed' || detailsTournament.status === 'cancelled') && (
                    won ? (
                      <div className="tournament-history-result won">
                        🏆 You won! Rs. {(detailsTournament.prize_pool / Math.max(myRoster.length, 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })} credited to your wallet
                        {detailsTournament.xp_reward > 0 && <> + {detailsTournament.xp_reward} XP</>}.
                      </div>
                    ) : (
                      <div className="tournament-history-result lost">
                        {detailsTournament.status === 'cancelled' ? 'This tournament was cancelled.' : 'Tournament ended. Better luck next time!'}
                      </div>
                    )
                  )}
                </>
              );
            })()}

            {bracketMatches.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Bracket</h4>
                {Object.entries(
                  bracketMatches.reduce<Record<number, TournamentMatch[]>>((acc, m) => {
                    (acc[m.round] = acc[m.round] || []).push(m);
                    return acc;
                  }, {})
                ).map(([round, matches]) => (
                  <div key={round} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Round {round}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {matches.map((m) => {
                        const names = (m.participants || []).map((p) => p.registration?.team_name || p.registration?.profile?.display_name || 'Unknown');
                        const isBye = (m.participants || []).length === 1;
                        return (
                          <div key={m.id} style={{ padding: '0.5rem 0.65rem', background: 'var(--bg-card-hover)', borderRadius: '8px', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>
                                {isBye ? (
                                  <>{names[0]} <span style={{ color: 'var(--text-dim)' }}>(bye)</span></>
                                ) : (
                                  names.join(' vs ')
                                )}
                              </span>
                              <span className={`badge badge-${m.status}`}>{m.status.replace('_', ' ')}</span>
                            </div>
                            {m.winner_registration_id && !isBye && (
                              <div style={{ color: 'var(--success)', marginTop: '2px' }}>
                                🏆 {(m.participants || []).find((p) => p.registration_id === m.winner_registration_id)?.registration?.team_name
                                  || (m.participants || []).find((p) => p.registration_id === m.winner_registration_id)?.registration?.profile?.display_name}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => setDetailsTournament(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TournamentsScreen;
