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
}

const CHECKIN_WINDOW_MS = 30 * 60 * 1000;

const GAME_ICON: Record<Tournament['game_type'], string> = {
  MLBB: '🎮',
  PUBG: '🎯',
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
}: TournamentsScreenProps) {
  // Forces a re-render every second so the check-in button appears/disappears
  // live as the 30-minute window opens, without needing a page refresh.
  const [, setClockTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setClockTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="screen animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: '0.5rem' }}>Tournaments</h2>
      <p style={{ textAlign: 'left', marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Compete for real cash prizes. Register now before spots fill up.
      </p>

      {tournaments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No tournaments scheduled right now. Check back soon!
        </div>
      ) : (
        <div className="tournament-grid">
          {tournaments.map((t) => {
            const myReg = myRegistrations.find((r) => r.tournament_id === t.id);
            const myRoster = myReg ? myTeamMembers.filter((m) => m.registration_id === myReg.id) : [];
            const myTournamentMatches = myReg ? myMatches.filter((m) => m.tournament_id === t.id) : [];
            const pct = Math.min(100, Math.round((t.registered_count / t.min_participants) * 100));
            const minReached = t.registered_count >= t.min_participants;
            const unit = t.registration_unit === 'team' ? 'teams' : 'players';
            const mappedGameIdType = TOURNAMENT_GAME_ID_TYPE[t.game_type];
            const isVerified = gameIdLinks.some((link) => link.game_type === mappedGameIdType && link.status === 'verified');

            return (
              <div key={t.id} className={`tournament-card tournament-card-${t.game_type.toLowerCase()}`}>
                {t.banner_url && <img src={t.banner_url} alt="" className="tournament-card-banner" />}
                <div className="tournament-card-header">
                  <div>
                    <span className="tournament-game-icon">{GAME_ICON[t.game_type]}</span>
                    <div className="tournament-title">{t.title}</div>
                  </div>
                  <span className={`badge badge-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                </div>

                <div>
                  <div className="tournament-prize-label">Prize Pool</div>
                  <div className="tournament-prize">Rs. {t.prize_pool.toLocaleString()}</div>
                </div>

                {t.description && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.description}</p>
                )}

                <div>
                  <div className="tournament-progress-track">
                    <div
                      className={`tournament-progress-fill ${minReached ? 'min-reached' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="tournament-progress-label">
                    <span>{t.registered_count} / {t.min_participants} {unit} registered</span>
                    {minReached && <span style={{ color: 'var(--success)', fontWeight: 700 }}>✅ Minimum reached!</span>}
                  </div>
                </div>

                {t.rules && <p className="tournament-rules"><strong>Rules:</strong> {t.rules}</p>}

                {t.status === 'ongoing' && t.livestream_url && (
                  <a
                    href={t.livestream_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ background: 'var(--danger)', textAlign: 'center' }}
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
                          Roster ({myRoster.length}/5): {myRoster.map((m) => m.profile?.display_name).join(', ')}
                        </div>
                        {myRoster.length < 5 && t.status === 'registration_open' && (
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
                  <button onClick={() => setShowLoginModal(true)} className="btn btn-primary" disabled={t.status !== 'registration_open'}>
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
                    className="btn btn-primary"
                  >
                    {t.status === 'registration_open' ? 'Register Now' : 'Registration Closed'}
                  </button>
                )}

                {myReg && myTournamentMatches.length > 0 && (
                  <div className="tournament-registered-recap">
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TournamentsScreen;
