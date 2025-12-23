const express = require('express');
const { db } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all games for account
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('games')
      .where('accountId', '==', req.accountId)
      .orderBy('createdAt', 'desc')
      .get();

    const games = await Promise.all(snapshot.docs.map(async doc => {
      const game = { id: doc.id, ...doc.data() };

      // Count assignments
      const assignmentsSnap = await db.collection('assignments')
        .where('gameId', '==', doc.id)
        .get();

      // Calculate total questions from challenges
      const totalQuestions = (game.challenges || []).reduce((sum, c) => sum + (c.questionCount || 0), 0);

      return {
        ...game,
        challengeCount: (game.challenges || []).length,
        totalQuestions,
        assignmentCount: assignmentsSnap.size
      };
    }));

    res.json(games);
  } catch (err) {
    console.error('Get games error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single game with challenges and assignments
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('games').doc(req.params.id).get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = { id: doc.id, ...doc.data() };

    // Get challenge types info for the game's challenges
    const challengesWithInfo = [];
    for (const challenge of (game.challenges || [])) {
      const ctDoc = await db.collection('challengeTypes').doc(challenge.challengeTypeId).get();
      if (ctDoc.exists) {
        const ct = ctDoc.data();
        const catDoc = await db.collection('categories').doc(ct.categoryId).get();

        challengesWithInfo.push({
          ...challenge,
          name: ct.name,
          description: ct.description,
          renderer: ct.renderer,
          categoryId: ct.categoryId,
          categoryName: catDoc.exists ? catDoc.data().name : null
        });
      }
    }

    // Get assignments
    const assignmentsSnap = await db.collection('assignments')
      .where('gameId', '==', req.params.id)
      .get();

    const assignments = await Promise.all(assignmentsSnap.docs.map(async aDoc => {
      const assignment = { id: aDoc.id, ...aDoc.data() };
      const kidDoc = await db.collection('kids').doc(assignment.kidId).get();
      if (kidDoc.exists) {
        assignment.kidName = kidDoc.data().name;
        assignment.kidAvatar = kidDoc.data().avatar;
      }
      return assignment;
    }));

    res.json({ ...game, challenges: challengesWithInfo, assignments });
  } catch (err) {
    console.error('Get game error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create game
router.post('/', async (req, res) => {
  try {
    const { name, description, challenges, language, helpEnabled, voiceEnabled } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!challenges || challenges.length === 0) {
      return res.status(400).json({ error: 'At least one challenge is required' });
    }

    const gameData = {
      accountId: req.accountId,
      name,
      description: description || null,
      language: language || 'pt', // Default to Portuguese
      helpEnabled: helpEnabled || false,
      voiceEnabled: voiceEnabled || false,
      challenges: challenges || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('games').add(gameData);
    res.status(201).json({ id: docRef.id, ...gameData });
  } catch (err) {
    console.error('Create game error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update game
router.put('/:id', async (req, res) => {
  try {
    const { name, description, challenges, language, helpEnabled, voiceEnabled } = req.body;
    const docRef = db.collection('games').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const updates = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (challenges !== undefined) updates.challenges = challenges;
    if (language !== undefined) updates.language = language;
    if (helpEnabled !== undefined) updates.helpEnabled = helpEnabled;
    if (voiceEnabled !== undefined) updates.voiceEnabled = voiceEnabled;

    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error('Update game error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete game
router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('games').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Delete related assignments
    const assignmentsSnap = await db.collection('assignments')
      .where('gameId', '==', req.params.id)
      .get();

    const batch = db.batch();
    assignmentsSnap.docs.forEach(aDoc => batch.delete(aDoc.ref));
    batch.delete(docRef);
    await batch.commit();

    res.json({ message: 'Game deleted' });
  } catch (err) {
    console.error('Delete game error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
