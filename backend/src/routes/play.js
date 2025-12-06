const express = require('express');
const { db } = require('../config/firebase');

const router = express.Router();

// Get game data by play token (public)
router.get('/:token', async (req, res) => {
  try {
    const snapshot = await db.collection('assignments')
      .where('playToken', '==', req.params.token)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Game not found or inactive' });
    }

    const assignment = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    // Get kid info
    const kidDoc = await db.collection('kids').doc(assignment.kidId).get();
    const kid = kidDoc.exists ? kidDoc.data() : {};

    // Get game info
    const gameDoc = await db.collection('games').doc(assignment.gameId).get();
    if (!gameDoc.exists) {
      return res.status(404).json({ error: 'Game not found' });
    }
    const game = gameDoc.data();

    // Get levels with challenge type info
    const levels = [];
    for (const levelId of (game.levelIds || [])) {
      const levelDoc = await db.collection('levels').doc(levelId).get();
      if (levelDoc.exists) {
        const level = { id: levelDoc.id, ...levelDoc.data() };

        // Get challenge type for renderer
        const ctDoc = await db.collection('challengeTypes').doc(level.challengeTypeId).get();
        if (ctDoc.exists) {
          level.renderer = ctDoc.data().renderer;
          level.challengeTypeName = ctDoc.data().name;

          const catDoc = await db.collection('categories').doc(ctDoc.data().categoryId).get();
          if (catDoc.exists) {
            level.categoryName = catDoc.data().name;
          }
        }

        // Get progress for this level
        const progressSnap = await db.collection('progress')
          .where('assignmentId', '==', assignment.id)
          .where('levelId', '==', levelId)
          .get();

        let completed = 0;
        let correct = 0;
        progressSnap.docs.forEach(pDoc => {
          const p = pDoc.data();
          if (p.isCompleted) {
            completed++;
            if (p.isCorrect) correct++;
          }
        });

        level.progress = { completed, correct };
        level.questionCount = (level.questions || []).length;

        // Don't send full questions in list view
        delete level.questions;

        levels.push(level);
      }
    }

    res.json({
      assignmentId: assignment.id,
      kidName: kid.name,
      kidAvatar: kid.avatar,
      gameName: game.name,
      gameDescription: game.description,
      levels
    });
  } catch (err) {
    console.error('Get play data error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get level questions for play
router.get('/:token/level/:levelId', async (req, res) => {
  try {
    // Verify assignment
    const snapshot = await db.collection('assignments')
      .where('playToken', '==', req.params.token)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Game not found or inactive' });
    }

    const assignment = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    // Verify level is in game
    const gameDoc = await db.collection('games').doc(assignment.gameId).get();
    if (!gameDoc.exists || !gameDoc.data().levelIds.includes(req.params.levelId)) {
      return res.status(404).json({ error: 'Level not found in this game' });
    }

    // Get level
    const levelDoc = await db.collection('levels').doc(req.params.levelId).get();
    if (!levelDoc.exists) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const level = { id: levelDoc.id, ...levelDoc.data() };

    // Get challenge type for renderer
    const ctDoc = await db.collection('challengeTypes').doc(level.challengeTypeId).get();
    if (ctDoc.exists) {
      level.renderer = ctDoc.data().renderer;
      level.challengeTypeName = ctDoc.data().name;

      const catDoc = await db.collection('categories').doc(ctDoc.data().categoryId).get();
      if (catDoc.exists) {
        level.categoryName = catDoc.data().name;
      }
    }

    // Get progress for each question
    const progressSnap = await db.collection('progress')
      .where('assignmentId', '==', assignment.id)
      .where('levelId', '==', req.params.levelId)
      .get();

    const progressMap = {};
    progressSnap.docs.forEach(pDoc => {
      const p = pDoc.data();
      progressMap[p.questionIndex] = {
        isCompleted: p.isCompleted,
        isCorrect: p.isCorrect,
        attempts: p.attempts
      };
    });

    const questions = (level.questions || []).map((q, index) => ({
      ...q,
      index,
      progress: progressMap[index] || null
    }));

    res.json({
      level: {
        id: level.id,
        name: level.name,
        renderer: level.renderer,
        challengeTypeName: level.challengeTypeName,
        categoryName: level.categoryName
      },
      questions,
      assignmentId: assignment.id
    });
  } catch (err) {
    console.error('Get level questions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit answer
router.post('/:token/level/:levelId/question/:questionIndex/answer', async (req, res) => {
  try {
    const { answer } = req.body;
    const questionIndex = parseInt(req.params.questionIndex);

    // Verify assignment
    const snapshot = await db.collection('assignments')
      .where('playToken', '==', req.params.token)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Game not found or inactive' });
    }

    const assignment = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };

    // Get level and question
    const levelDoc = await db.collection('levels').doc(req.params.levelId).get();
    if (!levelDoc.exists) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const level = levelDoc.data();
    const question = (level.questions || [])[questionIndex];
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Check answer
    const isCorrect = checkAnswer(answer, question.answerData);

    // Find or create progress document
    const progressQuery = await db.collection('progress')
      .where('assignmentId', '==', assignment.id)
      .where('levelId', '==', req.params.levelId)
      .where('questionIndex', '==', questionIndex)
      .limit(1)
      .get();

    let progressRef;
    let progressData;

    if (progressQuery.empty) {
      progressData = {
        assignmentId: assignment.id,
        levelId: req.params.levelId,
        questionIndex,
        isCompleted: true,
        isCorrect,
        attempts: 1,
        completedAt: new Date(),
        createdAt: new Date()
      };
      progressRef = await db.collection('progress').add(progressData);
    } else {
      progressRef = progressQuery.docs[0].ref;
      const existing = progressQuery.docs[0].data();
      progressData = {
        isCompleted: true,
        isCorrect: existing.isCorrect || isCorrect,
        attempts: (existing.attempts || 0) + 1,
        completedAt: new Date()
      };
      await progressRef.update(progressData);
    }

    res.json({
      isCorrect,
      correctAnswer: question.answerData.correct,
      progress: progressData
    });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

function checkAnswer(answer, answerData) {
  if (typeof answerData.correct === 'number') {
    return parseInt(answer) === answerData.correct;
  }
  if (typeof answerData.correct === 'string') {
    return answer.toString().toLowerCase() === answerData.correct.toLowerCase();
  }
  return answer === answerData.correct;
}

module.exports = router;
