import React from 'react';

const EMOJI = { bike: '🛵', car: '🚗', truck: '🚛' };

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function computeElapsed(entryIso) {
  const ms    = Date.now() - new Date(entryIso).getTime();
  const h     = Math.floor(ms / 3_600_000);
  const m     = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0)  return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ParkedList({ vehicles, onRefresh }) {
  if (!vehicles) {
    return (
      <div className="glass-card">
        <div className="card-title"><span className="icon">🏎️</span> Currently Parked</div>
        <div className="empty-state"><div className="empty-icon">⏳</div>Loading…</div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="section-header">
        <div className="card-title" style={{ marginBottom: 0 }}>
          <span className="icon">🏎️</span> Currently Parked
          <span style={{
            marginLeft: 8,
            fontSize: 12,
            fontWeight: 600,
            background: 'rgba(99,179,237,0.12)',
            color: 'var(--accent)',
            padding: '2px 8px',
            borderRadius: '99px',
          }}>
            {vehicles.length}
          </span>
        </div>
        <button className="refresh-btn" onClick={onRefresh} id="refresh-parked-btn" title="Refresh list">
          🔄 Refresh
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🅿️</div>
          No vehicles currently parked
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Entry</th>
                <th>Elapsed</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.ticketId}>
                  <td className="td-ticket">{v.ticketId}</td>
                  <td className="td-plate">{v.vehicleNumber}</td>
                  <td>
                    <span className={`type-chip ${v.vehicleType}`}>
                      {EMOJI[v.vehicleType]} {v.vehicleType}
                    </span>
                  </td>
                  <td>{formatDate(v.entryTime)} {formatTime(v.entryTime)}</td>
                  <td style={{ color: 'var(--warning)', fontWeight: 600 }}>
                    {computeElapsed(v.entryTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
