import type { MissionAttempt } from '../types';

interface ActiveMissionBannerProps {
  user: any;
  activeAttempt: MissionAttempt | null;
  timeRemaining: string;
  proofFile: File | null;
  setProofFile: (file: File | null) => void;
  submittingProof: boolean;
  handleProofSubmit: (e: React.FormEvent) => void;
  handleCancelMission: (attemptId: string) => void;
}

function ActiveMissionBanner({
  user,
  activeAttempt,
  timeRemaining,
  proofFile,
  setProofFile,
  submittingProof,
  handleProofSubmit,
  handleCancelMission,
}: ActiveMissionBannerProps) {
  if (!(user && activeAttempt && activeAttempt.mission)) return null;

  return (
    <div className="active-mission-banner animate-fade-in">
      <span className="badge badge-expired" style={{ fontWeight: 800 }}>ACTIVE CHALLENGE</span>
      <h2 style={{ marginTop: '0.5rem', color: '#fff' }}>{activeAttempt.mission.title} ({activeAttempt.mission.game})</h2>
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{activeAttempt.mission.description}</p>

      <div className="timer-display">{timeRemaining}</div>

      <form onSubmit={handleProofSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', maxWidth: '360px', width: '100%', margin: '0 auto' }}>
        <div className="form-group" style={{ width: '100%' }}>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            required
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submittingProof || !proofFile}>
          {submittingProof ? 'Uploading...' : 'Submit Screenshot'}
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
