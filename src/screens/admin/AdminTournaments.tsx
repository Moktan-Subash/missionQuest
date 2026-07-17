import { useState } from 'react';
import type { Tournament, TournamentRegistration, TournamentTeamMember, TournamentMatch } from '../../types';

interface AdminTournamentsProps {
  tournaments: Tournament[];
  openCreateTournamentModal: () => void;
  openEditTournamentModal: (tournament: Tournament) => void;
  handleUpdateTournamentStatus: (tournamentId: string, status: Tournament['status']) => void;
  adminTournamentRegistrations: TournamentRegistration[];
  adminTournamentTeamMembers: TournamentTeamMember[];
  adminTournamentMatches: TournamentMatch[];
  fetchTournamentRegistrations: (tournamentId: string) => void;
  handleRemoveTournamentRegistration: (registrationId: string, tournamentId: string) => void;
  handleGenerateMatches: (tournament: Tournament) => void;
  generatingMatches: boolean;
  handleSetScheduledTime: (matchId: string, tournamentId: string, scheduledTimeLocal: string) => void;
  handleConfirmMatchResult: (matchId: string, winnerRegistrationId: string, tournamentId: string) => void;
  handleUpdateLobbyResult: (participantId: string, placement: number | null, points: number | null, tournamentId: string) => void;
  handleMarkMatchCompleted: (matchId: string, tournamentId: string) => void;
}

const STATUS_OPTIONS: Tournament['status'][] = ['upcoming', 'registration_open', 'ongoing', 'completed', 'cancelled'];

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in the viewer's local
// time, not UTC -- so the stored UTC ISO string needs the timezone offset
// baked back in before slicing, or every admin would see a time shifted by
// their UTC offset.
function toLocalInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function AdminTournaments({
  tournaments,
  openCreateTournamentModal,
  openEditTournamentModal,
  handleUpdateTournamentStatus,
  adminTournamentRegistrations,
  adminTournamentTeamMembers,
  adminTournamentMatches,
  fetchTournamentRegistrations,
  handleRemoveTournamentRegistration,
  handleGenerateMatches,
  generatingMatches,
  handleSetScheduledTime,
  handleConfirmMatchResult,
  handleUpdateLobbyResult,
  handleMarkMatchCompleted,
}: AdminTournamentsProps) {
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [scheduleInputs, setScheduleInputs] = useState<Record<string, string>>({});
  const [lobbyScoreInputs, setLobbyScoreInputs] = useState<Record<string, { placement: string; points: string }>>({});

  return (
    <div className="card" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h3 style={{ color: '#fff' }}>All Tournaments ({tournaments.length})</h3>
        <button onClick={openCreateTournamentModal} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
          + New Tournament
        </button>
      </div>

      {tournaments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No tournaments created yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tournaments.map((t) => (
            <div key={t.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'var(--bg-card-hover)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{t.title}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> · {t.game_type} · Rs. {t.prize_pool.toLocaleString()} prize</span>
                </div>
                <span className={`badge badge-${t.status}`}>{t.status.replace('_', ' ')}</span>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {t.registered_count} / {t.min_participants} {t.registration_unit === 'team' ? 'teams' : 'players'} registered
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={t.status}
                  onChange={(e) => handleUpdateTournamentStatus(t.id, e.target.value as Tournament['status'])}
                  className="form-control"
                  style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
                <button onClick={() => openEditTournamentModal(t)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Edit
                </button>
                <button
                  onClick={() => {
                    const next = viewingId === t.id ? null : t.id;
                    setViewingId(next);
                    if (next) fetchTournamentRegistrations(t.id);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {viewingId === t.id ? 'Hide' : 'View'} Registrations
                </button>
              </div>

              {viewingId === t.id && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  {adminTournamentRegistrations.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registrations yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {adminTournamentRegistrations.map((r) => {
                        const roster = adminTournamentTeamMembers.filter((m) => m.registration_id === r.id);
                        return (
                          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', padding: '0.6rem 0.85rem', background: 'var(--bg-card)', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <div>
                              <strong style={{ color: '#fff' }}>{r.team_name || r.profile?.display_name}</strong>
                              {roster.length > 0 && (
                                <span style={{ color: 'var(--text-muted)' }}>
                                  {' '}· ({roster.length}/5) {roster.map((m) => m.profile?.display_name).join(', ')}
                                </span>
                              )}
                              {r.team_name && (
                                <span style={{ color: 'var(--text-dim)' }}> (captain: {r.profile?.display_name})</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveTournamentRegistration(r.id, t.id)}
                              className="btn btn-secondary"
                              style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <h4 style={{ color: '#fff', margin: 0 }}>
                        {t.registration_unit === 'team' ? 'Bracket' : 'Lobbies'} ({adminTournamentMatches.length})
                      </h4>
                      {adminTournamentMatches.length === 0 && (
                        <button
                          onClick={() => handleGenerateMatches(t)}
                          disabled={generatingMatches}
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                        >
                          {generatingMatches ? 'Generating...' : t.registration_unit === 'team' ? 'Generate Bracket' : 'Generate Lobbies'}
                        </button>
                      )}
                    </div>

                    {adminTournamentMatches.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Not generated yet. This shuffles current registrations into {t.registration_unit === 'team' ? 'round-1 matches' : 'lobby groups'} and can't be undone.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {adminTournamentMatches.map((m) => (
                          <div key={m.id} style={{ padding: '0.6rem 0.85rem', background: 'var(--bg-card)', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <strong style={{ color: '#fff' }}>
                                {m.label}{m.best_of > 1 ? ` (Bo${m.best_of})` : ''}
                              </strong>
                              <span className={`badge badge-${m.status}`}>{m.status.replace('_', ' ')}</span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                              {(m.participants || [])
                                .map((p) => p.registration?.team_name || p.registration?.profile?.display_name || 'Unknown')
                                .join(' vs ')}
                              {m.winner_registration_id && (
                                <span style={{ color: 'var(--success)' }}>
                                  {' '}· Winner: {(m.participants || []).find((p) => p.registration_id === m.winner_registration_id)?.registration?.team_name
                                    || (m.participants || []).find((p) => p.registration_id === m.winner_registration_id)?.registration?.profile?.display_name}
                                </span>
                              )}
                            </div>

                            {(m.participants || []).length > 0 && m.status !== 'completed' && (
                              <div style={{ color: 'var(--text-dim)', marginTop: '0.35rem', fontSize: '0.8rem' }}>
                                Check-in: {(m.participants || [])
                                  .map((p) => `${p.registration?.team_name || p.registration?.profile?.display_name || 'Unknown'} ${p.checked_in_at ? '✅' : '⏳'}`)
                                  .join('   ')}
                              </div>
                            )}

                            {m.status !== 'completed' && (
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                <input
                                  type="datetime-local"
                                  className="form-control"
                                  style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                  value={scheduleInputs[m.id] ?? toLocalInputValue(m.scheduled_time)}
                                  onChange={(e) => setScheduleInputs((prev) => ({ ...prev, [m.id]: e.target.value }))}
                                />
                                <button
                                  onClick={() => handleSetScheduledTime(m.id, t.id, scheduleInputs[m.id] ?? toLocalInputValue(m.scheduled_time))}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                                >
                                  Set Time
                                </button>
                              </div>
                            )}

                            {m.match_type === 'bracket' && m.status !== 'completed' && (m.participants || []).length === 2 && (
                              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                                {m.proposed_winner_registration_id ? (
                                  <div style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                                    Proposed winner: <strong style={{ color: '#fff' }}>
                                      {(m.participants || []).find((p) => p.registration_id === m.proposed_winner_registration_id)?.registration?.team_name
                                        || (m.participants || []).find((p) => p.registration_id === m.proposed_winner_registration_id)?.registration?.profile?.display_name
                                        || 'Unknown'}
                                    </strong>
                                    {m.result_proof_url && (
                                      <> · <a href={m.result_proof_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>View proof</a></>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-dim)' }}>
                                    No result submitted yet — confirm manually if needed.
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  {(m.participants || []).map((p) => (
                                    <button
                                      key={p.id}
                                      onClick={() => handleConfirmMatchResult(m.id, p.registration_id, t.id)}
                                      className={p.registration_id === m.proposed_winner_registration_id ? 'btn btn-primary' : 'btn btn-secondary'}
                                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                                    >
                                      Confirm: {p.registration?.team_name || p.registration?.profile?.display_name || 'Unknown'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {m.match_type === 'lobby' && m.status !== 'completed' && (
                              <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>Enter placement/points per player:</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                  {(m.participants || []).map((p) => {
                                    const key = p.id;
                                    const inputVal = lobbyScoreInputs[key] ?? {
                                      placement: p.result_placement != null ? String(p.result_placement) : '',
                                      points: p.result_points != null ? String(p.result_points) : '',
                                    };
                                    return (
                                      <div key={p.id} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.8rem' }}>
                                        <span style={{ flex: 1, color: 'var(--text-muted)' }}>{p.registration?.profile?.display_name || 'Unknown'}</span>
                                        <input
                                          type="number"
                                          placeholder="Placement"
                                          className="form-control"
                                          style={{ width: '90px', padding: '0.25rem 0.5rem' }}
                                          value={inputVal.placement}
                                          onChange={(e) => setLobbyScoreInputs((prev) => ({ ...prev, [key]: { ...inputVal, placement: e.target.value } }))}
                                        />
                                        <input
                                          type="number"
                                          placeholder="Points"
                                          className="form-control"
                                          style={{ width: '90px', padding: '0.25rem 0.5rem' }}
                                          value={inputVal.points}
                                          onChange={(e) => setLobbyScoreInputs((prev) => ({ ...prev, [key]: { ...inputVal, points: e.target.value } }))}
                                        />
                                        <button
                                          onClick={() => handleUpdateLobbyResult(
                                            p.id,
                                            inputVal.placement === '' ? null : Number(inputVal.placement),
                                            inputVal.points === '' ? null : Number(inputVal.points),
                                            t.id
                                          )}
                                          className="btn btn-secondary"
                                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem' }}
                                        >
                                          Save
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                                <button
                                  onClick={() => handleMarkMatchCompleted(m.id, t.id)}
                                  className="btn btn-primary"
                                  style={{ marginTop: '0.5rem', padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                                >
                                  Mark Lobby Completed
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminTournaments;
