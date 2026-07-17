import type { TournamentMatch } from '../../types';

interface SubmitResultModalProps {
  match: TournamentMatch;
  myRegistrationId: string;
  resultWinnerId: string;
  setResultWinnerId: (id: string) => void;
  resultProofFile: File | null;
  setResultProofFile: (file: File | null) => void;
  submittingResult: boolean;
  resultSubmitError: string;
  onSubmit: () => void;
  onClose: () => void;
}

function SubmitResultModal({
  match,
  myRegistrationId,
  resultWinnerId,
  setResultWinnerId,
  resultProofFile,
  setResultProofFile,
  submittingResult,
  resultSubmitError,
  onSubmit,
  onClose,
}: SubmitResultModalProps) {
  const isBracket = match.match_type === 'bracket';

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3>Submit Result: {match.label}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {resultSubmitError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {resultSubmitError}
          </div>
        )}

        {isBracket ? (
          <div className="form-group">
            <label className="form-label">Who won?</label>
            {(match.participants || []).map((p) => (
              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="winner"
                  value={p.registration_id}
                  checked={resultWinnerId === p.registration_id}
                  onChange={() => setResultWinnerId(p.registration_id)}
                />
                {p.registration?.team_name || p.registration?.profile?.display_name || 'Unknown'}
                {p.registration_id === myRegistrationId && <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}> (you)</span>}
              </label>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            This marks your lobby as played. The admin will enter final placement and points.
          </p>
        )}

        <div className="form-group">
          <label className="form-label">Screenshot proof (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setResultProofFile(e.target.files?.[0] || null)}
          />
          {resultProofFile && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Selected: {resultProofFile.name}</p>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={submittingResult || (isBracket && !resultWinnerId)}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {submittingResult ? 'Submitting...' : 'Submit Result'}
        </button>
      </div>
    </div>
  );
}

export default SubmitResultModal;
