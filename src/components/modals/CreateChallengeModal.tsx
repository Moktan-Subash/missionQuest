import type { Challenge, VerifiedPlayer } from '../../types';

interface ChallengeFormState {
  game_type: Challenge['game_type'];
  mode: Challenge['mode'];
  stake_amount: string;
  team_size: string;
  team_name: string;
}

interface CreateChallengeModalProps {
  challengeForm: ChallengeFormState;
  setChallengeForm: (form: ChallengeFormState) => void;
  challengeRoster: VerifiedPlayer[];
  challengeRosterQuery: string;
  challengeRosterResults: VerifiedPlayer[];
  searchingChallengeRoster: boolean;
  handleSearchChallengeRoster: (query: string, gameType: Challenge['game_type']) => void;
  handleAddChallengeRosterPlayer: (player: VerifiedPlayer, maxSize: number) => void;
  handleRemoveChallengeRosterPlayer: (playerId: string) => void;
  creatingChallenge: boolean;
  challengeFormError: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const GAME_OPTIONS: Array<{ value: Challenge['game_type']; label: string }> = [
  { value: 'MLBB', label: '🎮 Mobile Legends' },
  { value: 'PUBG', label: '🎯 PUBG Mobile' },
  { value: 'FREEFIRE', label: '🔥 Free Fire' },
  { value: 'COD', label: '🔫 Call of Duty Mobile' },
  { value: 'CR', label: '👑 Clash Royale' },
];

function CreateChallengeModal({
  challengeForm,
  setChallengeForm,
  challengeRoster,
  challengeRosterQuery,
  challengeRosterResults,
  searchingChallengeRoster,
  handleSearchChallengeRoster,
  handleAddChallengeRosterPlayer,
  handleRemoveChallengeRosterPlayer,
  creatingChallenge,
  challengeFormError,
  onSubmit,
  onClose,
}: CreateChallengeModalProps) {
  const isTeam = challengeForm.mode === 'team';
  const teamSize = parseInt(challengeForm.team_size, 10) || 2;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '460px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>Create Challenge</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {challengeFormError && (
          <div className="form-error">
            {challengeFormError}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Game</label>
            <select
              className="form-control"
              value={challengeForm.game_type}
              onChange={(e) => setChallengeForm({ ...challengeForm, game_type: e.target.value as Challenge['game_type'] })}
            >
              {GAME_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Format</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mode"
                  checked={challengeForm.mode === 'solo'}
                  onChange={() => setChallengeForm({ ...challengeForm, mode: 'solo' })}
                />
                Solo 1v1
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mode"
                  checked={challengeForm.mode === 'team'}
                  onChange={() => setChallengeForm({ ...challengeForm, mode: 'team' })}
                />
                Team vs Team
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Stake per side (Rs.)</label>
            <input
              type="number"
              className="form-control"
              min="1"
              step="1"
              value={challengeForm.stake_amount}
              onChange={(e) => setChallengeForm({ ...challengeForm, stake_amount: e.target.value })}
              required
            />
          </div>

          {isTeam && (
            <>
              <div className="form-group">
                <label className="form-label">Team size</label>
                <select
                  className="form-control"
                  value={challengeForm.team_size}
                  onChange={(e) => setChallengeForm({ ...challengeForm, team_size: e.target.value })}
                >
                  {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} players</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Team name</label>
                <input
                  type="text"
                  className="form-control"
                  value={challengeForm.team_name}
                  onChange={(e) => setChallengeForm({ ...challengeForm, team_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Teammates ({challengeRoster.length}/{teamSize - 1}) -- you're the captain, funding the whole stake
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  {challengeRoster.map((p) => (
                    <div key={p.id} className="profile-row">
                      <span className="profile-row-label">{p.display_name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChallengeRosterPlayer(p.id)}
                        className="btn btn-secondary"
                        style={{ padding: '2px 10px', fontSize: '0.7rem', color: 'var(--danger)' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {challengeRoster.length < teamSize - 1 && (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search verified players..."
                      value={challengeRosterQuery}
                      onChange={(e) => handleSearchChallengeRoster(e.target.value, challengeForm.game_type)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto', marginTop: '0.4rem' }}>
                      {searchingChallengeRoster && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Searching...</p>}
                      {challengeRosterResults.map((p) => (
                        <div key={p.id} className="profile-row">
                          <span className="profile-row-label">
                            {p.display_name} <span style={{ color: 'var(--text-dim)', fontFamily: 'monospace', fontSize: '0.75rem' }}>({p.in_game_id})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddChallengeRosterPlayer(p, teamSize - 1)}
                            className="btn btn-primary"
                            style={{ padding: '2px 12px', fontSize: '0.75rem' }}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <button type="submit" disabled={creatingChallenge} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {creatingChallenge ? 'Creating...' : 'Create Challenge'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateChallengeModal;
