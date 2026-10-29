interface AddMoneyModalProps {
  setShowAddMoneyModal: (show: boolean) => void;
  depositError: string;
  depositMethod: 'esewa' | 'paypal';
  setDepositMethod: (method: 'esewa' | 'paypal') => void;
  platformSettings: Record<string, string>;
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  depositReference: string;
  setDepositReference: (reference: string) => void;
  setDepositProofFile: (file: File | null) => void;
  submittingDeposit: boolean;
  handleDepositRequest: (e: React.FormEvent) => void;
}

function AddMoneyModal({
  setShowAddMoneyModal,
  depositError,
  depositMethod,
  setDepositMethod,
  platformSettings,
  depositAmount,
  setDepositAmount,
  depositReference,
  setDepositReference,
  setDepositProofFile,
  submittingDeposit,
  handleDepositRequest,
}: AddMoneyModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add Money</h3>
          <button className="modal-close" onClick={() => setShowAddMoneyModal(false)}>×</button>
        </div>

        {depositError && (
          <div className="form-error">
            {depositError}
          </div>
        )}

        <form onSubmit={handleDepositRequest}>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-control"
              value={depositMethod}
              onChange={(e) => setDepositMethod(e.target.value as 'esewa' | 'paypal')}
            >
              <option value="esewa">eSewa (Nepal)</option>
              <option value="paypal">PayPal (International)</option>
            </select>
          </div>

          <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem', textAlign: 'left' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Step 1: Send your money to our {depositMethod === 'esewa' ? 'eSewa' : 'PayPal'} account first:
            </p>
            <p style={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace', marginBottom: depositMethod === 'paypal' ? '0.5rem' : 0 }}>
              {depositMethod === 'esewa'
                ? (platformSettings.esewa_deposit_number || 'Contact support for our eSewa number')
                : (platformSettings.paypal_deposit_email || 'Contact support for our PayPal email')}
            </p>
            {depositMethod === 'paypal' && (
              <a href="https://www.paypal.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
                Open PayPal →
              </a>
            )}
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Step 2: Fill out the form below with the details of the payment you just sent. An admin will verify it and credit your wallet.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Amount Sent (Rs.)</label>
            <input
              type="number"
              className="form-control"
              required
              placeholder="e.g. 500"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Reference / ID</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Reference number from eSewa/PayPal"
              value={depositReference}
              onChange={(e) => setDepositReference(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Screenshot Proof (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setDepositProofFile(e.target.files?.[0] || null)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddMoneyModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingDeposit}>
              {submittingDeposit ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMoneyModal;
