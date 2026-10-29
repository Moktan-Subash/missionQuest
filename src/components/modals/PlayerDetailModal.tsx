import type { MissionAttempt, Profile, Wallet } from '../../types';

interface PlayerDetailModalProps {
  viewingPlayer: Profile;
  setViewingPlayer: (player: Profile | null) => void;
  viewingPlayerWallet: Wallet | null;
  viewingPlayerLoading: boolean;
  viewingPlayerAttempts: MissionAttempt[];
  handleTogglePlayerBan: (player: Profile) => void;
  user: any;
}

function PlayerDetailModal({
  viewingPlayer,
  setViewingPlayer,
  viewingPlayerWallet,
  viewingPlayerLoading,
  viewingPlayerAttempts,
  handleTogglePlayerBan,
  user,
}: PlayerDetailModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px', textAlign: 'left' }}>
        <div className="modal-header">
          <h3>Player Profile</h3>
          <button className="modal-close" onClick={() => setViewingPlayer(null)}>×</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
          <img
            src={viewingPlayer.avatar_url || 'https://www.gravatar.com/avatar?d=mp'}
            alt=""
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
          />
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>{viewingPlayer.display_name || 'Gamer'}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{viewingPlayer.role}</p>
          </div>
          {viewingPlayer.is_banned && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', background: 'rgba(255, 77, 77, 0.1)', color: 'var(--danger)', marginLeft: 'auto' }}>
              Banned
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Wallet</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>
              {viewingPlayerLoading ? '...' : `Rs. ${(viewingPlayerWallet?.balance || 0).toFixed(0)}`}
            </div>
          </div>
          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>XP</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning)' }}>{viewingPlayer.xp}</div>
          </div>
          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Tier</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{viewingPlayer.membership_tier}</div>
          </div>
          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>KYC</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{viewingPlayer.kyc_status}</div>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Phone: <strong style={{ color: '#fff' }}>{viewingPlayer.phone || 'Not linked'}</strong>
          {viewingPlayer.phone && (viewingPlayer.is_phone_verified ? ' (verified)' : ' (unverified)')}
          {' · '}
          Missions Completed: <strong style={{ color: '#fff' }}>{viewingPlayer.missions_completed}</strong>
        </div>

        <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Mission History</h4>
        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {viewingPlayerLoading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</p>
          ) : viewingPlayerAttempts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No mission attempts yet.</p>
          ) : (
            viewingPlayerAttempts.map((att) => (
              <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}>
                <span style={{ color: '#fff' }}>{att.mission?.title}</span>
                <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{att.status.replace('_', ' ')}</span>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => handleTogglePlayerBan(viewingPlayer)}
          disabled={viewingPlayer.id === user.id}
          title={viewingPlayer.id === user.id ? "You can't ban yourself" : undefined}
          className="btn btn-secondary"
          style={{ width: '100%', color: viewingPlayer.is_banned ? 'var(--success)' : 'var(--danger)' }}
        >
          {viewingPlayer.is_banned ? 'Unban Player' : 'Ban Player'}
        </button>
      </div>
    </div>
  );
}

export default PlayerDetailModal;
