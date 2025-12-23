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
 * accounts/{accountId}
 *   - email, passwordHash, name, createdAt
 *
 * kids/{kidId}
 *   - accountId, name, birthYear, avatar, createdAt
 *
 * games/{gameId}
 *   - accountId, name, description, challenges[], createdAt
 *
 * assignments/{assignmentId}
 *   - gameId, kidId, playToken, isActive, createdAt
 *
 * progress/{progressId}
 *   - assignmentId, challengeTypeId, questionIndex, isCorrect, attempts, completedAt
 */

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
    { id: 'number_to_quantity', categoryId: 'math', slug: 'number_to_quantity', name: 'Number to Quantity', description: 'Match a number to the correct quantity of objects', renderer: 'number_to_quantity', configSchema: { iconType: 'string', maxNumber: 'number' } },
    { id: 'voice_to_quantity', categoryId: 'math', slug: 'voice_to_quantity', name: 'Voice to Quantity', description: 'Listen to a number and select the correct quantity of objects', renderer: 'voice_to_quantity', configSchema: { maxNumber: 'number' } },
    { id: 'voice_to_number', categoryId: 'math', slug: 'voice_to_number', name: 'Voice to Number', description: 'Listen to a number and select the correct digit', renderer: 'voice_to_number', configSchema: { maxNumber: 'number' } },
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
    { id: 'icon_search', categoryId: 'focus', slug: 'icon_search', name: 'Icon Search', description: 'Find icons hidden in a grid', renderer: 'icon_search', configSchema: { gridSize: 'number', targetCount: 'number' } },
  ];

  for (const ct of challengeTypes) {
    const { id, ...data } = ct;
    await db.collection('challengeTypes').doc(id).set(data);
    console.log(`  - Challenge Type: ${ct.name}`);
  }

  console.log('\nSeeding completed!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
