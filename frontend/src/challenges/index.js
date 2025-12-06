// Challenge Types Registry
// Challenges are organized by category for better scalability
//
// Structure:
//   challenges/
//   ├── math/           - Counting, addition, subtraction, etc.
//   ├── language/       - Letters, words, reading, etc.
//   ├── logic/          - Patterns, sequences, puzzles, etc.
//   ├── focus/          - Memory, attention, concentration, etc.
//   └── index.js        - This file (registry)
//
// To add a new challenge type:
//   1. Create the component in the appropriate category folder
//   2. Export it from that category's index.js
//   That's it!

import React from 'react';

// Import all categories
import mathChallenges from './math';
import languageChallenges from './language';
import logicChallenges from './logic';
import focusChallenges from './focus';

// Merge all challenge types into one registry
const CHALLENGE_TYPES = {
  ...mathChallenges,
  ...languageChallenges,
  ...logicChallenges,
  ...focusChallenges,
};

// Main renderer component - automatically picks the right challenge type
export default function ChallengeRenderer({ challenge, onAnswer, onComplete, isPreview = false, language = 'pt' }) {
  const ChallengeComponent = CHALLENGE_TYPES[challenge.question_type];

  if (!ChallengeComponent) {
    return (
      <div className="challenge-display">
        <h2>Unknown Challenge Type</h2>
        <p>Challenge type "{challenge.question_type}" is not implemented yet.</p>
      </div>
    );
  }

  return (
    <ChallengeComponent
      challenge={challenge}
      onAnswer={onAnswer}
      onComplete={onComplete}
      isPreview={isPreview}
      language={language}
    />
  );
}

// Export list of supported types
export const supportedChallengeTypes = Object.keys(CHALLENGE_TYPES);

// Export categories for reference
export const categories = {
  math: Object.keys(mathChallenges),
  language: Object.keys(languageChallenges),
  logic: Object.keys(logicChallenges),
  focus: Object.keys(focusChallenges),
};
