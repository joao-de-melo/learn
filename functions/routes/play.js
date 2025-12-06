const express = require('express');
const { db } = require('../db');

const router = express.Router();

// Question generators for each challenge type
const questionGenerators = {
  counting: (config) => {
    const { maxNumber = 5, questionCount = 5 } = config;
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const count = Math.floor(Math.random() * maxNumber) + 1;
      const options = generateNumberOptions(count, maxNumber);
      questions.push({
        questionData: { count, iconType: null },
        answerData: { correct: count, options }
      });
    }
    return questions;
  },

  visual_addition: (config) => {
    const { maxSum = 5, questionCount = 5 } = config;
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const a = Math.floor(Math.random() * (maxSum - 1)) + 1;
      const b = Math.floor(Math.random() * (maxSum - a)) + 1;
      const sum = a + b;
      const options = generateVisualOptions(sum, maxSum);
      questions.push({
        questionData: { leftCount: a, rightCount: b, iconType: null },
        answerData: { correct: sum, options }
      });
    }
    return questions;
  },

  visual_subtraction: (config) => {
    const { maxNumber = 5, questionCount = 5 } = config;
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const a = Math.floor(Math.random() * (maxNumber - 1)) + 2;
      const b = Math.floor(Math.random() * (a - 1)) + 1;
      const diff = a - b;
      const options = generateNumberOptions(diff, maxNumber);
      questions.push({
        questionData: { startCount: a, removeCount: b, iconType: null },
        answerData: { correct: diff, options }
      });
    }
    return questions;
  },

  letter_recognition: (config) => {
    const { letters = ['A', 'B', 'C', 'D', 'E'], questionCount = 5 } = config;
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const target = letters[Math.floor(Math.random() * letters.length)];
      const options = getLetterOptions(target, letters);
      questions.push({
        questionData: { target },
        answerData: { correct: target, options }
      });
    }
    return questions;
  },

  pattern: (config) => {
    const { patternTypes = ['colors'], questionCount = 5 } = config;
    const patternItems = {
      colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
      shapes: ['circle', 'square', 'triangle', 'star', 'heart'],
      numbers: ['1', '2', '3', '4', '5']
    };
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
      const items = patternItems[patternType] || patternItems.colors;
      const a = items[Math.floor(Math.random() * items.length)];
      let b = items[Math.floor(Math.random() * items.length)];
      while (b === a) b = items[Math.floor(Math.random() * items.length)];

      // AB pattern
      const pattern = [a, b, a, b, a];
      const correct = b;
      const options = [a, b];
      let c = items[Math.floor(Math.random() * items.length)];
      while (c === a || c === b) c = items[Math.floor(Math.random() * items.length)];
      options.push(c);

      questions.push({
        questionData: { pattern, display: patternType },
        answerData: { correct, options: shuffleArray(options) }
      });
    }
    return questions;
  },

  odd_one_out: (config) => {
    const { categories = ['fruits', 'animals'], questionCount = 5 } = config;
    const categoryItems = {
      fruits: ['apple', 'banana', 'orange', 'grape', 'strawberry'],
      animals: ['cat', 'dog', 'bear', 'bird', 'fish'],
      shapes: ['circle', 'square', 'triangle', 'star', 'heart']
    };
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const items = categoryItems[category] || categoryItems.fruits;
      const mainItem = items[Math.floor(Math.random() * items.length)];
      let oddItem = items[Math.floor(Math.random() * items.length)];
      while (oddItem === mainItem) oddItem = items[Math.floor(Math.random() * items.length)];

      const oddIndex = Math.floor(Math.random() * 4);
      const questionItems = [mainItem, mainItem, mainItem, mainItem];
      questionItems[oddIndex] = oddItem;

      questions.push({
        questionData: { items: questionItems, display: category },
        answerData: { correct: oddIndex, correctItem: oddItem }
      });
    }
    return questions;
  },

  matching: (config) => {
    const { pairCount = 4, questionCount = 5 } = config;
    // Placeholder - matching requires different UI
    return [];
  },

  memory_match: (config) => {
    const { gridSize = 4, questionCount = 5 } = config;
    // Placeholder - memory match requires different UI
    return [];
  },

  sequence_recall: (config) => {
    const { maxLength = 4, questionCount = 5 } = config;
    // Placeholder - sequence recall requires different UI
    return [];
  },

  number_to_quantity: (config) => {
    const { maxNumber = 5, questionCount = 5 } = config;
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      const targetNumber = Math.floor(Math.random() * maxNumber) + 1;
      // Generate options with different quantities
      const options = [];
      options.push({ value: targetNumber, count: targetNumber });

      // Add wrong options
      let attempts = 0;
      while (options.length < 3 && attempts < 20) {
        const wrongCount = Math.floor(Math.random() * maxNumber) + 1;
        if (!options.find(o => o.count === wrongCount)) {
          options.push({ value: wrongCount, count: wrongCount });
        }
        attempts++;
      }

      questions.push({
        questionData: { targetNumber },
        answerData: { correct: targetNumber, options: shuffleArray(options) }
      });
    }
    return questions;
  }
};

function generateNumberOptions(correct, max) {
  const options = [correct];
  while (options.length < 3) {
    const opt = Math.floor(Math.random() * max) + 1;
    if (!options.includes(opt)) options.push(opt);
  }
  return options.sort((a, b) => a - b);
}

function generateVisualOptions(correct, max) {
  const options = [{ value: correct, count: correct }];
  while (options.length < 3) {
    const opt = Math.floor(Math.random() * max) + 1;
    if (!options.find(o => o.value === opt)) {
      options.push({ value: opt, count: opt });
    }
  }
  return options.sort((a, b) => a.value - b.value);
}

function getLetterOptions(correct, pool) {
  const options = [correct];
  const available = pool.filter(l => l !== correct);
  while (options.length < 3 && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    options.push(available.splice(idx, 1)[0]);
  }
  return options.sort();
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

    // Build challenge list with info
    const challenges = [];
    for (const challenge of (game.challenges || [])) {
      const ctDoc = await db.collection('challengeTypes').doc(challenge.challengeTypeId).get();
      if (ctDoc.exists) {
        const ct = ctDoc.data();
        const catDoc = await db.collection('categories').doc(ct.categoryId).get();

        // Get progress for this challenge
        const progressSnap = await db.collection('progress')
          .where('assignmentId', '==', assignment.id)
          .where('challengeTypeId', '==', challenge.challengeTypeId)
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

        challenges.push({
          ...challenge,
          name: ct.name,
          description: ct.description,
          renderer: ct.renderer,
          categoryName: catDoc.exists ? catDoc.data().name : null,
          progress: { completed, correct }
        });
      }
    }

    res.json({
      assignmentId: assignment.id,
      kidName: kid.name,
      kidAvatar: kid.avatar,
      gameName: game.name,
      gameDescription: game.description,
      language: game.language || 'pt',
      challenges
    });
  } catch (err) {
    console.error('Get play data error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get questions for a challenge in the game
router.get('/:token/challenge/:challengeTypeId', async (req, res) => {
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

    // Verify challenge is in game
    const gameDoc = await db.collection('games').doc(assignment.gameId).get();
    if (!gameDoc.exists) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = gameDoc.data();
    const challengeConfig = (game.challenges || []).find(c => c.challengeTypeId === req.params.challengeTypeId);
    if (!challengeConfig) {
      return res.status(404).json({ error: 'Challenge not found in this game' });
    }

    // Get challenge type info
    const ctDoc = await db.collection('challengeTypes').doc(req.params.challengeTypeId).get();
    if (!ctDoc.exists) {
      return res.status(404).json({ error: 'Challenge type not found' });
    }
    const challengeType = ctDoc.data();

    // Generate questions based on config
    const generator = questionGenerators[challengeType.renderer];
    let generatedQuestions = [];
    if (generator) {
      generatedQuestions = generator(challengeConfig);
    }

    // Add question_type and index to each question
    const questions = generatedQuestions.map((q, index) => ({
      ...q,
      question_type: challengeType.renderer,
      index
    }));

    // Get category name
    const catDoc = await db.collection('categories').doc(challengeType.categoryId).get();

    res.json({
      challenge: {
        challengeTypeId: req.params.challengeTypeId,
        name: challengeType.name,
        renderer: challengeType.renderer,
        categoryName: catDoc.exists ? catDoc.data().name : null
      },
      questions,
      assignmentId: assignment.id
    });
  } catch (err) {
    console.error('Get challenge questions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit answer - stores detailed metrics
router.post('/:token/challenge/:challengeTypeId/question/:questionIndex/answer', async (req, res) => {
  try {
    const { answer, questionData, sessionId } = req.body;
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

    if (!questionData || !questionData.answerData) {
      return res.status(400).json({ error: 'Question data required' });
    }

    // Check answer
    const isCorrect = checkAnswer(answer, questionData.answerData);

    // Store each attempt as an individual record for detailed metrics
    await db.collection('attempts').add({
      assignmentId: assignment.id,
      kidId: assignment.kidId,
      gameId: assignment.gameId,
      challengeTypeId: req.params.challengeTypeId,
      questionIndex,
      sessionId: sessionId || null,
      answer,
      isCorrect,
      timestamp: new Date()
    });

    // Update aggregated progress
    const progressQuery = await db.collection('progress')
      .where('assignmentId', '==', assignment.id)
      .where('challengeTypeId', '==', req.params.challengeTypeId)
      .limit(1)
      .get();

    let progressData;

    if (progressQuery.empty) {
      progressData = {
        assignmentId: assignment.id,
        kidId: assignment.kidId,
        gameId: assignment.gameId,
        challengeTypeId: req.params.challengeTypeId,
        totalAttempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        challengeRepeats: 0,
        lastAttemptAt: new Date(),
        createdAt: new Date()
      };
      await db.collection('progress').add(progressData);
    } else {
      const progressRef = progressQuery.docs[0].ref;
      const existing = progressQuery.docs[0].data();
      progressData = {
        totalAttempts: (existing.totalAttempts || 0) + 1,
        correctAttempts: (existing.correctAttempts || 0) + (isCorrect ? 1 : 0),
        lastAttemptAt: new Date()
      };
      await progressRef.update(progressData);
    }

    res.json({
      isCorrect,
      correctAnswer: questionData.answerData.correct,
      progress: progressData
    });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record challenge repeat (called when a challenge needs to be repeated due to wrong answers)
router.post('/:token/challenge/:challengeTypeId/repeat', async (req, res) => {
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

    // Update challenge repeat count
    const progressQuery = await db.collection('progress')
      .where('assignmentId', '==', assignment.id)
      .where('challengeTypeId', '==', req.params.challengeTypeId)
      .limit(1)
      .get();

    if (!progressQuery.empty) {
      const progressRef = progressQuery.docs[0].ref;
      const existing = progressQuery.docs[0].data();
      await progressRef.update({
        challengeRepeats: (existing.challengeRepeats || 0) + 1
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Record repeat error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark game as completed
router.post('/:token/complete', async (req, res) => {
  try {
    const snapshot = await db.collection('assignments')
      .where('playToken', '==', req.params.token)
      .where('isActive', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Game not found or inactive' });
    }

    const assignmentRef = snapshot.docs[0].ref;
    await assignmentRef.update({
      completedAt: new Date(),
      isActive: false
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Complete game error:', err);
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
