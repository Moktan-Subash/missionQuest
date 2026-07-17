interface FeedbackModalProps {
  setShowFeedbackModal: (show: boolean) => void;
  feedbackForm: { rating: number; comment: string };
  setFeedbackForm: (form: { rating: number; comment: string }) => void;
  submittingFeedback: boolean;
  handleSubmitFeedback: (e: React.FormEvent) => void;
}

function FeedbackModal({
  setShowFeedbackModal,
  feedbackForm,
  setFeedbackForm,
  submittingFeedback,
  handleSubmitFeedback,
}: FeedbackModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Rate MissionQuest</h3>
          <button className="modal-close" onClick={() => setShowFeedbackModal(false)}>×</button>
        </div>

        <form onSubmit={handleSubmitFeedback}>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '2rem', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                  style={{ cursor: 'pointer', color: star <= feedbackForm.rating ? 'var(--warning)' : 'var(--border-color)' }}
                  role="button"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Comments (optional)</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="What do you love, or what should we improve?"
              value={feedbackForm.comment}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowFeedbackModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingFeedback || feedbackForm.rating === 0}>
              {submittingFeedback ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FeedbackModal;
