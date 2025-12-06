const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Share the db instance
const db = admin.firestore();
module.exports.db = db;

// Import routes
const authRoutes = require('./routes/auth');
const kidsRoutes = require('./routes/kids');
const levelsRoutes = require('./routes/levels');
const gamesRoutes = require('./routes/games');
const assignmentsRoutes = require('./routes/assignments');
const playRoutes = require('./routes/play');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kids', kidsRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/play', playRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export as Firebase Function
exports.api = functions.https.onRequest(app);
