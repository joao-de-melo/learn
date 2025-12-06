require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const kidsRoutes = require('./routes/kids');
const levelsRoutes = require('./routes/levels');
const gamesRoutes = require('./routes/games');
const assignmentsRoutes = require('./routes/assignments');
const playRoutes = require('./routes/play');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
