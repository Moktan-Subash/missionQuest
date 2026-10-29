import type { Challenge, VerifiedPlayer } from '../../types';

interface AcceptChallengeModalProps {
  challenge: Challenge;
  acceptTeamName: string;
  setAcceptTeamName: (name: string) => void;
  challengeRoster: VerifiedPlayer[];
  challengeRosterQuery: string;
  challengeRosterResults: VerifiedPlayer[];
  searchingChallengeRoster: boolean;
  handleSearchChallengeRoster: (query: string, gameType: Challenge['game_type']) => void;
  handleAddChallengeRosterPlayer: (player: VerifiedPlayer, maxSize: number) => void;
  handleRemoveChallengeRosterPlayer: (playerId: string) => void;
  acceptingChallengeSubmitting: boolean;
  acceptChallengeError: string;
  onSubmit: () => void;
  onClose: () => void;
}

function AcceptChallengeModal({
  challenge,
  acceptTeamName,
  setAcceptTeamName,
  challengeRoster,
  challengeRosterQuery,
  challengeRosterResults,
  searchingChallengeRoster,
  handleSearchChallengeRoster,
  handleAddChallengeRosterPlayer,
  handleRemoveChallengeRosterPlayer,
  acceptingChallengeSubmitting,
  acceptChallengeError,
  onSubmit,
  onClose,
}: AcceptChallengeModalProps) {
  const teamSize = challenge.team_size || 2;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '460px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>Accept Challenge</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {acceptChallengeError && (
          <div className="form-error">
            {acceptChallengeError}
          </div>
        )}

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Rs. {challenge.stake_amount.toLocaleString()} will be held from your wallet. You'll be the captain funding your team's stake.
        </p>

        <div className="form-group">
          <label className="form-label">Team name</label>
          <input
            type="text"
            className="form-control"
            value={acceptTeamName}
            onChange={(e) => setAcceptTeamName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teammates ({challengeRoster.length}/{teamSize - 1})</label>
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
                onChange={(e) => handleSearchChallengeRoster(e.target.value, challenge.game_type)}
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

        <button
          onClick={onSubmit}
          disabled={acceptingChallengeSubmitting}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {acceptingChallengeSubmitting ? 'Accepting...' : 'Accept Challenge'}
        </button>
      </div>
    </div>
  );
}

export default AcceptChallengeModal;
