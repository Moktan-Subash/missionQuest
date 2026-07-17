import type { MembershipRequest } from '../../types';

interface AdminMembershipRequestsProps {
  allPendingMembershipRequests: MembershipRequest[];
  allMembershipRequests: MembershipRequest[];
  adminRejectionReason: { [key: string]: string };
  setAdminRejectionReason: (reasons: { [key: string]: string }) => void;
  handleAdminApproveMembership: (requestId: string) => void;
  handleAdminRejectMembership: (requestId: string) => void;
}

function AdminMembershipRequests({
  allPendingMembershipRequests,
  allMembershipRequests,
  adminRejectionReason,
  setAdminRejectionReason,
  handleAdminApproveMembership,
  handleAdminRejectMembership,
}: AdminMembershipRequestsProps) {
  return (
    <>
    <div className="card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Review Pending Upgrade Requests ({allPendingMembershipRequests.length})</h3>
      {allPendingMembershipRequests.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No membership upgrade requests currently pending review.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {allPendingMembershipRequests.map((req) => (
            <div key={req.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'var(--bg-card-hover)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{req.profile?.display_name}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> wants to upgrade to </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', textTransform: 'uppercase' }}>
                    {req.tier}
                  </span>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Paid via {req.payment_method.toUpperCase()} · Reference: <strong>{req.reference_note}</strong>
                  </div>
                </div>
                <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.1rem' }}>
                  Rs. {req.amount.toFixed(0)}
                </span>
              </div>

              {req.proof_url && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Screenshot Proof:</p>
                  <a href={req.proof_url} target="_blank" rel="noreferrer">
                    <img
                      src={req.proof_url}
                      alt="Proof"
                      style={{ maxWidth: '100%', maxHeight: '300px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    />
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleAdminApproveMembership(req.id)} className="btn btn-primary" style={{ background: 'var(--success)', padding: '0.5rem 1.25rem' }}>
                  Verify & Upgrade
                </button>

                <input
                  type="text"
                  placeholder="Rejection reason..."
                  className="form-control"
                  style={{ flex: 1, minWidth: '180px', padding: '0.5rem' }}
                  value={adminRejectionReason[req.id] || ''}
                  onChange={(e) => setAdminRejectionReason({...adminRejectionReason, [req.id]: e.target.value})}
                />
                <button onClick={() => handleAdminRejectMembership(req.id)} className="btn btn-secondary" style={{ background: 'var(--danger)', padding: '0.5rem 1.25rem' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="card" style={{ textAlign: 'left' }}>
      <h3 style={{ marginBottom: '1.25rem', color: '#fff' }}>All Upgrade History ({allMembershipRequests.length})</h3>
      {allMembershipRequests.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No membership upgrade requests yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {allMembershipRequests.map((req) => {
            const membershipStatusStyle: Record<string, { label: string; icon: string; color: string; bg: string }> = {
              pending: { label: 'Pending', icon: '⏳', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
              approved: { label: 'Completed', icon: '✅', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
              rejected: { label: 'Cancelled', icon: '❌', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' }
            };
            const s = membershipStatusStyle[req.status];
            return (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{req.profile?.display_name}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> · {req.tier.toUpperCase()} · {req.payment_method.toUpperCase()} · Ref: {req.reference_note}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>Rs. {req.amount.toFixed(0)}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', color: s.color, background: s.bg, whiteSpace: 'nowrap' }}>
                    {s.icon} {s.label}
                  </span>
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

export default AdminMembershipRequests;
