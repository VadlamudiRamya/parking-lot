require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const apiRoutes = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Parking Lot API is running 🚗'));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});
