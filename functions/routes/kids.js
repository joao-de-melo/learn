const express = require('express');
const { db } = require('../db');
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
    const { name, birthYear, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const kidData = {
      accountId: req.accountId,
      name,
      birthYear: birthYear || null,
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
    const { name, birthYear, avatar } = req.body;
    const docRef = db.collection('kids').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    const updates = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (birthYear !== undefined) updates.birthYear = birthYear;
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

// Get kid metrics/stats
router.get('/:id/metrics', async (req, res) => {
  try {
    const kidDoc = await db.collection('kids').doc(req.params.id).get();

    if (!kidDoc.exists || kidDoc.data().accountId !== req.accountId) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    const kid = { id: kidDoc.id, ...kidDoc.data() };

    // Get all assignments for this kid
    const assignmentsSnap = await db.collection('assignments')
      .where('kidId', '==', req.params.id)
      .get();

    const assignmentIds = assignmentsSnap.docs.map(d => d.id);

    // Get progress data for all assignments
    let progressDocs = [];
    if (assignmentIds.length > 0) {
      // Firestore 'in' queries are limited to 10 items, so we batch
      for (let i = 0; i < assignmentIds.length; i += 10) {
        const batch = assignmentIds.slice(i, i + 10);
        const progressSnap = await db.collection('progress')
          .where('assignmentId', 'in', batch)
          .get();
        progressDocs = [...progressDocs, ...progressSnap.docs];
      }
    }

    // Get challenge type names
    const challengeTypeIds = [...new Set(progressDocs.map(d => d.data().challengeTypeId))];
    const challengeTypes = {};
    for (const ctId of challengeTypeIds) {
      const ctDoc = await db.collection('challengeTypes').doc(ctId).get();
      if (ctDoc.exists) {
        challengeTypes[ctId] = ctDoc.data();
      }
    }

    // Get game names
    const gameIds = [...new Set(assignmentsSnap.docs.map(d => d.data().gameId))];
    const games = {};
    for (const gId of gameIds) {
      const gDoc = await db.collection('games').doc(gId).get();
      if (gDoc.exists) {
        games[gId] = gDoc.data();
      }
    }

    // Build per-challenge stats
    const challengeStats = {};
    for (const doc of progressDocs) {
      const data = doc.data();
      const ctId = data.challengeTypeId;

      if (!challengeStats[ctId]) {
        challengeStats[ctId] = {
          challengeTypeId: ctId,
          name: challengeTypes[ctId]?.name || 'Unknown',
          category: challengeTypes[ctId]?.categoryId || null,
          totalAttempts: 0,
          correctAttempts: 0,
          challengeRepeats: 0,
          lastAttemptAt: null
        };
      }

      challengeStats[ctId].totalAttempts += data.totalAttempts || 0;
      challengeStats[ctId].correctAttempts += data.correctAttempts || 0;
      challengeStats[ctId].challengeRepeats += data.challengeRepeats || 0;

      const lastAttempt = data.lastAttemptAt?.toDate ? data.lastAttemptAt.toDate() : data.lastAttemptAt;
      if (lastAttempt && (!challengeStats[ctId].lastAttemptAt || lastAttempt > challengeStats[ctId].lastAttemptAt)) {
        challengeStats[ctId].lastAttemptAt = lastAttempt;
      }
    }

    // Calculate overall stats
    const overallStats = {
      totalAttempts: 0,
      correctAttempts: 0,
      totalChallengeRepeats: 0,
      successRate: 0,
      gamesAssigned: assignmentIds.length,
      challengesAttempted: Object.keys(challengeStats).length
    };

    for (const stat of Object.values(challengeStats)) {
      overallStats.totalAttempts += stat.totalAttempts;
      overallStats.correctAttempts += stat.correctAttempts;
      overallStats.totalChallengeRepeats += stat.challengeRepeats;
    }

    if (overallStats.totalAttempts > 0) {
      overallStats.successRate = Math.round((overallStats.correctAttempts / overallStats.totalAttempts) * 100);
    }

    // Build assignments list with progress
    const assignments = assignmentsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        gameId: data.gameId,
        gameName: games[data.gameId]?.name || 'Unknown',
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      };
    });

    res.json({
      kid,
      overallStats,
      challengeStats: Object.values(challengeStats).sort((a, b) =>
        (b.lastAttemptAt || 0) - (a.lastAttemptAt || 0)
      ),
      assignments
    });
  } catch (err) {
    console.error('Get kid metrics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
