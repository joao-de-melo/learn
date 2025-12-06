const express = require('express');
const { db } = require('../config');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all kids for account
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('kids')
      .where('accountId', '==', req.accountId)
      .orderBy('createdAt', 'desc')
      .get();

    const kids = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(kids);
  } catch (err) {
    console.error('Get kids error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single kid
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('kids').doc(req.params.id).get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Get kid error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create kid
router.post('/', async (req, res) => {
  try {
    const { name, age, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const kidData = {
      accountId: req.accountId,
      name,
      age: age || null,
      avatar: avatar || 'bear',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('kids').add(kidData);
    res.status(201).json({ id: docRef.id, ...kidData });
  } catch (err) {
    console.error('Create kid error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update kid
router.put('/:id', async (req, res) => {
  try {
    const { name, age, avatar } = req.body;
    const docRef = db.collection('kids').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    const updates = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (age !== undefined) updates.age = age;
    if (avatar !== undefined) updates.avatar = avatar;

    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error('Update kid error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete kid
router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('kids').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    await docRef.delete();
    res.json({ message: 'Kid deleted' });
  } catch (err) {
    console.error('Delete kid error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
