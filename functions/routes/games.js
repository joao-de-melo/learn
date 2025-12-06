const express = require('express');
const { db } = require('../config');
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

      return {
        ...game,
        levelCount: (game.levelIds || []).length,
        assignmentCount: assignmentsSnap.size
      };
    }));

    res.json(games);
  } catch (err) {
    console.error('Get games error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single game with levels and assignments
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('games').doc(req.params.id).get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = { id: doc.id, ...doc.data() };

    // Get levels info
    const levels = [];
    for (const levelId of (game.levelIds || [])) {
      const levelDoc = await db.collection('levels').doc(levelId).get();
      if (levelDoc.exists) {
        const level = { id: levelDoc.id, ...levelDoc.data() };

        // Get challenge type info
        const ctDoc = await db.collection('challengeTypes').doc(level.challengeTypeId).get();
        if (ctDoc.exists) {
          level.challengeTypeName = ctDoc.data().name;
          level.renderer = ctDoc.data().renderer;

          const catDoc = await db.collection('categories').doc(ctDoc.data().categoryId).get();
          if (catDoc.exists) {
            level.categoryName = catDoc.data().name;
          }
        }

        levels.push(level);
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

    res.json({ ...game, levels, assignments });
  } catch (err) {
    console.error('Get game error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create game
router.post('/', async (req, res) => {
  try {
    const { name, description, levelIds } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const gameData = {
      accountId: req.accountId,
      name,
      description: description || null,
      levelIds: levelIds || [],
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
    const { name, description, levelIds } = req.body;
    const docRef = db.collection('games').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const updates = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (levelIds !== undefined) updates.levelIds = levelIds;

    await docRef.update(updates);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (err) {
    console.error('Update game error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add level to game
router.post('/:id/levels', async (req, res) => {
  try {
    const { levelId } = req.body;
    const docRef = db.collection('games').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const levelIds = doc.data().levelIds || [];
    if (!levelIds.includes(levelId)) {
      levelIds.push(levelId);
      await docRef.update({ levelIds, updatedAt: new Date() });
    }

    res.json({ message: 'Level added' });
  } catch (err) {
    console.error('Add level error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove level from game
router.delete('/:id/levels/:levelId', async (req, res) => {
  try {
    const docRef = db.collection('games').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const levelIds = (doc.data().levelIds || []).filter(id => id !== req.params.levelId);
    await docRef.update({ levelIds, updatedAt: new Date() });

    res.json({ message: 'Level removed' });
  } catch (err) {
    console.error('Remove level error:', err);
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
