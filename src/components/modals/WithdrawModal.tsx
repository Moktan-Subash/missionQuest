import type { Wallet } from '../../types';

interface WithdrawModalProps {
  setShowWithdrawModal: (show: boolean) => void;
  withdrawError: string;
  withdrawMethod: 'esewa' | 'paypal';
  setWithdrawMethod: (method: 'esewa' | 'paypal') => void;
  withdrawDetails: string;
  setWithdrawDetails: (details: string) => void;
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  wallet: Wallet | null;
  handleWithdrawRequest: (e: React.FormEvent) => void;
}

function WithdrawModal({
  setShowWithdrawModal,
  withdrawError,
  withdrawMethod,
  setWithdrawMethod,
  withdrawDetails,
  setWithdrawDetails,
  withdrawAmount,
  setWithdrawAmount,
  wallet,
  handleWithdrawRequest,
}: WithdrawModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Withdraw Earnings</h3>
          <button className="modal-close" onClick={() => setShowWithdrawModal(false)}>×</button>
        </div>

        {withdrawError && (
          <div className="form-error">
            {withdrawError}
          </div>
        )}

        <form onSubmit={handleWithdrawRequest}>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-control"
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value as 'esewa' | 'paypal')}
            >
              <option value="esewa">eSewa (Nepal)</option>
              <option value="paypal">PayPal (International)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              {withdrawMethod === 'esewa' ? 'eSewa Phone Number' : 'PayPal Email'}
            </label>
            <input
              type="text"
              className="form-control"
              required
              placeholder={withdrawMethod === 'esewa' ? '98XXXXXXXX' : 'gamer@paypal.com'}
              value={withdrawDetails}
              onChange={(e) => setWithdrawDetails(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Amount (Rs.)</label>
            <input
              type="number"
              className="form-control"
              required
              placeholder="Minimum Rs. 50"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Max: Rs. {wallet?.balance.toFixed(0) || '0'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WithdrawModal;
