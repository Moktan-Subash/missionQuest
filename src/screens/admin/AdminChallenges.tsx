import type { Challenge } from '../../types';

interface AdminChallengesProps {
  adminPendingChallenges: Challenge[];
  handleConfirmChallengeResult: (challengeId: string, winnerUserId: string) => void;
}

function sideLabel(challenge: Challenge, side: 'creator' | 'acceptor'): string {
  const teamName = side === 'creator' ? challenge.creator_team_name : challenge.acceptor_team_name;
  const profile = side === 'creator' ? challenge.creator_profile : challenge.acceptor_profile;
  return teamName || profile?.display_name || 'Unknown';
}

function AdminChallenges({ adminPendingChallenges, handleConfirmChallengeResult }: AdminChallengesProps) {
  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Challenges Awaiting Review ({adminPendingChallenges.length})</h3>

      {adminPendingChallenges.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          No challenge results waiting on confirmation.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {adminPendingChallenges.map((c) => (
            <div key={c.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <strong style={{ color: '#fff' }}>
                  {c.game_type} · Rs. {c.stake_amount.toLocaleString()} stake ({c.mode === 'team' ? `Team of ${c.team_size}` : 'Solo'})
                </strong>
                <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {sideLabel(c, 'creator')} vs {sideLabel(c, 'acceptor')}
              </div>

              {c.proposed_winner_user_id && (
                <div style={{ fontSize: '0.8rem', marginTop: '0.35rem' }}>
                  Proposed winner: <strong style={{ color: '#fff' }}>
                    {c.proposed_winner_user_id === c.creator_user_id ? sideLabel(c, 'creator') : sideLabel(c, 'acceptor')}
                  </strong>
                </div>
              )}

              {c.result_proof_url && (
                <a href={c.result_proof_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                  <img
                    src={c.result_proof_url}
                    alt="Result proof"
                    style={{ maxWidth: '220px', maxHeight: '160px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'block' }}
                  />
                </a>
              )}

              <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {c.creator_user_id && (
                    <button
                      onClick={() => handleConfirmChallengeResult(c.id, c.creator_user_id)}
                      className={c.proposed_winner_user_id === c.creator_user_id ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      Confirm: {sideLabel(c, 'creator')}
                    </button>
                  )}
                  {c.acceptor_user_id && (
                    <button
                      onClick={() => handleConfirmChallengeResult(c.id, c.acceptor_user_id!)}
                      className={c.proposed_winner_user_id === c.acceptor_user_id ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      Confirm: {sideLabel(c, 'acceptor')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminChallenges;
