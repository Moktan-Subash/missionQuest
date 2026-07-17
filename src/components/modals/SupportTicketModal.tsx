import { ISSUE_TYPES } from '../../types';

interface SupportTicketModalProps {
  setShowSupportModal: (show: boolean) => void;
  supportForm: { issue_type: string; description: string; contact_email: string };
  setSupportForm: (form: { issue_type: string; description: string; contact_email: string }) => void;
  submittingSupportTicket: boolean;
  supportError: string;
  handleSubmitSupportTicket: (e: React.FormEvent) => void;
}

function SupportTicketModal({
  setShowSupportModal,
  supportForm,
  setSupportForm,
  submittingSupportTicket,
  supportError,
  handleSubmitSupportTicket,
}: SupportTicketModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Contact Support</h3>
          <button className="modal-close" onClick={() => setShowSupportModal(false)}>×</button>
        </div>

        {supportError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {supportError}
          </div>
        )}

        <form onSubmit={handleSubmitSupportTicket}>
          <div className="form-group">
            <label className="form-label">Issue Type</label>
            <select
              className="form-control"
              value={supportForm.issue_type}
              onChange={(e) => setSupportForm({ ...supportForm, issue_type: e.target.value })}
            >
              {ISSUE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input
              type="email"
              className="form-control"
              required
              placeholder="you@example.com"
              value={supportForm.contact_email}
              onChange={(e) => setSupportForm({ ...supportForm, contact_email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Describe the issue</label>
            <textarea
              className="form-control"
              required
              rows={4}
              placeholder="What happened, and what did you expect instead?"
              value={supportForm.description}
              onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowSupportModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingSupportTicket}>
              {submittingSupportTicket ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SupportTicketModal;
