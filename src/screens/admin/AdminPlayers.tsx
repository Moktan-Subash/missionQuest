import type { Profile } from '../../types';

interface AdminPlayersProps {
  adminPlayers: Profile[];
  playerSearch: string;
  setPlayerSearch: (search: string) => void;
  openPlayerDetail: (player: Profile) => void;
  handleTogglePlayerBan: (player: Profile) => void;
  handleToggleAccountDeactivation: (player: Profile) => void;
  user: any;
}

function AdminPlayers({
  adminPlayers,
  playerSearch,
  setPlayerSearch,
  openPlayerDetail,
  handleTogglePlayerBan,
  handleToggleAccountDeactivation,
  user,
}: AdminPlayersProps) {
  return (
    <div className="card" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h3 style={{ color: '#fff' }}>All Players ({adminPlayers.length})</h3>
        <input
          type="text"
          placeholder="Search by name..."
          className="form-control"
          style={{ maxWidth: '260px' }}
          value={playerSearch}
          onChange={(e) => setPlayerSearch(e.target.value)}
        />
      </div>
      {adminPlayers.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No players yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {adminPlayers
            .filter((p) => (p.display_name || '').toLowerCase().includes(playerSearch.toLowerCase()))
            .map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={p.avatar_url || 'https://www.gravatar.com/avatar?d=mp'}
                    alt=""
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <strong style={{ color: '#fff' }}>{p.display_name || 'Gamer'}</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {p.role} · {p.membership_tier} tier · {p.xp} XP · KYC: {p.kyc_status}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {p.is_banned && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', background: 'rgba(255, 77, 77, 0.1)', color: 'var(--danger)' }}>
                      Banned
                    </span>
                  )}
                  {p.is_deactivated && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', background: 'rgba(113, 113, 122, 0.15)', color: 'var(--text-dim)' }}>
                      Deactivated
                    </span>
                  )}
                  <button
                    onClick={() => openPlayerDetail(p)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleTogglePlayerBan(p)}
                    disabled={p.id === user.id}
                    title={p.id === user.id ? "You can't ban yourself" : undefined}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: p.is_banned ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {p.is_banned ? 'Unban' : 'Ban'}
                  </button>
                  <button
                    onClick={() => handleToggleAccountDeactivation(p)}
                    disabled={p.id === user.id}
                    title={p.id === user.id ? "You can't deactivate yourself" : undefined}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: p.is_deactivated ? 'var(--success)' : 'var(--text-dim)' }}
                  >
                    {p.is_deactivated ? 'Reactivate' : 'Deactivate'}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default AdminPlayers;
