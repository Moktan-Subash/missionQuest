import type { MissionAttempt } from '../../types';

type AttemptFilter = 'all' | 'active' | 'pending_review' | 'approved' | 'rejected' | 'expired' | 'cancelled';

interface AdminSubmissionsProps {
  allActiveAttempts: MissionAttempt[];
  allPendingSubmissions: MissionAttempt[];
  allAttempts: MissionAttempt[];
  attemptFilter: AttemptFilter;
  setAttemptFilter: (filter: AttemptFilter) => void;
  adminRejectionReason: { [key: string]: string };
  setAdminRejectionReason: (reasons: { [key: string]: string }) => void;
  handleAdminApproveSubmission: (attemptId: string) => void;
  handleAdminRejectSubmission: (attemptId: string) => void;
  formatCountdown: (expiresAt: string) => string;
}

function AdminSubmissions({
  allActiveAttempts,
  allPendingSubmissions,
  allAttempts,
  attemptFilter,
  setAttemptFilter,
  adminRejectionReason,
  setAdminRejectionReason,
  handleAdminApproveSubmission,
  handleAdminRejectSubmission,
  formatCountdown,
}: AdminSubmissionsProps) {
  return (
    <>
    <div className="card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Currently In Progress ({allActiveAttempts.length})</h3>
      {allActiveAttempts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No players currently have an active mission running.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {allActiveAttempts.map((att) => (
            <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div>
                <strong style={{ color: '#fff' }}>{att.profile?.display_name}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> is attempting </span>
                <strong style={{ color: 'var(--primary)' }}>{att.mission?.title}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning)', fontFamily: 'monospace' }}>
                ⏱ {formatCountdown(att.expires_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    <div className="card" style={{ textAlign: 'left' }}>
      <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Review Pending Screenshots ({allPendingSubmissions.length})</h3>
      {allPendingSubmissions.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No submissions currently pending review.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {allPendingSubmissions.map((sub) => (
            <div key={sub.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'var(--bg-card-hover)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ color: 'var(--primary)' }}>{sub.mission?.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Player: <strong>{sub.profile?.display_name}</strong> | Phone: {sub.profile?.phone || 'N/A'}
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', background: 'rgba(198, 255, 0, 0.1)', color: 'var(--success)' }}>
                  Reward: Rs. {sub.mission?.reward_amount.toFixed(0)}
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                  Screenshot Proof ({sub.screenshot_urls.length}):
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {sub.screenshot_urls.map((url, i) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      <img
                        src={url}
                        alt={`Proof ${i + 1}`}
                        style={{ maxWidth: '220px', maxHeight: '220px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                      />
                    </a>
                  ))}
                </div>

                {sub.video_url && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    <a href={sub.video_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                      ▶ Watch submitted video ↗
                    </a>
                    {sub.video_timestamp && (
                      <span style={{ color: 'var(--text-muted)' }}> -- proof appears around {sub.video_timestamp}</span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleAdminApproveSubmission(sub.id)} className="btn btn-primary" style={{ background: 'var(--success)', padding: '0.5rem 1.25rem' }}>
                  Approve & Pay
                </button>

                <input
                  type="text"
                  placeholder="Rejection reason..."
                  className="form-control"
                  style={{ flex: 1, minWidth: '180px', padding: '0.5rem' }}
                  value={adminRejectionReason[sub.id] || ''}
                  onChange={(e) => setAdminRejectionReason({...adminRejectionReason, [sub.id]: e.target.value})}
                />
                <button onClick={() => handleAdminRejectSubmission(sub.id)} className="btn btn-secondary" style={{ background: 'var(--danger)', padding: '0.5rem 1.25rem' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="card" style={{ textAlign: 'left', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h3 style={{ color: '#fff' }}>All Mission Activity ({allAttempts.length})</h3>
        <div className="game-filters">
          {(['all', 'active', 'pending_review', 'approved', 'rejected', 'expired', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setAttemptFilter(f)}
              className={`filter-btn ${attemptFilter === f ? 'active' : ''}`}
              style={{ padding: '6px 12px', fontSize: '0.75rem', textTransform: 'capitalize' }}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {allAttempts.filter((a) => attemptFilter === 'all' || a.status === attemptFilter).length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No mission activity in this category.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {allAttempts
            .filter((a) => attemptFilter === 'all' || a.status === attemptFilter)
            .map((att) => {
              const statusStyle: Record<string, { label: string; icon: string; color: string; bg: string }> = {
                active: { label: 'In Progress', icon: '⏱️', color: 'var(--warning)', bg: 'rgba(255, 176, 32, 0.1)' },
                pending_review: { label: 'Pending Review', icon: '👀', color: 'var(--accent)', bg: 'rgba(198, 255, 0, 0.1)' },
                approved: { label: 'Approved', icon: '✅', color: 'var(--success)', bg: 'rgba(198, 255, 0, 0.1)' },
                rejected: { label: 'Rejected', icon: '❌', color: 'var(--danger)', bg: 'rgba(255, 77, 77, 0.1)' },
                expired: { label: 'Expired', icon: '⌛', color: 'var(--text-dim)', bg: 'rgba(113, 113, 122, 0.15)' },
                cancelled: { label: 'Cancelled', icon: '🚫', color: 'var(--text-dim)', bg: 'rgba(113, 113, 122, 0.15)' }
              };
              const s = statusStyle[att.status];
              return (
                <div key={att.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '10px', minHeight: '150px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px', marginBottom: '6px' }}>
                      <strong style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.25 }}>{att.mission?.title}</strong>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', flexShrink: 0, color: s.color, background: s.bg, whiteSpace: 'nowrap' }}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{att.mission?.game}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '6px' }}>
                      Player: <strong>{att.profile?.display_name}</strong>
                    </p>
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>
                    {att.status === 'active' && (
                      <span style={{ fontWeight: 700, color: 'var(--warning)', fontFamily: 'monospace' }}>
                        ⏱ {formatCountdown(att.expires_at)}
                      </span>
                    )}
                    {att.status === 'pending_review' && (
                      <span style={{ color: 'var(--text-muted)' }}>Submitted {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : ''}</span>
                    )}
                    {att.status === 'approved' && (
                      <span style={{ color: 'var(--success)', fontWeight: 700 }}>+Rs. {att.mission?.reward_amount.toFixed(0)}</span>
                    )}
                    {att.status === 'rejected' && (
                      <span style={{ color: 'var(--danger)' }}>{att.rejection_reason || 'No reason given'}</span>
                    )}
                    {(att.status === 'expired' || att.status === 'cancelled') && (
                      <span style={{ color: 'var(--text-dim)' }}>{new Date(att.started_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
    </>
  );
}

export default AdminSubmissions;
