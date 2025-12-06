const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if email already exists
    const existingQuery = await db.collection('accounts')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const accountData = {
      email,
      passwordHash,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('accounts').add(accountData);
    const token = jwt.sign({ accountId: docRef.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      account: { id: docRef.id, email, name },
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = await db.collection('accounts')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (query.empty) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const doc = query.docs[0];
    const account = { id: doc.id, ...doc.data() };

    const validPassword = await bcrypt.compare(password, account.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ accountId: account.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      account: { id: account.id, email: account.email, name: account.name },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current account
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const doc = await db.collection('accounts').doc(req.accountId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = doc.data();
    res.json({ id: doc.id, email: account.email, name: account.name });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
