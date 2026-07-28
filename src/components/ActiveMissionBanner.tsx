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
      <span className="badge badge-expired" style={{ fontWeight: 800 }}>ACTIVE CHALLENGE</span>
      <h2 style={{ marginTop: '0.5rem', color: '#fff' }}>{activeAttempt.mission.title} ({activeAttempt.mission.game})</h2>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{activeAttempt.mission.description}</p>

      <div className="timer-display">{timeRemaining}</div>

      <form onSubmit={handleProofSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', maxWidth: '360px', width: '100%', margin: '0 auto' }}>
        <div className="form-group" style={{ width: '100%' }}>
          <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>
            Screenshots ({proofFiles.length}/{MAX_PROOF_SCREENSHOTS})
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            className="form-control"
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
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {proofFiles.map((file, i) => (
                <li key={`${file.name}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setProofFiles(proofFiles.filter((_, idx) => idx !== i))}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0 0 0 8px', fontSize: '0.9rem' }}
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
            <div className="form-group" style={{ width: '100%' }}>
              <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>
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
            <div className="form-group" style={{ width: '100%' }}>
              <label className="form-label" style={{ textAlign: 'left', display: 'block' }}>
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

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submittingProof || !canSubmit}>
          {submittingProof ? 'Uploading...' : 'Submit Proof'}
        </button>
        <button
          type="button"
          onClick={() => handleCancelMission(activeAttempt.id)}
          className="btn btn-secondary"
          style={{ width: '100%', color: 'var(--danger)' }}
          disabled={submittingProof}
        >
          Cancel Mission
        </button>
      </form>
    </div>
  );
}

export default ActiveMissionBanner;
