require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const apiRoutes = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

const path = require('path');

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Serve static frontend files in production
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// Catch-all route to serve the React frontend index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});
