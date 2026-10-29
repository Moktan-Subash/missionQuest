import { useState } from 'react';

interface DeleteAccountModalProps {
  setShowDeleteAccountModal: (show: boolean) => void;
  deactivatingAccount: boolean;
  handleDeactivateAccount: () => void;
}

function DeleteAccountModal({ setShowDeleteAccountModal, deactivatingAccount, handleDeactivateAccount }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const canConfirm = confirmText.trim().toUpperCase() === 'DELETE';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ color: 'var(--danger)' }}>Delete Account</h3>
          <button className="modal-close" onClick={() => setShowDeleteAccountModal(false)}>×</button>
        </div>

        <div className="form-error">
          This deactivates your account immediately and signs you out. You won't be
          able to log back in or access your wallet balance until an admin
          reactivates it for you. This is not yet a permanent data-deletion —
          contact support if you need your data fully erased.
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Type DELETE to confirm</label>
          <input
            type="text"
            className="form-control"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeleteAccountModal(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ flex: 1, background: 'var(--danger)' }}
            disabled={!canConfirm || deactivatingAccount}
            onClick={handleDeactivateAccount}
          >
            {deactivatingAccount ? 'Deactivating...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
