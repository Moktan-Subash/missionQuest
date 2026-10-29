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
    <div className="screen page">
      <div className="page-head">
        <div>
          <h2 className="page-title font-display">Wallet</h2>
          <p className="page-subtitle">Balance, deposits and withdrawals</p>
        </div>
      </div>

      <div className="wl-top">
        <div className="wl-balance">
          <div className="section-label">Available Cash</div>
          <div className="wl-balance-amount font-display">
            Rs. {wallet?.balance.toFixed(0) || '0'}
          </div>
          <div className="wl-balance-actions">
            <button onClick={() => setShowAddMoneyModal(true)} className="btn btn-secondary">
              + Add Money
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={!wallet || wallet.balance <= 0}
              className="btn btn-primary"
            >
              Withdraw Cash
            </button>
          </div>
          <p className="wl-methods">Methods: eSewa (Nepal) & PayPal.</p>
        </div>

        <div className="wl-stats">
          <div className="wl-stat">
            <div className="section-label">Total Deposited</div>
            <div className="wl-stat-val font-display text-success">Rs. {totalDeposited.toFixed(0)}</div>
          </div>
          <div className="wl-stat">
            <div className="section-label">Total Withdrawn</div>
            <div className="wl-stat-val font-display text-danger">Rs. {totalWithdrawn.toFixed(0)}</div>
          </div>
          <div className="wl-stat">
            <div className="section-label">Pending Requests</div>
            <div className="wl-stat-val font-display">{pendingCount}</div>
          </div>
        </div>
      </div>

      <div className="wl-history">
        <section className="wl-panel">
          <h3 className="wl-panel-title font-display">Deposit History</h3>
          {deposits.length === 0 ? (
            <p className="wl-empty">No deposits requested yet.</p>
          ) : (
            deposits.map((request) => (
              <div key={request.id} className="wl-item">
                <div className="wl-item-icon wl-item-icon-in">↓</div>
                <div className="wl-item-body">
                  <div className="wl-item-head">
                    <span className="wl-item-title">{request.payment_method.toUpperCase()} Deposit</span>
                    <span className="wl-item-amount text-success">+Rs. {request.amount.toFixed(0)}</span>
                  </div>
                  <div className="wl-item-meta">
                    <span>Ref: {request.reference_note}</span>
                    <span>{new Date(request.requested_at).toLocaleDateString()}</span>
                  </div>
                  <div className="wl-item-foot">
                    <span className={`badge badge-${request.status}`}>{request.status}</span>
                    {request.admin_notes && <span className="wl-item-note">Note: {request.admin_notes}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="wl-panel">
          <h3 className="wl-panel-title font-display">Transaction History</h3>
          {payouts.length === 0 ? (
            <p className="wl-empty">No withdrawals requested yet.</p>
          ) : (
            payouts.map((request) => (
              <div key={request.id} className="wl-item">
                <div className="wl-item-icon wl-item-icon-out">↑</div>
                <div className="wl-item-body">
                  <div className="wl-item-head">
                    <span className="wl-item-title">{request.payment_method.toUpperCase()} Transfer</span>
                    <span className="wl-item-amount text-danger">-Rs. {request.amount.toFixed(0)}</span>
                  </div>
                  <div className="wl-item-meta">
                    <span>Details: {request.payment_details}</span>
                    <span>{new Date(request.requested_at).toLocaleDateString()}</span>
                  </div>
                  <div className="wl-item-foot">
                    <span className={`badge badge-${request.status}`}>{request.status}</span>
                    {request.transaction_id && <span className="wl-item-note mono text-success">TxID: {request.transaction_id}</span>}
                    {request.admin_notes && <span className="wl-item-note">Note: {request.admin_notes}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default WalletScreen;
