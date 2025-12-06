const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create assignment (assign game to kid)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { gameId, kidId } = req.body;

    if (!gameId || !kidId) {
      return res.status(400).json({ error: 'gameId and kidId are required' });
    }

    // Verify game belongs to account
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists || gameDoc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Verify kid belongs to account
    const kidDoc = await db.collection('kids').doc(kidId).get();
    if (!kidDoc.exists || kidDoc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    // Check if assignment already exists
    const existingSnap = await db.collection('assignments')
      .where('gameId', '==', gameId)
      .where('kidId', '==', kidId)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      const existing = { id: existingSnap.docs[0].id, ...existingSnap.docs[0].data() };
      return res.json(existing);
    }

    // Create new assignment
    const assignmentData = {
      gameId,
      kidId,
      playToken: uuidv4(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('assignments').add(assignmentData);
    res.status(201).json({ id: docRef.id, ...assignmentData });
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assignments for a game
router.get('/game/:gameId', authMiddleware, async (req, res) => {
  try {
    const gameDoc = await db.collection('games').doc(req.params.gameId).get();
    if (!gameDoc.exists || gameDoc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const snapshot = await db.collection('assignments')
      .where('gameId', '==', req.params.gameId)
      .get();

    const assignments = await Promise.all(snapshot.docs.map(async doc => {
      const assignment = { id: doc.id, ...doc.data() };
      const kidDoc = await db.collection('kids').doc(assignment.kidId).get();
      if (kidDoc.exists) {
        const kid = kidDoc.data();
        assignment.kidName = kid.name;
        assignment.kidAvatar = kid.avatar;
        assignment.kidAge = kid.age;
      }
      return assignment;
    }));

    res.json(assignments);
  } catch (err) {
    console.error('Get assignments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assignments for a kid
router.get('/kid/:kidId', authMiddleware, async (req, res) => {
  try {
    const kidDoc = await db.collection('kids').doc(req.params.kidId).get();
    if (!kidDoc.exists || kidDoc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    const snapshot = await db.collection('assignments')
      .where('kidId', '==', req.params.kidId)
      .where('isActive', '==', true)
      .get();

    const assignments = await Promise.all(snapshot.docs.map(async doc => {
      const assignment = { id: doc.id, ...doc.data() };
      const gameDoc = await db.collection('games').doc(assignment.gameId).get();
      if (gameDoc.exists) {
        const game = gameDoc.data();
        assignment.gameName = game.name;
        assignment.gameDescription = game.description;
      }
      return assignment;
    }));

    res.json(assignments);
  } catch (err) {
    console.error('Get kid assignments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete assignment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const docRef = db.collection('assignments').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify ownership via game
    const gameDoc = await db.collection('games').doc(doc.data().gameId).get();
    if (!gameDoc.exists || gameDoc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await docRef.delete();
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error('Delete assignment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
