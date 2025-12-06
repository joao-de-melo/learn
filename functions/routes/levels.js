const express = require('express');
const { db } = require('../db');

const router = express.Router();

// Get all categories with challenge types
router.get('/categories', async (req, res) => {
  try {
    const categoriesSnap = await db.collection('categories')
      .orderBy('displayOrder')
      .get();

    const challengeTypesSnap = await db.collection('challengeTypes').get();
    const challengeTypesByCategory = {};
    challengeTypesSnap.docs.forEach(doc => {
      const ct = { id: doc.id, ...doc.data() };
      if (!challengeTypesByCategory[ct.categoryId]) {
        challengeTypesByCategory[ct.categoryId] = [];
      }
      challengeTypesByCategory[ct.categoryId].push(ct);
    });

    const categories = categoriesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      challengeTypes: challengeTypesByCategory[doc.id] || []
    }));

    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all levels grouped by category and challenge type
router.get('/', async (req, res) => {
  try {
    const { categoryId, challengeTypeId, minAge, maxAge } = req.query;

    let query = db.collection('levels');

    if (challengeTypeId) {
      query = query.where('challengeTypeId', '==', challengeTypeId);
    }

    const snapshot = await query.get();

    // Get challenge types for category info
    const challengeTypesSnap = await db.collection('challengeTypes').get();
    const challengeTypesMap = {};
    challengeTypesSnap.docs.forEach(doc => {
      challengeTypesMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    // Get categories
    const categoriesSnap = await db.collection('categories').get();
    const categoriesMap = {};
    categoriesSnap.docs.forEach(doc => {
      categoriesMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    let levels = snapshot.docs.map(doc => {
      const level = { id: doc.id, ...doc.data() };
      const challengeType = challengeTypesMap[level.challengeTypeId] || {};
      const category = categoriesMap[challengeType.categoryId] || {};
      return {
        ...level,
        challengeTypeName: challengeType.name,
        categoryId: challengeType.categoryId,
        categoryName: category.name
      };
    });

    // Filter by category if provided
    if (categoryId) {
      levels = levels.filter(l => l.categoryId === categoryId);
    }

    // Filter by age range if provided
    if (minAge) {
      levels = levels.filter(l => l.maxAge >= parseInt(minAge));
    }
    if (maxAge) {
      levels = levels.filter(l => l.minAge <= parseInt(maxAge));
    }

    // Sort by category, then difficulty
    levels.sort((a, b) => {
      if (a.categoryName !== b.categoryName) return a.categoryName.localeCompare(b.categoryName);
      return a.difficulty - b.difficulty;
    });

    res.json(levels);
  } catch (err) {
    console.error('Get levels error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all levels grouped by category (for game builder)
router.get('/by-category', async (req, res) => {
  try {
    // Get all data
    const [categoriesSnap, challengeTypesSnap, levelsSnap] = await Promise.all([
      db.collection('categories').orderBy('displayOrder').get(),
      db.collection('challengeTypes').get(),
      db.collection('levels').get()
    ]);

    const challengeTypesMap = {};
    challengeTypesSnap.docs.forEach(doc => {
      challengeTypesMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    const levelsByChallenge = {};
    levelsSnap.docs.forEach(doc => {
      const level = { id: doc.id, ...doc.data() };
      if (!levelsByChallenge[level.challengeTypeId]) {
        levelsByChallenge[level.challengeTypeId] = [];
      }
      levelsByChallenge[level.challengeTypeId].push(level);
    });

    const result = categoriesSnap.docs.map(catDoc => {
      const category = { id: catDoc.id, ...catDoc.data() };
      const challengeTypes = Object.values(challengeTypesMap)
        .filter(ct => ct.categoryId === catDoc.id)
        .map(ct => ({
          ...ct,
          levels: (levelsByChallenge[ct.id] || []).sort((a, b) => a.difficulty - b.difficulty)
        }));

      return {
        ...category,
        challengeTypes
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Get levels by category error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single level with questions (for preview)
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('levels').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const level = { id: doc.id, ...doc.data() };

    // Get challenge type info
    const ctDoc = await db.collection('challengeTypes').doc(level.challengeTypeId).get();
    if (ctDoc.exists) {
      const ct = ctDoc.data();
      level.challengeTypeName = ct.name;
      level.renderer = ct.renderer;

      // Get category info
      const catDoc = await db.collection('categories').doc(ct.categoryId).get();
      if (catDoc.exists) {
        level.categoryName = catDoc.data().name;
      }
    }

    // Add question_type to each question so the frontend ChallengeRenderer can display them
    if (level.questions && level.renderer) {
      level.questions = level.questions.map(q => ({
        ...q,
        question_type: level.renderer
      }));
    }

    res.json(level);
  } catch (err) {
    console.error('Get level error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get level preview (sample questions)
router.get('/:id/preview', async (req, res) => {
  try {
    const doc = await db.collection('levels').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const level = { id: doc.id, ...doc.data() };

    // Get challenge type info
    const ctDoc = await db.collection('challengeTypes').doc(level.challengeTypeId).get();
    if (ctDoc.exists) {
      const ct = ctDoc.data();
      level.challengeTypeName = ct.name;
      level.renderer = ct.renderer;

      const catDoc = await db.collection('categories').doc(ct.categoryId).get();
      if (catDoc.exists) {
        level.categoryName = catDoc.data().name;
      }
    }

    // Return only first 3 questions as preview
    // Add question_type to each question so the frontend ChallengeRenderer can display them
    const previewQuestions = (level.questions || []).slice(0, 3).map(q => ({
      ...q,
      question_type: level.renderer
    }));

    res.json({
      ...level,
      previewQuestions,
      totalQuestions: (level.questions || []).length
    });
  } catch (err) {
    console.error('Get level preview error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
