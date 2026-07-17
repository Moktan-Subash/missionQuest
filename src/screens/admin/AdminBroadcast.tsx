interface AdminBroadcastProps {
  broadcastForm: { title: string; body: string };
  setBroadcastForm: (form: { title: string; body: string }) => void;
  sendingBroadcast: boolean;
  handleSendBroadcast: (e: React.FormEvent) => void;
}

function AdminBroadcast({ broadcastForm, setBroadcastForm, sendingBroadcast, handleSendBroadcast }: AdminBroadcastProps) {
  return (
    <div className="card" style={{ textAlign: 'left', maxWidth: '560px' }}>
      <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>Send Broadcast Notification</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Goes out to every player instantly (e.g. announcing a new tournament).
      </p>
      <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Title"
            className="form-control"
            required
            value={broadcastForm.title}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder="Message"
            className="form-control"
            required
            rows={4}
            value={broadcastForm.body}
            onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={sendingBroadcast} style={{ alignSelf: 'flex-start', padding: '0.6rem 1.5rem' }}>
          {sendingBroadcast ? 'Sending...' : 'Send to All Players'}
        </button>
      </form>
    </div>
  );
}

export default AdminBroadcast;
