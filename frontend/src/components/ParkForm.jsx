import React, { useState } from 'react';

const VEHICLE_TYPES = ['bike', 'car', 'truck'];

export default function ParkForm({ onParked }) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType,   setVehicleType]   = useState('car');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const num = vehicleNumber.trim().toUpperCase();
    if (!num) { setError('Please enter a vehicle number.'); return; }

    setLoading(true);
    setError('');

    try {
      const res  = await fetch('/api/park', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ vehicleNumber: num, vehicleType }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to park vehicle.');
        return;
      }

      setVehicleNumber('');
      onParked(data.ticket);
    } catch {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card">
      <div className="card-title">
        <span className="icon">🚘</span> Park a Vehicle
      </div>

      <form onSubmit={handleSubmit} id="park-form">
        <div className="form-group">
          <label className="form-label" htmlFor="park-vehicle-number">Vehicle Number</label>
          <input
            id="park-vehicle-number"
            className="form-input"
            type="text"
            placeholder="e.g. KA01AB1234"
            value={vehicleNumber}
            onChange={e => { setVehicleNumber(e.target.value); setError(''); }}
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="park-vehicle-type">Vehicle Type</label>
          <select
            id="park-vehicle-type"
            className="form-select"
            value={vehicleType}
            onChange={e => setVehicleType(e.target.value)}
          >
            {VEHICLE_TYPES.map(t => (
              <option key={t} value={t}>
                {t === 'bike' ? '🛵 Bike' : t === 'car' ? '🚗 Car' : '🚛 Truck'}
              </option>
            ))}
          </select>
        </div>

        <button
          id="park-submit-btn"
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : '🅿️ Park Vehicle'}
        </button>
      </form>

      {error && (
        <div className={`alert ${error === 'Parking Full' ? 'alert-warning' : 'alert-error'}`}>
          {error === 'Parking Full' ? '⚠️' : '❌'} {error}
        </div>
      )}
    </div>
  );
}
