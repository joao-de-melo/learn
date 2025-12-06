const { db } = require('../config/firebase');

/*
 * Firestore Collections Structure:
 *
 * categories/{categoryId}
 *   - slug, name, description, icon, displayOrder
 *
 * challengeTypes/{challengeTypeId}
 *   - categoryId, slug, name, description, renderer, configSchema
 *
 * levels/{levelId}
 *   - challengeTypeId, slug, name, description, minAge, maxAge, difficulty, config
 *   - questions: [{questionData, answerData}]  (embedded array)
 *
 * accounts/{accountId}
 *   - email, passwordHash, name, createdAt
 *
 * kids/{kidId}
 *   - accountId, name, age, avatar, createdAt
 *
 * games/{gameId}
 *   - accountId, name, description, levelIds[], createdAt
 *
 * assignments/{assignmentId}
 *   - gameId, kidId, playToken, isActive, createdAt
 *
 * progress/{progressId}
 *   - assignmentId, levelId, questionIndex, isCorrect, attempts, completedAt
 */

// Helper functions
function generateCountingQuestions(iconType, maxNumber) {
  const questions = [];
  for (let i = 1; i <= maxNumber; i++) {
    questions.push({
      questionData: {
        text: `How many ${iconType}s do you see?`,
        icons: Array(i).fill(iconType)
      },
      answerData: {
        correct: i,
        options: generateNumberOptions(i, maxNumber)
      }
    });
  }
  return questions;
}

function generateAdditionQuestions(iconType, maxSum) {
  const questions = [];
  for (let a = 1; a <= Math.floor(maxSum / 2); a++) {
    for (let b = 1; b <= maxSum - a && a + b <= maxSum; b++) {
      questions.push({
        questionData: {
          text: 'How many in total?',
          left: Array(a).fill(iconType),
          right: Array(b).fill(iconType),
          operator: '+'
        },
        answerData: {
          correct: a + b,
          options: generateVisualOptions(a + b, maxSum, iconType)
        }
      });
    }
  }
  return questions;
}

function generateLetterQuestions(letters) {
  return letters.map(letter => ({
    questionData: {
      text: `Find the letter ${letter}`,
      target: letter
    },
    answerData: {
      correct: letter,
      options: getLetterOptions(letter, letters)
    }
  }));
}

function generatePatternQuestions(patternType, items) {
  const questions = [];
  for (let i = 0; i < items.length - 1; i++) {
    const a = items[i];
    const b = items[i + 1];
    // AB pattern
    questions.push({
      questionData: { text: 'What comes next?', pattern: [a, b, a, b, a], display: patternType },
      answerData: { correct: b, options: [a, b, items[(i + 2) % items.length]] }
    });
    // AAB pattern
    questions.push({
      questionData: { text: 'What comes next?', pattern: [a, a, b, a, a], display: patternType },
      answerData: { correct: b, options: [a, b, items[(i + 2) % items.length]] }
    });
  }
  return questions;
}

function generateOddOneOutQuestions(itemGroups) {
  return itemGroups.map(g => ({
    questionData: { text: 'Which one is different?', items: g.items, display: g.display },
    answerData: { correct: g.oddIndex, correctItem: g.items[g.oddIndex] }
  }));
}

function generateNumberOptions(correct, max) {
  const options = [correct];
  while (options.length < 3) {
    const opt = Math.floor(Math.random() * max) + 1;
    if (!options.includes(opt)) options.push(opt);
  }
  return options.sort((a, b) => a - b);
}

function generateVisualOptions(correct, max, iconType) {
  const options = [{ value: correct, icons: Array(correct).fill(iconType) }];
  while (options.length < 3) {
    const opt = Math.floor(Math.random() * max) + 1;
    if (!options.find(o => o.value === opt)) {
      options.push({ value: opt, icons: Array(opt).fill(iconType) });
    }
  }
  return options.sort((a, b) => a.value - b.value);
}

function getLetterOptions(correct, pool) {
  const options = [correct];
  const available = pool.filter(l => l !== correct);
  while (options.length < 3 && available.length > 0) {
    options.push(available.splice(Math.floor(Math.random() * available.length), 1)[0]);
  }
  return options.sort();
}

async function seed() {
  console.log('Seeding Firestore...');

  // ============ CATEGORIES ============
  console.log('Seeding categories...');
  const categories = {
    math: { slug: 'math', name: 'Math', description: 'Numbers, counting, and basic operations', icon: 'calculator', displayOrder: 1 },
    language: { slug: 'language', name: 'Language', description: 'Letters, words, and reading', icon: 'book', displayOrder: 2 },
    logic: { slug: 'logic', name: 'Logic', description: 'Patterns, sequences, and problem solving', icon: 'puzzle', displayOrder: 3 },
    focus: { slug: 'focus', name: 'Focus', description: 'Memory, attention, and concentration', icon: 'target', displayOrder: 4 }
  };

  const categoryIds = {};
  for (const [key, cat] of Object.entries(categories)) {
    const ref = db.collection('categories').doc(key);
    await ref.set(cat);
    categoryIds[key] = ref.id;
    console.log(`  - Category: ${cat.name}`);
  }

  // ============ CHALLENGE TYPES ============
  console.log('Seeding challenge types...');
  const challengeTypes = [
    // Math
    { id: 'counting', categoryId: 'math', slug: 'counting', name: 'Counting', description: 'Count objects and select the correct number', renderer: 'counting', configSchema: { iconType: 'string', maxNumber: 'number' } },
    { id: 'visual_addition', categoryId: 'math', slug: 'visual_addition', name: 'Visual Addition', description: 'Add objects visually', renderer: 'visual_addition', configSchema: { iconType: 'string', maxSum: 'number' } },
    { id: 'visual_subtraction', categoryId: 'math', slug: 'visual_subtraction', name: 'Visual Subtraction', description: 'Subtract objects visually', renderer: 'visual_subtraction', configSchema: { iconType: 'string', maxNumber: 'number' } },
    // Language
    { id: 'letter_recognition', categoryId: 'language', slug: 'letter_recognition', name: 'Letter Recognition', description: 'Identify letters', renderer: 'letter_recognition', configSchema: { letters: 'array' } },
    { id: 'word_recognition', categoryId: 'language', slug: 'word_recognition', name: 'Word Recognition', description: 'Match words with pictures', renderer: 'word_recognition', configSchema: { words: 'array' } },
    // Logic
    { id: 'pattern', categoryId: 'logic', slug: 'pattern', name: 'Pattern Completion', description: 'Complete the pattern', renderer: 'pattern', configSchema: { patternType: 'string' } },
    { id: 'odd_one_out', categoryId: 'logic', slug: 'odd_one_out', name: 'Odd One Out', description: 'Find the different item', renderer: 'odd_one_out', configSchema: { itemCount: 'number' } },
    { id: 'matching', categoryId: 'logic', slug: 'matching', name: 'Matching', description: 'Match related items', renderer: 'matching', configSchema: { pairCount: 'number' } },
    // Focus
    { id: 'memory_match', categoryId: 'focus', slug: 'memory_match', name: 'Memory Match', description: 'Remember and match pairs', renderer: 'memory_match', configSchema: { gridSize: 'number' } },
    { id: 'sequence_recall', categoryId: 'focus', slug: 'sequence_recall', name: 'Sequence Recall', description: 'Remember and repeat a sequence', renderer: 'sequence_recall', configSchema: { sequenceLength: 'number' } },
  ];

  for (const ct of challengeTypes) {
    const { id, ...data } = ct;
    await db.collection('challengeTypes').doc(id).set(data);
    console.log(`  - Challenge Type: ${ct.name}`);
  }

  // ============ LEVELS ============
  console.log('Seeding levels...');

  const levels = [
    // Counting levels
    { id: 'counting-1-3-stars', challengeTypeId: 'counting', slug: 'counting-1-3-stars', name: 'Counting 1-3 (Stars)', minAge: 3, maxAge: 5, difficulty: 1, config: { iconType: 'star', maxNumber: 3 }, questions: generateCountingQuestions('star', 3) },
    { id: 'counting-1-3-bears', challengeTypeId: 'counting', slug: 'counting-1-3-bears', name: 'Counting 1-3 (Bears)', minAge: 3, maxAge: 5, difficulty: 1, config: { iconType: 'bear', maxNumber: 3 }, questions: generateCountingQuestions('bear', 3) },
    { id: 'counting-1-3-robots', challengeTypeId: 'counting', slug: 'counting-1-3-robots', name: 'Counting 1-3 (Robots)', minAge: 3, maxAge: 5, difficulty: 1, config: { iconType: 'robot', maxNumber: 3 }, questions: generateCountingQuestions('robot', 3) },
    { id: 'counting-1-5-hearts', challengeTypeId: 'counting', slug: 'counting-1-5-hearts', name: 'Counting 1-5 (Hearts)', minAge: 4, maxAge: 6, difficulty: 2, config: { iconType: 'heart', maxNumber: 5 }, questions: generateCountingQuestions('heart', 5) },
    { id: 'counting-1-5-flowers', challengeTypeId: 'counting', slug: 'counting-1-5-flowers', name: 'Counting 1-5 (Flowers)', minAge: 4, maxAge: 6, difficulty: 2, config: { iconType: 'flower', maxNumber: 5 }, questions: generateCountingQuestions('flower', 5) },
    { id: 'counting-1-10-apples', challengeTypeId: 'counting', slug: 'counting-1-10-apples', name: 'Counting 1-10 (Apples)', minAge: 5, maxAge: 7, difficulty: 3, config: { iconType: 'apple', maxNumber: 10 }, questions: generateCountingQuestions('apple', 10) },

    // Addition levels
    { id: 'addition-1-3-robots', challengeTypeId: 'visual_addition', slug: 'addition-1-3-robots', name: 'Addition 1-3 (Robots)', minAge: 3, maxAge: 5, difficulty: 1, config: { iconType: 'robot', maxSum: 3 }, questions: generateAdditionQuestions('robot', 3) },
    { id: 'addition-1-3-stars', challengeTypeId: 'visual_addition', slug: 'addition-1-3-stars', name: 'Addition 1-3 (Stars)', minAge: 3, maxAge: 5, difficulty: 1, config: { iconType: 'star', maxSum: 3 }, questions: generateAdditionQuestions('star', 3) },
    { id: 'addition-1-5-bears', challengeTypeId: 'visual_addition', slug: 'addition-1-5-bears', name: 'Addition 1-5 (Bears)', minAge: 4, maxAge: 6, difficulty: 2, config: { iconType: 'bear', maxSum: 5 }, questions: generateAdditionQuestions('bear', 5) },
    { id: 'addition-1-5-hearts', challengeTypeId: 'visual_addition', slug: 'addition-1-5-hearts', name: 'Addition 1-5 (Hearts)', minAge: 4, maxAge: 6, difficulty: 2, config: { iconType: 'heart', maxSum: 5 }, questions: generateAdditionQuestions('heart', 5) },
    { id: 'addition-1-10-flowers', challengeTypeId: 'visual_addition', slug: 'addition-1-10-flowers', name: 'Addition to 10 (Flowers)', minAge: 5, maxAge: 7, difficulty: 3, config: { iconType: 'flower', maxSum: 10 }, questions: generateAdditionQuestions('flower', 10) },

    // Letter levels
    { id: 'letters-a-e', challengeTypeId: 'letter_recognition', slug: 'letters-a-e', name: 'Letters A-E', minAge: 3, maxAge: 5, difficulty: 1, config: { letters: ['A','B','C','D','E'] }, questions: generateLetterQuestions(['A','B','C','D','E']) },
    { id: 'letters-f-j', challengeTypeId: 'letter_recognition', slug: 'letters-f-j', name: 'Letters F-J', minAge: 3, maxAge: 5, difficulty: 1, config: { letters: ['F','G','H','I','J'] }, questions: generateLetterQuestions(['F','G','H','I','J']) },
    { id: 'letters-k-o', challengeTypeId: 'letter_recognition', slug: 'letters-k-o', name: 'Letters K-O', minAge: 4, maxAge: 6, difficulty: 1, config: { letters: ['K','L','M','N','O'] }, questions: generateLetterQuestions(['K','L','M','N','O']) },
    { id: 'letters-p-t', challengeTypeId: 'letter_recognition', slug: 'letters-p-t', name: 'Letters P-T', minAge: 4, maxAge: 6, difficulty: 1, config: { letters: ['P','Q','R','S','T'] }, questions: generateLetterQuestions(['P','Q','R','S','T']) },
    { id: 'letters-u-z', challengeTypeId: 'letter_recognition', slug: 'letters-u-z', name: 'Letters U-Z', minAge: 4, maxAge: 6, difficulty: 1, config: { letters: ['U','V','W','X','Y','Z'] }, questions: generateLetterQuestions(['U','V','W','X','Y','Z']) },

    // Pattern levels
    { id: 'pattern-colors', challengeTypeId: 'pattern', slug: 'pattern-colors', name: 'Color Patterns', minAge: 4, maxAge: 6, difficulty: 1, config: { patternType: 'colors' }, questions: generatePatternQuestions('colors', ['red', 'blue', 'green', 'yellow']) },
    { id: 'pattern-shapes', challengeTypeId: 'pattern', slug: 'pattern-shapes', name: 'Shape Patterns', minAge: 4, maxAge: 6, difficulty: 2, config: { patternType: 'shapes' }, questions: generatePatternQuestions('shapes', ['circle', 'square', 'triangle']) },

    // Odd one out levels
    { id: 'odd-one-out-fruits', challengeTypeId: 'odd_one_out', slug: 'odd-one-out-fruits', name: 'Odd One Out (Fruits)', minAge: 3, maxAge: 5, difficulty: 1, config: { itemCount: 4 }, questions: generateOddOneOutQuestions([
      { items: ['apple', 'apple', 'banana', 'apple'], oddIndex: 2, display: 'fruits' },
      { items: ['banana', 'apple', 'banana', 'banana'], oddIndex: 1, display: 'fruits' },
    ]) },
    { id: 'odd-one-out-animals', challengeTypeId: 'odd_one_out', slug: 'odd-one-out-animals', name: 'Odd One Out (Animals)', minAge: 3, maxAge: 5, difficulty: 1, config: { itemCount: 4 }, questions: generateOddOneOutQuestions([
      { items: ['cat', 'dog', 'cat', 'cat'], oddIndex: 1, display: 'animals' },
      { items: ['bear', 'bear', 'robot', 'bear'], oddIndex: 2, display: 'animals' },
    ]) },
  ];

  for (const level of levels) {
    const { id, ...data } = level;
    await db.collection('levels').doc(id).set({
      ...data,
      questionCount: data.questions.length,
      createdAt: new Date()
    });
    console.log(`  - Level: ${level.name} (${level.questions.length} questions)`);
  }

  console.log('\nSeeding completed!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
