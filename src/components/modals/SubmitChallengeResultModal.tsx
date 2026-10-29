import type { Challenge } from '../../types';

interface SubmitChallengeResultModalProps {
  challenge: Challenge;
  challengeResultWinnerId: string;
  setChallengeResultWinnerId: (id: string) => void;
  challengeResultProofFile: File | null;
  setChallengeResultProofFile: (file: File | null) => void;
  submittingChallengeResult: boolean;
  challengeResultSubmitError: string;
  onSubmit: () => void;
  onClose: () => void;
}

function sideLabel(challenge: Challenge, side: 'creator' | 'acceptor'): string {
  const teamName = side === 'creator' ? challenge.creator_team_name : challenge.acceptor_team_name;
  const profile = side === 'creator' ? challenge.creator_profile : challenge.acceptor_profile;
  return teamName || profile?.display_name || 'Unknown';
}

function SubmitChallengeResultModal({
  challenge,
  challengeResultWinnerId,
  setChallengeResultWinnerId,
  challengeResultProofFile,
  setChallengeResultProofFile,
  submittingChallengeResult,
  challengeResultSubmitError,
  onSubmit,
  onClose,
}: SubmitChallengeResultModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h3>Submit Result</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {challengeResultSubmitError && (
          <div className="form-error">
            {challengeResultSubmitError}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Who won?</label>
          {(['creator', 'acceptor'] as const).map((side) => {
            const id = side === 'creator' ? challenge.creator_user_id : challenge.acceptor_user_id;
            if (!id) return null;
            return (
              <label key={side} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="challenge-winner"
                  value={id}
                  checked={challengeResultWinnerId === id}
                  onChange={() => setChallengeResultWinnerId(id)}
                />
                {sideLabel(challenge, side)}
              </label>
            );
          })}
        </div>

        <div className="form-group">
          <label className="form-label">Screenshot proof (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setChallengeResultProofFile(e.target.files?.[0] || null)}
          />
          {challengeResultProofFile && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Selected: {challengeResultProofFile.name}</p>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={submittingChallengeResult || !challengeResultWinnerId}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {submittingChallengeResult ? 'Submitting...' : 'Submit Result'}
        </button>
      </div>
    </div>
  );
}

export default SubmitChallengeResultModal;
