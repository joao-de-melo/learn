const { onRequest } = require('firebase-functions/v2/https');
const express = require('express');
const cors = require('cors');

// Initialize firebase-admin via db.js
require('./db');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Import routes
const kidsRoutes = require('./routes/kids');
const levelsRoutes = require('./routes/levels');
const gamesRoutes = require('./routes/games');
const assignmentsRoutes = require('./routes/assignments');
const playRoutes = require('./routes/play');

// Routes (auth is handled by Firebase Auth SDK on frontend)
// Firebase Hosting rewrites /api/** to this function, preserving the /api prefix
app.use('/api/kids', kidsRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/play', playRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export as Firebase Function (v2) - deployed to London
exports.api = onRequest({ region: 'europe-west2' }, app);
