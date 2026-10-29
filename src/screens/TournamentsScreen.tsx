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
  deepLinkTournamentId: string | null;
  clearDeepLinkTournament: () => void;
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
  deepLinkTournamentId,
  clearDeepLinkTournament,
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

  // Notification deep-link: open the specific tournament once it's mounted
  // and the tournaments list has loaded, then clear the pending target so it
  // doesn't re-trigger on every re-render.
  useEffect(() => {
    if (!deepLinkTournamentId) return;
    const target = tournaments.find((t) => t.id === deepLinkTournamentId);
    if (target) {
      openDetails(target);
      clearDeepLinkTournament();
    }
  }, [deepLinkTournamentId, tournaments]);

  return (
    <div className="screen animate-fade-in page">
      <div className="page-head">
        <div>
          <h2 className="page-title font-display">Tournaments</h2>
          <p className="page-subtitle">
            Compete for real cash prizes. Register now before spots fill up.
          </p>
        </div>
      </div>

      {activeTournaments.length === 0 ? (
        <div className="page-empty">
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
                <div
                  className="mission-card-image-wrap clickable"
                  onClick={() => setExpandedTournamentId(expandedTournamentId === t.id ? null : t.id)}
                >
                  {t.banner_url ? (
                    <img src={t.banner_url} alt="" className="mission-card-img" />
                  ) : (
                    <div className="card-art-fallback">
                      {GAME_ICON[t.game_type]}
                    </div>
                  )}
                  <span className="floating-badge floating-badge-featured">{GAME_ICON[t.game_type]} {t.game_type}</span>
                  <span className={`floating-badge floating-badge-difficulty badge badge-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </div>
                <div className="mission-card-body">
                  <div
                    className="clickable"
                    onClick={() => setExpandedTournamentId(expandedTournamentId === t.id ? null : t.id)}
                  >
                    <h3 className="mission-card-title">{t.title}</h3>
                    <div className="mission-card-info-row">
                      <div className="info-item info-item-reward">💰 Rs. {t.prize_pool.toLocaleString()}</div>
                      {t.xp_reward > 0 && <div className="info-item">⭐ {t.xp_reward} XP</div>}
                      <div className="info-item">{t.registered_count}/{t.min_participants} {unit}</div>
                    </div>

                    {(t.registration_deadline || t.start_date) && (
                      <div className="mission-card-info-row">
                        {t.registration_deadline && (
                          <div className="info-item info-item-sm">
                            🕒 Reg. closes {new Date(t.registration_deadline).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        {t.start_date && (
                          <div className="info-item info-item-sm">
                            🚀 Starts {new Date(t.start_date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="tournament-progress">
                      <div className="tournament-progress-track">
                        <div
                          className={`tournament-progress-fill ${minReached ? 'min-reached' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {minReached && <div className="tournament-min-reached">✅ Minimum reached!</div>}
                    </div>

                    {expandedTournamentId === t.id && (t.description || t.rules) && (
                      <div className="card-details">
                        {t.description && <p className="card-details-desc">{t.description}</p>}
                        {t.rules && <p><strong>Rules:</strong> {t.rules}</p>}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => openDetails(t)}
                  >
                    View bracket & details →
                  </button>

                  {t.status === 'ongoing' && t.livestream_url && (
                    <a
                      href={t.livestream_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-live"
                    >
                      🔴 Watch Live
                    </a>
                  )}

                  {myReg ? (
                    <div className="tournament-registered-recap">
                      ✅ You're registered{myReg.team_name ? ` as "${myReg.team_name}"` : ''}.
                      {t.registration_unit === 'team' && (
                        <>
                          <div className="recap-sub">
                            Roster ({myRoster.length}/{t.team_size}): {myRoster.map((m) => m.profile?.display_name).join(', ')}
                          </div>
                          {myRoster.length < t.team_size && t.status === 'registration_open' && (
                            <button
                              onClick={() => openTeamRosterModal(myReg)}
                              className="btn btn-secondary btn-sm"
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
                    <div className="tournament-registered-recap is-warning">
                      Link &amp; verify your <strong>{mappedGameIdType}</strong> ID to register.
                      <button
                        onClick={() => handleTabClick('profile')}
                        className="btn btn-secondary btn-sm"
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
                    <div className="tournament-registered-recap">
                      <strong className="recap-title">
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
                          <div key={m.id} className="match-item">
                            <div>
                              <span className={`badge badge-${m.status}`}>{m.status.replace('_', ' ')}</span>
                              {m.label}{m.best_of > 1 ? ` (Bo${m.best_of})` : ''}
                              {m.match_type === 'bracket' ? (
                                others.length > 0 ? (
                                  <> vs <strong>{otherNames}</strong></>
                                ) : (
                                  <> — Bye, you advance automatically</>
                                )
                              ) : (
                                others.length > 0 && <> with <strong>{otherNames}</strong></>
                              )}
                            </div>

                            {m.status !== 'completed' && others.length > 0 && (
                              <div className="match-line">
                                {m.scheduled_time ? (
                                  <>Starts in: <CountdownTimer target={m.scheduled_time} /></>
                                ) : (
                                  'Not scheduled yet'
                                )}
                              </div>
                            )}

                            {m.status !== 'completed' && others.length > 0 && checkinOpensAt && !withinCheckinWindow && !myParticipant?.checked_in_at && (
                              <div className="match-line text-muted">
                                Check-in opens in: <CountdownTimer target={checkinOpensAt} />
                              </div>
                            )}

                            {m.status !== 'completed' && others.length > 0 && myParticipant && (
                              <div className="match-line">
                                You: {myParticipant.checked_in_at ? '✅ Checked in' : '⏳ Not checked in'}
                                {' · '}
                                {others.map((p) => p.registration?.team_name || p.registration?.profile?.display_name || 'Opponent').join(', ')}: {' '}
                                {others.every((p) => p.checked_in_at) ? '✅ Checked in' : '⏳ Not checked in'}
                              </div>
                            )}

                            {m.status !== 'completed' && others.length > 0 && isCaptain && !myParticipant?.checked_in_at && withinCheckinWindow && (
                              <button
                                onClick={() => handleCheckInForMatch(m.id)}
                                className="btn btn-primary btn-sm match-btn"
                              >
                                Check In
                              </button>
                            )}

                            {m.status !== 'completed' && others.length > 0 && isCaptain && myParticipant?.checked_in_at && (
                              <button
                                onClick={() => openMatchChat(m)}
                                className="btn btn-secondary btn-sm match-btn"
                              >
                                💬 Open Chat
                              </button>
                            )}

                            {isCaptain && myParticipant?.checked_in_at && m.status !== 'completed' && m.status !== 'awaiting_review' && (
                              <button
                                onClick={() => openSubmitResultModal(m)}
                                className="btn btn-primary btn-sm match-btn"
                              >
                                Submit Result
                              </button>
                            )}

                            {m.status === 'awaiting_review' && (
                              <div className="match-line text-warning">
                                ⏳ Result submitted, awaiting admin review.
                              </div>
                            )}

                            {m.status === 'completed' && m.match_type === 'bracket' && others.length > 0 && (
                              <div className={`match-line ${m.winner_registration_id === myReg.id ? 'text-success' : 'text-danger'}`}>
                                {m.winner_registration_id === myReg.id ? '🏆 You won!' : 'You lost this match.'}
                              </div>
                            )}

                            {m.status === 'completed' && m.match_type === 'lobby' && myParticipant && (myParticipant.result_placement != null || myParticipant.result_points != null) && (
                              <div className="match-line">
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
        <div className="page-section">
          <h3 className="page-section-title">Tournament History</h3>
          <div className="missions-grid">
            {historyTournaments.map((t) => {
            const myReg = myRegistrations.find((r) => r.tournament_id === t.id);
            const won = !!myReg && t.winner_registration_id === myReg.id;
            const winnerName = t.winner?.team_name || t.winner?.profile?.display_name;

            return (
              <div
                key={t.id}
                className="mission-card clickable"
                onClick={() => openDetails(t)}
              >
                <div className="mission-card-image-wrap">
                  {t.banner_url ? (
                    <img src={t.banner_url} alt="" className="mission-card-img" />
                  ) : (
                    <div className="card-art-fallback">
                      {GAME_ICON[t.game_type]}
                    </div>
                  )}
                  <span className="floating-badge floating-badge-featured">{GAME_ICON[t.game_type]} {t.game_type}</span>
                  <span className={`floating-badge floating-badge-difficulty ${won ? 'floating-badge-won' : 'floating-badge-past'}`}>
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
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{detailsTournament.title}</h3>
              <button className="modal-close" onClick={() => setDetailsTournament(null)}>×</button>
            </div>

            {detailsTournament.banner_url && (
              <img src={detailsTournament.banner_url} alt="" className="modal-banner" />
            )}

            <div className="modal-tags">
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
                    <p className="modal-text">{detailsTournament.description}</p>
                  )}
                  {detailsTournament.rules && (
                    <p className="modal-text">
                      <strong>Rules:</strong> {detailsTournament.rules}
                    </p>
                  )}

                  <div className="tournament-registered-recap kv-list">
                    <div className="kv-row">
                      <span>Prize Pool</span>
                      <strong className="text-warning">Rs. {detailsTournament.prize_pool.toLocaleString()}</strong>
                    </div>
                    {detailsTournament.xp_reward > 0 && (
                      <div className="kv-row">
                        <span>XP Reward</span>
                        <strong>⭐ {detailsTournament.xp_reward} XP</strong>
                      </div>
                    )}
                    <div className="kv-row">
                      <span>Winner</span>
                      <strong>{winnerName || 'Not announced'}</strong>
                    </div>
                    {detailsTournament.completed_at && (
                      <div className="kv-row">
                        <span>Completed</span>
                        <strong>
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
              <div>
                <h4 className="modal-section-title">Bracket</h4>
                {Object.entries(
                  bracketMatches.reduce<Record<number, TournamentMatch[]>>((acc, m) => {
                    (acc[m.round] = acc[m.round] || []).push(m);
                    return acc;
                  }, {})
                ).map(([round, matches]) => (
                  <div key={round} className="bracket-round">
                    <div className="section-label">
                      Round {round}
                    </div>
                    <div className="bracket-matches">
                      {matches.map((m) => {
                        const names = (m.participants || []).map((p) => p.registration?.team_name || p.registration?.profile?.display_name || 'Unknown');
                        const isBye = (m.participants || []).length === 1;
                        return (
                          <div key={m.id} className="bracket-match">
                            <div className="bracket-match-head">
                              <span>
                                {isBye ? (
                                  <>{names[0]} <span className="text-muted">(bye)</span></>
                                ) : (
                                  names.join(' vs ')
                                )}
                              </span>
                              <span className={`badge badge-${m.status}`}>{m.status.replace('_', ' ')}</span>
                            </div>
                            {m.winner_registration_id && !isBye && (
                              <div className="bracket-match-winner">
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
              className="btn btn-secondary btn-block"
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
