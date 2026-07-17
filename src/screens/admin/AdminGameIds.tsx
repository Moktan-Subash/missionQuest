import type { GameIdLink } from '../../types';

interface AdminGameIdsProps {
  allPendingGameIdLinks: GameIdLink[];
  allGameIdLinks: GameIdLink[];
  adminRejectionReason: { [key: string]: string };
  setAdminRejectionReason: (reasons: { [key: string]: string }) => void;
  handleAdminVerifyGameId: (linkId: string) => void;
  handleAdminRejectGameId: (linkId: string) => void;
  handleViewGameIdScreenshot: (path: string) => void;
}

const GAME_ID_STATUS_STYLE: Record<GameIdLink['status'], { label: string; icon: string; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: '⏳', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
  verified: { label: 'Verified', icon: '✅', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
  rejected: { label: 'Rejected', icon: '❌', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' },
};

function AdminGameIds({
  allPendingGameIdLinks,
  allGameIdLinks,
  adminRejectionReason,
  setAdminRejectionReason,
  handleAdminVerifyGameId,
  handleAdminRejectGameId,
  handleViewGameIdScreenshot,
}: AdminGameIdsProps) {
  return (
    <>
    <div className="card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Review Pending Game IDs ({allPendingGameIdLinks.length})</h3>
      {allPendingGameIdLinks.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No in-game IDs currently pending review.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {allPendingGameIdLinks.map((link) => (
            <div key={link.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'var(--bg-card-hover)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#fff' }}>{link.profile?.display_name}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> linked </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)' }}>
                  {link.game_type}
                </span>
                <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.35rem', fontFamily: 'monospace' }}>
                  ID: {link.in_game_id}
                </div>
                {link.verification_method === 'ai_vision' && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '0.5rem' }}>
                    AI read: {link.ai_extracted_id || '(unreadable)'}
                    {link.ai_extracted_nickname && ` · "${link.ai_extracted_nickname}"`}
                    {' '}— didn't match, needs a manual look.
                  </div>
                )}
                {link.screenshot_url && (
                  <button
                    onClick={() => handleViewGameIdScreenshot(link.screenshot_url!)}
                    className="btn btn-secondary"
                    style={{ marginTop: '0.5rem', padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    View Screenshot
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleAdminVerifyGameId(link.id)} className="btn btn-primary" style={{ background: 'var(--success)', padding: '0.5rem 1.25rem' }}>
                  Verify
                </button>
                <input
                  type="text"
                  placeholder="Rejection reason..."
                  className="form-control"
                  style={{ flex: 1, minWidth: '180px', padding: '0.5rem' }}
                  value={adminRejectionReason[link.id] || ''}
                  onChange={(e) => setAdminRejectionReason({ ...adminRejectionReason, [link.id]: e.target.value })}
                />
                <button onClick={() => handleAdminRejectGameId(link.id)} className="btn btn-secondary" style={{ background: 'var(--danger)', padding: '0.5rem 1.25rem' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="card" style={{ textAlign: 'left' }}>
      <h3 style={{ marginBottom: '1.25rem', color: '#fff' }}>All Game ID History ({allGameIdLinks.length})</h3>
      {allGameIdLinks.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No in-game IDs linked yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {allGameIdLinks.map((link) => {
            const s = GAME_ID_STATUS_STYLE[link.status];
            return (
              <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{link.profile?.display_name}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> · {link.game_type} · <span style={{ fontFamily: 'monospace' }}>{link.in_game_id}</span></span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', color: s.color, background: s.bg, whiteSpace: 'nowrap' }}>
                  {s.icon} {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}

export default AdminGameIds;
