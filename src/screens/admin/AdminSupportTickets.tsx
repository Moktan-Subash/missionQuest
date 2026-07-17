import { useState } from 'react';
import type { SupportTicket } from '../../types';

interface AdminSupportTicketsProps {
  allSupportTickets: SupportTicket[];
  handleAdminUpdateSupportTicketStatus: (ticketId: string, status: 'in_progress' | 'resolved', notes: string) => void;
}

const STATUS_STYLE: Record<SupportTicket['status'], { label: string; icon: string; color: string; bg: string }> = {
  open: { label: 'Open', icon: '🟡', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
  in_progress: { label: 'In Progress', icon: '🔵', color: 'var(--accent)', bg: 'rgba(59, 130, 246, 0.1)' },
  resolved: { label: 'Resolved', icon: '✅', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
};

function AdminSupportTickets({ allSupportTickets, handleAdminUpdateSupportTicketStatus }: AdminSupportTicketsProps) {
  const [notesDraft, setNotesDraft] = useState<{ [key: string]: string }>({});

  return (
    <div className="card" style={{ textAlign: 'left' }}>
      <h3 style={{ marginBottom: '1.25rem', color: '#fff' }}>Support Tickets ({allSupportTickets.length})</h3>
      {allSupportTickets.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No support tickets yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {allSupportTickets.map((ticket) => {
            const s = STATUS_STYLE[ticket.status];
            return (
              <div key={ticket.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'var(--bg-card-hover)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{ticket.profile?.display_name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> · {ticket.issue_type} · {ticket.contact_email}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', color: s.color, background: s.bg, whiteSpace: 'nowrap' }}>
                    {s.icon} {s.label}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem', lineHeight: 1.4 }}>{ticket.description}</p>

                {ticket.status !== 'resolved' && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Notes (optional)..."
                      className="form-control"
                      style={{ flex: 1, minWidth: '180px', padding: '0.5rem' }}
                      value={notesDraft[ticket.id] || ticket.admin_notes || ''}
                      onChange={(e) => setNotesDraft({ ...notesDraft, [ticket.id]: e.target.value })}
                    />
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => handleAdminUpdateSupportTicketStatus(ticket.id, 'in_progress', notesDraft[ticket.id] || '')}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1.25rem' }}
                      >
                        Mark In Progress
                      </button>
                    )}
                    <button
                      onClick={() => handleAdminUpdateSupportTicketStatus(ticket.id, 'resolved', notesDraft[ticket.id] || '')}
                      className="btn btn-primary"
                      style={{ background: 'var(--success)', padding: '0.5rem 1.25rem' }}
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
                {ticket.admin_notes && ticket.status === 'resolved' && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Notes: {ticket.admin_notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminSupportTickets;
