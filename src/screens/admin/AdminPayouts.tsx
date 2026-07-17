import type { PayoutRequest } from '../../types';

interface AdminPayoutsProps {
  allPendingPayouts: PayoutRequest[];
  allPayouts: PayoutRequest[];
  adminTxId: { [key: string]: string };
  setAdminTxId: (ids: { [key: string]: string }) => void;
  handleAdminProcessPayout: (payoutId: string) => void;
  handleAdminRejectPayout: (payoutId: string) => void;
}

function AdminPayouts({
  allPendingPayouts,
  allPayouts,
  adminTxId,
  setAdminTxId,
  handleAdminProcessPayout,
  handleAdminRejectPayout,
}: AdminPayoutsProps) {
  return (
    <>
    <div className="card" style={{ textAlign: 'left', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Review Pending Withdrawal Requests ({allPendingPayouts.length})</h3>
      {allPendingPayouts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No payout requests currently pending review.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {allPendingPayouts.map((pay) => (
            <div key={pay.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', background: 'var(--bg-card-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong>{pay.profile?.display_name}</strong> requested payout to{' '}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(63, 131, 248, 0.1)', color: 'var(--accent)' }}>
                  {pay.payment_method.toUpperCase()}
                </span>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Destination Account: <strong>{pay.payment_details}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '1.1rem' }}>
                  Rs. {pay.amount.toFixed(0)}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Transaction ID..."
                    className="form-control"
                    style={{ width: '130px', padding: '0.4rem 0.8rem' }}
                    value={adminTxId[pay.id] || ''}
                    onChange={(e) => setAdminTxId({...adminTxId, [pay.id]: e.target.value})}
                  />
                  <button onClick={() => handleAdminProcessPayout(pay.id)} className="btn btn-primary" style={{ background: 'var(--success)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Mark Paid
                  </button>
                  <button onClick={() => handleAdminRejectPayout(pay.id)} className="btn btn-secondary" style={{ background: 'var(--danger)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="card" style={{ textAlign: 'left' }}>
      <h3 style={{ marginBottom: '1.25rem', color: '#fff' }}>All Payout History ({allPayouts.length})</h3>
      {allPayouts.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No payouts requested yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {allPayouts.map((pay) => {
            const payoutStatusStyle: Record<string, { label: string; icon: string; color: string; bg: string }> = {
              pending: { label: 'Pending', icon: '⏳', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
              processed: { label: 'Completed', icon: '✅', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
              rejected: { label: 'Cancelled', icon: '❌', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' },
              cancelled: { label: 'Cancelled', icon: '🚫', color: 'var(--text-dim)', bg: 'rgba(113, 113, 122, 0.15)' }
            };
            const s = payoutStatusStyle[pay.status];
            return (
              <div key={pay.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <div>
                  <strong style={{ color: '#fff' }}>{pay.profile?.display_name}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> · {pay.payment_method.toUpperCase()} · {pay.payment_details}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>Rs. {pay.amount.toFixed(0)}</span>
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

export default AdminPayouts;
