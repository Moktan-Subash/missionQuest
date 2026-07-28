import type { Profile, PlayerCompletedMission } from '../../types';

interface PlayerProfileModalProps {
  viewingPublicPlayer: Profile | null;
  setViewingPublicPlayer: (player: Profile | null) => void;
  viewingPublicPlayerMissions: PlayerCompletedMission[];
  loadingPublicPlayerMissions: boolean;
}

function PlayerProfileModal({
  viewingPublicPlayer,
  setViewingPublicPlayer,
  viewingPublicPlayerMissions,
  loadingPublicPlayerMissions,
}: PlayerProfileModalProps) {
  if (!viewingPublicPlayer) return null;

  const totalEarned = viewingPublicPlayerMissions.reduce((sum, m) => sum + m.reward_amount, 0);

  return (
    <div className="modal-overlay" onClick={() => setViewingPublicPlayer(null)}>
      <div className="modal-content" style={{ maxWidth: '440px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Player Profile</h3>
          <button className="modal-close" onClick={() => setViewingPublicPlayer(null)}>×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <img
            src={viewingPublicPlayer.avatar_url || 'https://www.gravatar.com/avatar?d=mp'}
            alt=""
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
          />
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#fff' }}>{viewingPublicPlayer.display_name || 'Gamer'}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {viewingPublicPlayer.membership_tier} Tier
            </span>
          </div>
        </div>

        <div className="stat-tiles-bar" style={{ marginBottom: '20px' }}>
          <div className="stat-tile">
            <div className="stat-tile-val">{viewingPublicPlayer.xp}</div>
            <div className="stat-tile-lbl">XP</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val">{viewingPublicPlayer.missions_completed}</div>
            <div className="stat-tile-lbl">Missions Done</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val">Rs. {totalEarned.toFixed(0)}</div>
            <div className="stat-tile-lbl">Earned</div>
          </div>
        </div>

        <h4 style={{ textAlign: 'left', color: '#fff', marginBottom: '10px', fontSize: '0.95rem' }}>Completed Missions</h4>
        {loadingPublicPlayerMissions ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'left' }}>Loading...</p>
        ) : viewingPublicPlayerMissions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'left' }}>No completed missions yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {viewingPublicPlayerMissions.map((m, i) => (
              <div
                key={`${m.mission_title}-${i}`}
                style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              >
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{m.mission_title}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{m.game}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>Rs. {m.reward_amount.toFixed(0)}</div>
                  {m.submitted_at && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{new Date(m.submitted_at).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerProfileModal;
