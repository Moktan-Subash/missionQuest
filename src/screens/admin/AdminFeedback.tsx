import type { Feedback } from '../../types';

interface AdminFeedbackProps {
  allFeedback: Feedback[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: 'var(--warning)', letterSpacing: '1px' }}>
      {'★'.repeat(rating)}
      <span style={{ color: 'var(--border-color)' }}>{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function AdminFeedback({ allFeedback }: AdminFeedbackProps) {
  const average = allFeedback.length > 0
    ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(1)
    : '—';

  return (
    <div className="card" style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <h3 style={{ color: '#fff' }}>Player Feedback ({allFeedback.length})</h3>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning)' }}>
          ⭐ {average} average
        </div>
      </div>
      {allFeedback.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No feedback submitted yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {allFeedback.map((f) => (
            <div key={f.id} style={{ padding: '0.85rem 1rem', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <strong style={{ color: '#fff' }}>{f.profile?.display_name}</strong>
                <Stars rating={f.rating} />
              </div>
              {f.comment && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{f.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminFeedback;
