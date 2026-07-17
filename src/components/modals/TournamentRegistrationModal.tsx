import type { Tournament } from '../../types';

interface TournamentRegistrationModalProps {
  registeringTournament: Tournament;
  setShowTournamentRegModal: (show: boolean) => void;
  tournamentRegForm: { team_name: string };
  setTournamentRegForm: (form: { team_name: string }) => void;
  submittingTournamentReg: boolean;
  tournamentRegError: string;
  handleSubmitTournamentRegistration: (e: React.FormEvent) => void;
}

function TournamentRegistrationModal({
  registeringTournament,
  setShowTournamentRegModal,
  tournamentRegForm,
  setTournamentRegForm,
  submittingTournamentReg,
  tournamentRegError,
  handleSubmitTournamentRegistration,
}: TournamentRegistrationModalProps) {
  const isTeam = registeringTournament.registration_unit === 'team';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Register: {registeringTournament.title}</h3>
          <button className="modal-close" onClick={() => setShowTournamentRegModal(false)}>×</button>
        </div>

        {tournamentRegError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {tournamentRegError}
          </div>
        )}

        <form onSubmit={handleSubmitTournamentRegistration}>
          {isTeam ? (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Team Name</label>
              <input
                type="text"
                className="form-control"
                required
                value={tournamentRegForm.team_name}
                onChange={(e) => setTournamentRegForm({ ...tournamentRegForm, team_name: e.target.value })}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                You'll be the team captain. After creating your team, you can search for and add up to 4 more verified players.
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              You're registering as a solo player. Click confirm to lock in your spot.
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTournamentRegModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingTournamentReg}>
              {submittingTournamentReg ? 'Registering...' : isTeam ? 'Create Team' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TournamentRegistrationModal;
