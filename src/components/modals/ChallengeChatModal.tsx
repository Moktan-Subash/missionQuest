import type { Challenge, ChallengeMessage } from '../../types';

interface ChallengeChatModalProps {
  challenge: Challenge;
  messages: ChallengeMessage[];
  currentUserId: string;
  chatInput: string;
  setChatInput: (value: string) => void;
  sendingChatMessage: boolean;
  onSend: () => void;
  onClose: () => void;
}

function ChallengeChatModal({
  challenge,
  messages,
  currentUserId,
  chatInput,
  setChatInput,
  sendingChatMessage,
  onSend,
  onClose,
}: ChallengeChatModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        <div className="modal-header">
          <h3>Challenge Chat: Rs. {challenge.stake_amount.toLocaleString()}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
          Only the two of you can see and send messages here. Use it to share your custom room code.
        </p>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', minHeight: '200px' }}>
          {messages.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No messages yet. Say hello!</p>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_user_id === currentUserId;
              return (
                <div key={m.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '2px', textAlign: isMine ? 'right' : 'left' }}>
                    {isMine ? 'You' : m.profile?.display_name || 'Opponent'}
                  </div>
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '10px',
                      background: isMine ? 'var(--accent)' : 'var(--bg-card-hover)',
                      color: isMine ? 'var(--accent-ink)' : 'inherit',
                      fontSize: '0.85rem',
                      wordBreak: 'break-word',
                    }}
                  >
                    {m.body}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            maxLength={2000}
          />
          <button type="submit" className="btn btn-primary" disabled={sendingChatMessage || !chatInput.trim()} style={{ padding: '0.5rem 1rem' }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChallengeChatModal;
