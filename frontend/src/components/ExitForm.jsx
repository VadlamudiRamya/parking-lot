import React, { useState } from 'react';

function formatDuration(hours) {
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
}

function formatTime(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}  ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
}

export default function ExitForm({ onExited }) {
  const [identifier, setIdentifier] = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [receipt,    setReceipt]    = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const val = identifier.trim().toUpperCase();
    if (!val) { setError('Enter a ticket ID or vehicle number.'); return; }

    setLoading(true);
    setError('');
    setReceipt(null);

    // Detect whether the user typed a ticket id or a vehicle number
    const body = val.startsWith('TKT-')
      ? { ticketId: val }
      : { vehicleNumber: val };

    try {
      const res  = await fetch('/api/exit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Could not exit vehicle.');
        return;
      }

      setReceipt(data.receipt);
      setIdentifier('');
      onExited();
    } catch {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card">
      <div className="card-title">
        <span className="icon">🚪</span> Exit a Vehicle
      </div>

      <form onSubmit={handleSubmit} id="exit-form">
        <div className="form-group">
          <label className="form-label" htmlFor="exit-identifier">Ticket ID or Vehicle Number</label>
          <input
            id="exit-identifier"
            className="form-input"
            type="text"
            placeholder="e.g. TKT-1001 or KA01AB1234"
            value={identifier}
            onChange={e => { setIdentifier(e.target.value); setError(''); setReceipt(null); }}
            maxLength={20}
          />
        </div>

        <button
          id="exit-submit-btn"
          type="submit"
          className="btn btn-danger"
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : '🚗 Exit & Get Bill'}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">❌ {error}</div>
      )}

      {receipt && <Receipt receipt={receipt} />}
    </div>
  );
}

function Receipt({ receipt }) {
  const EMOJI = { bike: '🛵', car: '🚗', truck: '🚛' };
  return (
    <div className="receipt-card">
      <div className="receipt-title">
        ✅ Exit Receipt
      </div>
      <div className="receipt-rows">
        <div className="receipt-row">
          <span className="receipt-row-label">Ticket ID</span>
          <span className="receipt-row-value" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            {receipt.ticketId}
          </span>
        </div>
        <div className="receipt-row">
          <span className="receipt-row-label">Vehicle</span>
          <span className="receipt-row-value" style={{ fontFamily: 'monospace' }}>
            {EMOJI[receipt.vehicleType]} {receipt.vehicleNumber}
          </span>
        </div>
        <div className="receipt-row">
          <span className="receipt-row-label">Entry Time</span>
          <span className="receipt-row-value">{formatTime(receipt.entryTime)}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-row-label">Exit Time</span>
          <span className="receipt-row-value">{formatTime(receipt.exitTime)}</span>
        </div>
        <div className="receipt-row">
          <span className="receipt-row-label">Duration</span>
          <span className="receipt-row-value">{formatDuration(receipt.durationHours)}</span>
        </div>
      </div>
      <div className="receipt-fare">
        <span className="receipt-fare-label">Total Amount</span>
        <span className="receipt-fare-value">₹{receipt.amount}</span>
      </div>
    </div>
  );
}
