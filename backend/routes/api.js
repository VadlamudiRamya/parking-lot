const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── Fixed slot limits (kept in code, not the database) ──────────────────────
const LIMITS = { bike: 5, car: 5, truck: 2 };

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calculate fare based on duration.
 * Stay is rounded UP to the nearest whole hour.
 * Slab: ≤3 h → ₹30 | ≤6 h → ₹85 | >6 h → ₹120
 */
function calculateFare(entryTime, exitTime) {
  const ms    = new Date(exitTime) - new Date(entryTime);
  const hours = Math.ceil(ms / (1000 * 60 * 60));
  if (hours <= 3) return { hours, amount: 30 };
  if (hours <= 6) return { hours, amount: 85 };
  return { hours, amount: 120 };
}

/** Generate a ticket id like TKT-1001 from an auto-increment id. */
function makeTicketId(id) {
  return `TKT-${1000 + id}`;
}

/** Count how many slots of a type are currently occupied. */
async function countOccupied(vehicleType) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS occupied FROM tickets WHERE vehicle_type = ? AND status = "parked"',
    [vehicleType]
  );
  return rows[0].occupied;
}

// ── GET /api/slots ───────────────────────────────────────────────────────────
// Returns availability for all vehicle types.
router.get('/slots', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT vehicle_type, COUNT(*) AS occupied
       FROM tickets
       WHERE status = 'parked'
       GROUP BY vehicle_type`
    );

    // Build occupancy map from query results
    const occupancy = { bike: 0, car: 0, truck: 0 };
    rows.forEach(r => { occupancy[r.vehicle_type] = Number(r.occupied); });

    const result = {};
    for (const [type, total] of Object.entries(LIMITS)) {
      result[type] = {
        total,
        available: Math.max(0, total - occupancy[type]),
      };
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ── POST /api/park ──────────────────────────────────────────────────────────
// Park a vehicle; return a ticket or an error.
router.post('/park', async (req, res) => {
  const { vehicleNumber, vehicleType } = req.body || {};

  // ── Validation ──────────────────────────────────────────────────────────
  if (!vehicleNumber || !vehicleType) {
    return res.status(400).json({
      success: false,
      message: 'vehicleNumber and vehicleType are required.',
    });
  }

  const normalizedType = String(vehicleType).toLowerCase();
  if (!LIMITS[normalizedType]) {
    return res.status(400).json({
      success: false,
      message: `Invalid vehicleType. Allowed values: ${Object.keys(LIMITS).join(', ')}.`,
    });
  }

  const normalizedNumber = String(vehicleNumber).toUpperCase().trim();

  try {
    // ── Duplicate vehicle check ─────────────────────────────────────────
    const [existing] = await pool.query(
      'SELECT id FROM tickets WHERE vehicle_number = ? AND status = "parked"',
      [normalizedNumber]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Vehicle ${normalizedNumber} is already parked.`,
      });
    }

    // ── Capacity check ──────────────────────────────────────────────────
    const occupied = await countOccupied(normalizedType);
    if (occupied >= LIMITS[normalizedType]) {
      return res.status(409).json({
        success: false,
        message: 'Parking Full',
      });
    }

    // ── Insert the ticket row ───────────────────────────────────────────
    const entryTime = new Date();
    const [insertResult] = await pool.query(
      `INSERT INTO tickets (ticket_id, vehicle_number, vehicle_type, entry_time, status)
       VALUES (?, ?, ?, ?, 'parked')`,
      ['PLACEHOLDER', normalizedNumber, normalizedType, entryTime]
    );

    // Update ticket_id now that we have the auto-increment id
    const ticketId = makeTicketId(insertResult.insertId);
    await pool.query('UPDATE tickets SET ticket_id = ? WHERE id = ?', [
      ticketId,
      insertResult.insertId,
    ]);

    return res.status(201).json({
      success: true,
      ticket: {
        ticketId,
        vehicleNumber: normalizedNumber,
        vehicleType:   normalizedType,
        entryTime:     entryTime.toISOString(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ── POST /api/exit ───────────────────────────────────────────────────────────
// Exit a vehicle by ticketId or vehicleNumber; return the receipt.
router.post('/exit', async (req, res) => {
  const { ticketId, vehicleNumber } = req.body || {};

  if (!ticketId && !vehicleNumber) {
    return res.status(400).json({
      success: false,
      message: 'Provide either ticketId or vehicleNumber.',
    });
  }

  try {
    // Find the parked record matching the given identifier
    let query, param;
    if (ticketId) {
      query = 'SELECT * FROM tickets WHERE ticket_id = ? AND status = "parked"';
      param  = String(ticketId).toUpperCase().trim();
    } else {
      query = 'SELECT * FROM tickets WHERE vehicle_number = ? AND status = "parked"';
      param  = String(vehicleNumber).toUpperCase().trim();
    }

    const [rows] = await pool.query(query, [param]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found or already exited',
      });
    }

    const record   = rows[0];
    const exitTime = new Date();
    const { hours, amount } = calculateFare(record.entry_time, exitTime);

    // Persist exit data
    await pool.query(
      'UPDATE tickets SET exit_time = ?, amount = ?, status = "exited" WHERE id = ?',
      [exitTime, amount, record.id]
    );

    return res.json({
      success: true,
      receipt: {
        ticketId:      record.ticket_id,
        vehicleNumber: record.vehicle_number,
        vehicleType:   record.vehicle_type,
        entryTime:     new Date(record.entry_time).toISOString(),
        exitTime:      exitTime.toISOString(),
        durationHours: hours,
        amount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ── GET /api/parked ──────────────────────────────────────────────────────────
// List all currently parked vehicles.
router.get('/parked', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ticket_id, vehicle_number, vehicle_type, entry_time
       FROM tickets
       WHERE status = 'parked'
       ORDER BY entry_time ASC`
    );

    const vehicles = rows.map(r => ({
      ticketId:      r.ticket_id,
      vehicleNumber: r.vehicle_number,
      vehicleType:   r.vehicle_type,
      entryTime:     new Date(r.entry_time).toISOString(),
    }));

    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
