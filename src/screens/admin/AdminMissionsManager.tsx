import type { Mission } from '../../types';

interface AdminMissionsManagerProps {
  adminMissions: Mission[];
  openAddMissionModal: () => void;
  openEditMissionModal: (mission: Mission) => void;
  handleToggleMissionActive: (mission: Mission) => void;
}

function AdminMissionsManager({
  adminMissions,
  openAddMissionModal,
  openEditMissionModal,
  handleToggleMissionActive,
}: AdminMissionsManagerProps) {
  return (
    <div className="card" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h3 style={{ color: '#fff' }}>All Missions ({adminMissions.length})</h3>
        <button onClick={openAddMissionModal} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
          + Add Mission
        </button>
      </div>
      {adminMissions.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No missions created yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {adminMissions.map((m) => (
            <div key={m.id} style={{ aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {m.title}
                  </strong>
                  <span className={`difficulty-chip difficulty-${(m.difficulty || 'Medium').toLowerCase()}`} style={{ flexShrink: 0 }}>
                    {m.difficulty || 'Medium'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.game}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '6px', fontWeight: 600 }}>
                  Rs. {m.reward_amount.toFixed(0)} · {m.xp_reward} XP
                </p>
                {m.allows_video_link && (
                  <p style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '4px' }}>
                    🎥 Video link required
                  </p>
                )}
              </div>
              <div>
                <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', marginBottom: '8px', background: m.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(113, 113, 122, 0.15)', color: m.is_active ? 'var(--success)' : 'var(--text-dim)' }}>
                  {m.is_active ? 'Active' : 'Inactive'}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => handleToggleMissionActive(m)} className="btn btn-secondary" style={{ flex: 1, padding: '0.35rem', fontSize: '0.7rem' }}>
                    {m.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => openEditMissionModal(m)} className="btn btn-secondary" style={{ flex: 1, padding: '0.35rem', fontSize: '0.7rem' }}>
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminMissionsManager;
