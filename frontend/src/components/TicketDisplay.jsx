import React from 'react';

export default function TicketDisplay({ ticket }) {
  if (!ticket) return null;

  const entry = new Date(ticket.entryTime);
  const EMOJI = { bike: '🛵', car: '🚗', truck: '🚛' };

  return (
    <div className="ticket-card">
      <div className="ticket-header">
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Parking Ticket</div>
          <div className="ticket-id">🎫 {ticket.ticketId}</div>
        </div>
        <span className="ticket-type-badge">{EMOJI[ticket.vehicleType]} {ticket.vehicleType}</span>
      </div>

      <div className="ticket-rows">
        <div className="ticket-row">
          <span className="ticket-row-label">Vehicle Number</span>
          <span className="ticket-row-value" style={{ fontFamily: 'monospace', fontSize: 15 }}>
            {ticket.vehicleNumber}
          </span>
        </div>
        <div className="ticket-row">
          <span className="ticket-row-label">Entry Time</span>
          <span className="ticket-row-value">
            {entry.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            &nbsp;&nbsp;
            {entry.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>
        <div className="ticket-row">
          <span className="ticket-row-label">Status</span>
          <span className="ticket-row-value" style={{ color: 'var(--success)' }}>● Parked</span>
        </div>
      </div>

      <div className="ticket-amount" style={{ justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Show this ticket at exit
        </span>
      </div>
    </div>
  );
}
