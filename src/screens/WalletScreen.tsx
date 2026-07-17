import type { DepositRequest, PayoutRequest, Wallet } from '../types';

interface WalletScreenProps {
  wallet: Wallet | null;
  setShowAddMoneyModal: (show: boolean) => void;
  setShowWithdrawModal: (show: boolean) => void;
  deposits: DepositRequest[];
  payouts: PayoutRequest[];
}

function WalletScreen({ wallet, setShowAddMoneyModal, setShowWithdrawModal, deposits, payouts }: WalletScreenProps) {
  const totalDeposited = deposits.filter((d) => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawn = payouts.filter((p) => p.status === 'processed').reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = deposits.filter((d) => d.status === 'pending').length + payouts.filter((p) => p.status === 'pending').length;

  return (
    <div className="screen">
      <h2 style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>Wallet Balance</h2>

      <div className="stat-tiles-bar">
        <div className="stat-tile">
          <div className="stat-tile-val" style={{ color: 'var(--success)' }}>Rs. {totalDeposited.toFixed(0)}</div>
          <div className="stat-tile-lbl">Total Deposited</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val" style={{ color: 'var(--danger)' }}>Rs. {totalWithdrawn.toFixed(0)}</div>
          <div className="stat-tile-lbl">Total Withdrawn</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val">{pendingCount}</div>
          <div className="stat-tile-lbl">Pending Requests</div>
        </div>
      </div>

      <div className="wallet-grid">
        <div className="card wallet-card">
          <div className="wallet-balance-icon">💰</div>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>AVAILABLE CASH</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>
            Rs. {wallet?.balance.toFixed(0) || '0'}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', width: '100%' }}>
            <button
              onClick={() => setShowAddMoneyModal(true)}
              className="btn btn-secondary"
              style={{ flex: 1, color: 'var(--success)' }}
            >
              + Add Money
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={!wallet || wallet.balance <= 0}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Withdraw Cash
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Methods: eSewa (Nepal) & PayPal.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'left' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>Deposit History</h3>
            {deposits.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
                No deposits requested yet.
              </p>
            ) : (
              deposits.map((request) => (
                <div key={request.id} className="history-item">
                  <div className="history-icon history-icon-in">💵</div>
                  <div className="history-body">
                    <div className="history-header">
                      <span style={{ fontWeight: 700 }}>
                        {request.payment_method.toUpperCase()} Deposit
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                        +Rs. {request.amount.toFixed(0)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Ref: {request.reference_note}</span>
                      <span>{new Date(request.requested_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span className={`badge badge-${request.status}`}>
                        {request.status}
                      </span>
                      {request.admin_notes && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Note: {request.admin_notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ textAlign: 'left' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>Transaction History</h3>
            {payouts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
                No withdrawals requested yet.
              </p>
            ) : (
              payouts.map((request) => (
                <div key={request.id} className="history-item">
                  <div className="history-icon history-icon-out">💸</div>
                  <div className="history-body">
                    <div className="history-header">
                      <span style={{ fontWeight: 700 }}>
                        {request.payment_method.toUpperCase()} Transfer
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
                        -Rs. {request.amount.toFixed(0)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span>Details: {request.payment_details}</span>
                      <span>{new Date(request.requested_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span className={`badge badge-${request.status}`}>
                        {request.status}
                      </span>
                      {request.transaction_id && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontFamily: 'monospace' }}>
                          TxID: {request.transaction_id}
                        </span>
                      )}
                      {request.admin_notes && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Note: {request.admin_notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletScreen;
