export interface TournamentFormState {
  game_type: 'MLBB' | 'PUBG';
  title: string;
  description: string;
  prize_pool: string;
  min_participants: string;
  livestream_url: string;
  rules: string;
}

interface TournamentFormModalProps {
  setShowTournamentFormModal: (show: boolean) => void;
  tournamentForm: TournamentFormState;
  setTournamentForm: (form: TournamentFormState) => void;
  editingTournamentId: string | null;
  tournamentFormError: string;
  handleSaveTournament: (e: React.FormEvent) => void;
  tournamentBannerFile: File | null;
  setTournamentBannerFile: (file: File | null) => void;
  existingBannerUrl: string | null;
  savingTournament: boolean;
}

function TournamentFormModal({
  setShowTournamentFormModal,
  tournamentForm,
  setTournamentForm,
  editingTournamentId,
  tournamentFormError,
  handleSaveTournament,
  tournamentBannerFile,
  setTournamentBannerFile,
  existingBannerUrl,
  savingTournament,
}: TournamentFormModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3>{editingTournamentId ? 'Edit Tournament' : 'New Tournament'}</h3>
          <button className="modal-close" onClick={() => setShowTournamentFormModal(false)}>×</button>
        </div>

        {tournamentFormError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {tournamentFormError}
          </div>
        )}

        <form onSubmit={handleSaveTournament}>
          <div className="form-group">
            <label className="form-label">Game</label>
            <select
              className="form-control"
              value={tournamentForm.game_type}
              disabled={!!editingTournamentId}
              onChange={(e) => {
                const game_type = e.target.value as 'MLBB' | 'PUBG';
                setTournamentForm({
                  ...tournamentForm,
                  game_type,
                  min_participants: game_type === 'MLBB' ? '76' : '500',
                });
              }}
            >
              <option value="MLBB">Mobile Legends (team of 5)</option>
              <option value="PUBG">PUBG Mobile (solo)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              required
              value={tournamentForm.title}
              onChange={(e) => setTournamentForm({ ...tournamentForm, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={tournamentForm.description}
              onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Prize Pool (Rs.)</label>
              <input
                type="number"
                className="form-control"
                required
                min="0"
                value={tournamentForm.prize_pool}
                onChange={(e) => setTournamentForm({ ...tournamentForm, prize_pool: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Min {tournamentForm.game_type === 'MLBB' ? 'Teams' : 'Players'}</label>
              <input
                type="number"
                className="form-control"
                required
                min="1"
                value={tournamentForm.min_participants}
                onChange={(e) => setTournamentForm({ ...tournamentForm, min_participants: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Livestream URL (shown once the tournament goes live)</label>
            <input
              type="text"
              className="form-control"
              placeholder="https://youtube.com/..."
              value={tournamentForm.livestream_url}
              onChange={(e) => setTournamentForm({ ...tournamentForm, livestream_url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rules</label>
            <textarea
              className="form-control"
              rows={3}
              value={tournamentForm.rules}
              onChange={(e) => setTournamentForm({ ...tournamentForm, rules: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Banner Image</label>
            {(tournamentBannerFile || existingBannerUrl) && (
              <img
                src={tournamentBannerFile ? URL.createObjectURL(tournamentBannerFile) : existingBannerUrl!}
                alt=""
                style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setTournamentBannerFile(e.target.files?.[0] || null)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTournamentFormModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={savingTournament}>
              {savingTournament ? 'Saving...' : editingTournamentId ? 'Save Changes' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TournamentFormModal;
