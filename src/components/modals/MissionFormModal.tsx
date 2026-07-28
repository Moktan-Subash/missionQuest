interface MissionFormState {
  title: string;
  description: string;
  game: string;
  customGame: string;
  reward_amount: string;
  xp_reward: string;
  rules: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  is_active: boolean;
  allows_video_link: boolean;
}

interface MissionFormModalProps {
  editingMissionId: string | null;
  setShowMissionModal: (show: boolean) => void;
  missionFormError: string;
  missionForm: MissionFormState;
  setMissionForm: (form: MissionFormState) => void;
  gameOptions: string[];
  handleSaveMission: (e: React.FormEvent) => void;
}

function MissionFormModal({
  editingMissionId,
  setShowMissionModal,
  missionFormError,
  missionForm,
  setMissionForm,
  gameOptions,
  handleSaveMission,
}: MissionFormModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{editingMissionId ? 'Edit Mission' : 'Add New Mission'}</h3>
          <button className="modal-close" onClick={() => setShowMissionModal(false)}>×</button>
        </div>

        {missionFormError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {missionFormError}
          </div>
        )}

        <form onSubmit={handleSaveMission}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Savage Dominator"
              value={missionForm.title}
              onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Game</label>
            <select
              className="form-control"
              value={missionForm.game}
              onChange={(e) => setMissionForm({ ...missionForm, game: e.target.value })}
            >
              {gameOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          {missionForm.game === 'Other' && (
            <div className="form-group">
              <label className="form-label">Custom Game Name</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="e.g. Valorant Mobile"
                value={missionForm.customGame}
                onChange={(e) => setMissionForm({ ...missionForm, customGame: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              required
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="What the player needs to achieve"
              value={missionForm.description}
              onChange={(e) => setMissionForm({ ...missionForm, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rules</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Requirements for valid proof"
              value={missionForm.rules}
              onChange={(e) => setMissionForm({ ...missionForm, rules: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Reward (Rs.)</label>
              <input
                type="number"
                className="form-control"
                required
                placeholder="50"
                value={missionForm.reward_amount}
                onChange={(e) => setMissionForm({ ...missionForm, reward_amount: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">XP Reward</label>
              <input
                type="number"
                className="form-control"
                required
                placeholder="50"
                value={missionForm.xp_reward}
                onChange={(e) => setMissionForm({ ...missionForm, xp_reward: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Difficulty</label>
              <select
                className="form-control"
                value={missionForm.difficulty}
                onChange={(e) => setMissionForm({ ...missionForm, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' | 'Expert' })}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: '10px', paddingBottom: '10px' }}>
              <input
                type="checkbox"
                id="mission-active-checkbox"
                checked={missionForm.is_active}
                onChange={(e) => setMissionForm({ ...missionForm, is_active: e.target.checked })}
              />
              <label htmlFor="mission-active-checkbox" className="form-label" style={{ textTransform: 'none' }}>
                Active (visible to players)
              </label>
            </div>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="mission-allows-video-checkbox"
              checked={missionForm.allows_video_link}
              onChange={(e) => setMissionForm({ ...missionForm, allows_video_link: e.target.checked })}
            />
            <label htmlFor="mission-allows-video-checkbox" className="form-label" style={{ textTransform: 'none' }}>
              Also require a video link (player-hosted, e.g. YouTube/Drive) in addition to screenshots
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowMissionModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              {editingMissionId ? 'Save Changes' : 'Create Mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MissionFormModal;
