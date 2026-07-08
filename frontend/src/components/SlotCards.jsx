import React from 'react';

const EMOJI = { bike: '🛵', car: '🚗', truck: '🚛' };

function slotState(available, total) {
  if (available === 0) return 'full';
  if (available <= Math.ceil(total * 0.3)) return 'low';
  return 'ok';
}

function statusLabel(state) {
  return state === 'full' ? 'Full' : state === 'low' ? 'Low' : 'Open';
}

export default function SlotCards({ slots }) {
  if (!slots) {
    return (
      <div className="slot-cards">
        {['bike', 'car', 'truck'].map(t => (
          <div key={t} className="slot-card ok" style={{ opacity: 0.4 }}>
            <div className="slot-card-header">
              <span className="slot-emoji">{EMOJI[t]}</span>
            </div>
            <span className="slot-label">{t}</span>
            <div className="slot-numbers">
              <span className="slot-available" style={{ color: 'var(--text-muted)' }}>—</span>
            </div>
            <div className="slot-bar-track"><div className="slot-bar-fill" style={{ width: '0%' }} /></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="slot-cards">
      {Object.entries(slots).map(([type, { total, available }]) => {
        const state = slotState(available, total);
        const fillPct = ((total - available) / total) * 100;
        return (
          <div key={type} className={`slot-card ${state}`}>
            <div className="slot-card-header">
              <span className="slot-emoji">{EMOJI[type]}</span>
              <span className={`slot-status-pill ${state}`}>{statusLabel(state)}</span>
            </div>
            <span className="slot-label">{type.charAt(0).toUpperCase() + type.slice(1)} Slots</span>
            <div className="slot-numbers">
              <span className="slot-available">{available}</span>
              <span className="slot-total">/ {total} free</span>
            </div>
            <div className="slot-bar-track">
              <div className="slot-bar-fill" style={{ width: `${fillPct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
