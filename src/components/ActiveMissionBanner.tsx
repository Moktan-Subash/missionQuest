import type { MissionAttempt } from '../types';

const MAX_PROOF_SCREENSHOTS = 3;

interface ActiveMissionBannerProps {
  user: any;
  activeAttempt: MissionAttempt | null;
  timeRemaining: string;
  proofFiles: File[];
  setProofFiles: (files: File[]) => void;
  proofVideoUrl: string;
  setProofVideoUrl: (url: string) => void;
  proofVideoTimestamp: string;
  setProofVideoTimestamp: (timestamp: string) => void;
  submittingProof: boolean;
  handleProofSubmit: (e: React.FormEvent) => void;
  handleCancelMission: (attemptId: string) => void;
}

function ActiveMissionBanner({
  user,
  activeAttempt,
  timeRemaining,
  proofFiles,
  setProofFiles,
  proofVideoUrl,
  setProofVideoUrl,
  proofVideoTimestamp,
  setProofVideoTimestamp,
  submittingProof,
  handleProofSubmit,
  handleCancelMission,
}: ActiveMissionBannerProps) {
  if (!(user && activeAttempt && activeAttempt.mission)) return null;

  const requiresVideo = !!activeAttempt.mission.allows_video_link;
  const canSubmit = proofFiles.length > 0 && (!requiresVideo || proofVideoUrl.trim().length > 0);

  return (
    <div className="active-mission-banner animate-fade-in">
      <div className="amb-info">
        <span className="amb-eyebrow"><span className="amb-eyebrow-dot" />Active Challenge</span>
        <h2 className="amb-title font-display">{activeAttempt.mission.title} ({activeAttempt.mission.game})</h2>
        <p className="amb-desc">{activeAttempt.mission.description}</p>

        <div className="section-label amb-timer-label">Time remaining</div>
        <div className="timer-display font-display">{timeRemaining}</div>
      </div>

      <form onSubmit={handleProofSubmit} className="amb-form">
        <div className="form-group">
          <label className="form-label">
            Screenshots ({proofFiles.length}/{MAX_PROOF_SCREENSHOTS})
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="form-control file-input"
            disabled={proofFiles.length >= MAX_PROOF_SCREENSHOTS}
            onChange={(e) => {
              const picked = Array.from(e.target.files || []);
              setProofFiles([...proofFiles, ...picked].slice(0, MAX_PROOF_SCREENSHOTS));
              // Reset so picking again (e.g. to add one more) fires onChange
              // even if the same file is selected twice.
              e.target.value = '';
            }}
          />
          {proofFiles.length > 0 && (
            <ul className="amb-files">
              {proofFiles.map((file, i) => (
                <li key={`${file.name}-${i}`}>
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setProofFiles(proofFiles.filter((_, idx) => idx !== i))}
                    className="amb-file-remove"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {requiresVideo && (
          <>
            <div className="form-group">
              <label className="form-label">
                Video link (required for this mission)
              </label>
              <input
                type="url"
                className="form-control"
                required
                placeholder="https://youtube.com/... or https://drive.google.com/..."
                value={proofVideoUrl}
                onChange={(e) => setProofVideoUrl(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Proof appears around (optional, e.g. "12:34")
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="12:34"
                value={proofVideoTimestamp}
                onChange={(e) => setProofVideoTimestamp(e.target.value)}
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary" disabled={submittingProof || !canSubmit}>
          {submittingProof ? 'Uploading...' : 'Submit Proof'}
        </button>
        <button
          type="button"
          onClick={() => handleCancelMission(activeAttempt.id)}
          className="btn btn-danger-outline"
          disabled={submittingProof}
        >
          Cancel Mission
        </button>
      </form>
    </div>
  );
}

export default ActiveMissionBanner;
