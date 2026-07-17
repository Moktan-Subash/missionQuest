import type { Wallet } from '../../types';

interface MembershipUpgradeModalProps {
  setShowMembershipModal: (show: boolean) => void;
  membershipTierRequested: 'bronze' | 'gold';
  membershipError: string;
  wallet: Wallet | null;
  membershipPaymentSource: 'wallet' | 'external';
  setMembershipPaymentSource: (source: 'wallet' | 'external') => void;
  handleWalletMembershipUpgrade: () => void;
  membershipMethod: 'esewa' | 'paypal';
  setMembershipMethod: (method: 'esewa' | 'paypal') => void;
  platformSettings: Record<string, string>;
  membershipReference: string;
  setMembershipReference: (reference: string) => void;
  setMembershipProofFile: (file: File | null) => void;
  submittingMembership: boolean;
  handleMembershipRequest: (e: React.FormEvent) => void;
}

function MembershipUpgradeModal({
  setShowMembershipModal,
  membershipTierRequested,
  membershipError,
  wallet,
  membershipPaymentSource,
  setMembershipPaymentSource,
  handleWalletMembershipUpgrade,
  membershipMethod,
  setMembershipMethod,
  platformSettings,
  membershipReference,
  setMembershipReference,
  setMembershipProofFile,
  submittingMembership,
  handleMembershipRequest,
}: MembershipUpgradeModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Upgrade to {membershipTierRequested === 'gold' ? 'Gold Master' : 'Bronze Pro'}</h3>
          <button className="modal-close" onClick={() => setShowMembershipModal(false)}>×</button>
        </div>

        {membershipError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {membershipError}
          </div>
        )}

        {(() => {
          const price = membershipTierRequested === 'gold' ? 999 : 499;
          const canPayFromWallet = !!wallet && wallet.balance >= price;

          return (
            <>
              <div className="game-filters" style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setMembershipPaymentSource('wallet')}
                  disabled={!canPayFromWallet}
                  className={`filter-btn ${membershipPaymentSource === 'wallet' ? 'active' : ''}`}
                  style={{ flex: 1 }}
                >
                  Pay from Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setMembershipPaymentSource('external')}
                  className={`filter-btn ${membershipPaymentSource === 'external' ? 'active' : ''}`}
                  style={{ flex: 1 }}
                >
                  Pay via eSewa/PayPal
                </button>
              </div>

              {membershipPaymentSource === 'wallet' ? (
                <div>
                  <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'left' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Current Balance</p>
                    <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>Rs. {wallet?.balance.toFixed(0)}</p>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Rs. {price} will be deducted instantly from your wallet and your tier upgraded right away — no admin verification needed.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowMembershipModal(false)}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleWalletMembershipUpgrade}>
                      Confirm & Pay Rs. {price}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleMembershipRequest}>
                  <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem', textAlign: 'left' }}>
                    <p style={{ color: '#fff', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Price: Rs. {price} / month
                    </p>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Step 1: Send this amount to our {membershipMethod === 'esewa' ? 'eSewa' : 'PayPal'} account:
                    </p>
                    <p style={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace', marginBottom: membershipMethod === 'paypal' ? '0.5rem' : 0 }}>
                      {membershipMethod === 'esewa'
                        ? (platformSettings.esewa_deposit_number || 'Contact support for our eSewa number')
                        : (platformSettings.paypal_deposit_email || 'Contact support for our PayPal email')}
                    </p>
                    {membershipMethod === 'paypal' && (
                      <a href="https://www.paypal.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
                        Open PayPal →
                      </a>
                    )}
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      Step 2: Fill out the form below. An admin will verify it and upgrade your tier.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-control"
                      value={membershipMethod}
                      onChange={(e) => setMembershipMethod(e.target.value as 'esewa' | 'paypal')}
                    >
                      <option value="esewa">eSewa (Nepal)</option>
                      <option value="paypal">PayPal (International)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transaction Reference / ID</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="Reference number from eSewa/PayPal"
                      value={membershipReference}
                      onChange={(e) => setMembershipReference(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Screenshot Proof (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => setMembershipProofFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowMembershipModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingMembership}>
                      {submittingMembership ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default MembershipUpgradeModal;
