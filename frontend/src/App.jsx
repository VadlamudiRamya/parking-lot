import React, { useState, useEffect, useCallback } from 'react';
import SlotCards     from './components/SlotCards';
import ParkForm      from './components/ParkForm';
import ExitForm      from './components/ExitForm';
import TicketDisplay from './components/TicketDisplay';
import ParkedList    from './components/ParkedList';

export default function App() {
  const [slots,          setSlots]          = useState(null);
  const [parkedVehicles, setParkedVehicles] = useState(null);
  const [lastTicket,     setLastTicket]     = useState(null);

  // Fetch slot availability and parked list
  const refresh = useCallback(async () => {
    try {
      const [slotsRes, parkedRes] = await Promise.all([
        fetch('/api/slots'),
        fetch('/api/parked'),
      ]);
      setSlots(await slotsRes.json());
      setParkedVehicles(await parkedRes.json());
    } catch (err) {
      console.error('Refresh error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => { refresh(); }, [refresh]);

  // Auto-refresh every 30 s
  useEffect(() => {
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  function handleParked(ticket) {
    setLastTicket(ticket);
    refresh();
  }

  function handleExited() {
    refresh();
  }

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-badge">Live System</div>
          <h1>TaxSafar Parking</h1>
          <p>Smart parking management — park, track, and exit vehicles in real time.</p>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────── */}
      <main className="app-container">

        {/* Slot Availability */}
        <section className="slots-section">
          <div className="section-label">Live Slot Availability</div>
          <SlotCards slots={slots} />
        </section>

        {/* Forms + Ticket + Parked List */}
        <div className="main-grid">
          {/* Left column — forms + last ticket */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ParkForm onParked={handleParked} />
            <ExitForm onExited={handleExited} />
            {lastTicket && <TicketDisplay ticket={lastTicket} />}
          </div>

          {/* Right column — parked vehicles */}
          <div>
            <ParkedList vehicles={parkedVehicles} onRefresh={refresh} />
          </div>
        </div>
      </main>
    </>
  );
}
