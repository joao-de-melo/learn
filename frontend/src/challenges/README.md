# Adding New Challenges

This guide explains how to add a new challenge type to the educational game platform.

## Challenge Architecture

Each challenge consists of:

1. **Frontend Component** - React component that renders the challenge UI
2. **Backend Generator** - Function that generates questions for the challenge
3. **Translations** - Text in Portuguese and English for UI and voice instructions
4. **Configuration** - Fields that educators can customize when creating games

## Step-by-Step Guide

### 1. Create the Frontend Challenge Component

Create a new file in the appropriate category folder:
- `challenges/math/` - For math challenges (counting, addition, etc.)
- `challenges/language/` - For language challenges (letters, words, etc.)
- `challenges/logic/` - For logic challenges (patterns, sequences, etc.)
- `challenges/focus/` - For memory/focus challenges

**Example: `challenges/math/MyNewChallenge.js`**

```javascript
import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';

// Export the challenge type ID - must match backend generator
export const challengeType = 'my_new_challenge';

// Renderer component - receives props from BaseChallenge
function MyNewChallengeRenderer({
  challenge,           // The question data from backend
  selectedAnswer,      // Currently selected answer (null or value)
  result,              // Result after submission ({ isCorrect, feedback })
  isDisabled,          // Whether input is disabled
  onSelect,            // Function to call when user selects an answer
  correctAnswer,       // The correct answer value
  isPreview,           // Whether in preview mode
  t                    // Translation function
}) {
  const { questionData, answerData } = challenge;

  return (
    <>
      {/* Question prompt */}
      <h2>{t('myNewChallengeQuestion')}</h2>

      {/* Visual display area */}
      <div className="visual-display">
        {/* Your challenge visuals here */}
      </div>

      {/* Answer options */}
      <div className="answer-options">
        {answerData.options.map((opt, i) => (
          <OptionButton
            key={i}
            value={opt}
            isSelected={selectedAnswer === opt}
            isCorrect={opt === correctAnswer}
            showResult={result !== null || isPreview}
            isDisabled={isDisabled}
            onClick={onSelect}
          >
            {opt}
          </OptionButton>
        ))}
      </div>
    </>
  );
}

// Generate sample questions for preview (no backend needed)
// REQUIRED: Every challenge must implement this function
export function generatePreview() {
  const samples = [
    { targetValue: 5, correct: 5, options: [3, 4, 5, 6] },
    { targetValue: 3, correct: 3, options: [1, 2, 3, 4] },
  ];

  return samples.map(({ targetValue, correct, options }) => ({
    question_type: challengeType,
    questionData: { targetValue },
    answerData: { correct, options },
  }));
}

// Main challenge component - wraps renderer with BaseChallenge
export default function MyNewChallenge({
  challenge,
  onAnswer,
  onComplete,
  isPreview,
  language,
  voiceEnabled = false,
  showHelpOnStart = false,
  challengeName
}) {
  return (
    <BaseChallenge
      challenge={challenge}
      onAnswer={onAnswer}
      onComplete={onComplete}
      isPreview={isPreview}
      language={language}
      voiceEnabled={voiceEnabled}
      showHelpOnStart={showHelpOnStart}
      challengeTypeId={challengeType}
      challengeName={challengeName}
    >
      {(props) => <MyNewChallengeRenderer {...props} />}
    </BaseChallenge>
  );
}
```

### 2. Register the Challenge

Add your challenge to the category's `index.js`:

**Example: `challenges/math/index.js`**

```javascript
import CountingChallenge, { generatePreview as countingPreview } from './CountingChallenge';
import MyNewChallenge, { generatePreview as myNewChallengePreview } from './MyNewChallenge';

export default {
  counting: CountingChallenge,
  my_new_challenge: MyNewChallenge,
};

// REQUIRED: Export preview generators for all challenges
export const previewGenerators = {
  counting: countingPreview,
  my_new_challenge: myNewChallengePreview,
};
```

### 3. Add Backend Question Generator

Add a generator function in `functions/routes/play.js`:

```javascript
// Add to questionGenerators object
my_new_challenge: (config) => {
  // Generate question data based on config
  const targetValue = Math.floor(Math.random() * config.maxValue) + 1;

  // Generate answer options
  const options = generateOptions(targetValue, 5);

  return {
    questionData: {
      // Data needed to display the question
      targetValue,
    },
    answerData: {
      correct: targetValue,
      options,
    },
  };
},
```

### 4. Add Challenge Configuration

In `frontend/src/pages/CreateGame.js`, add the challenge config:

```javascript
// In CHALLENGE_CONFIGS object
my_new_challenge: {
  maxValue: { type: 'number', default: 10, min: 1, max: 100, label: 'maximumValue' },
  questionCount: { type: 'number', default: 5, min: 1, max: 20, label: 'questionCount' },
},
```

### 5. Add Translations

In `frontend/src/i18n/translations.js`, add translations for both `pt` and `en`:

```javascript
// Portuguese (pt)
{
  // Challenge name and description
  challenge_my_new_challenge: 'Meu Novo Desafio',
  challenge_my_new_challenge_desc: 'Descrição do desafio',

  // Question text
  myNewChallengeQuestion: 'Qual é a resposta?',

  // Voice prompt (short, spoken at challenge start)
  voice_my_new_challenge: 'Vamos fazer o novo desafio!',

  // Help instruction (detailed, shown and spoken on help page)
  help_my_new_challenge: 'Olha para o ecrã e escolhe a resposta certa!',

  // Config labels
  maximumValue: 'Valor máximo',
}

// English (en)
{
  challenge_my_new_challenge: 'My New Challenge',
  challenge_my_new_challenge_desc: 'Challenge description',
  myNewChallengeQuestion: 'What is the answer?',
  voice_my_new_challenge: "Let's do the new challenge!",
  help_my_new_challenge: 'Look at the screen and choose the right answer!',
  maximumValue: 'Maximum value',
}
```

### 6. Add Challenge Icon (Optional)

In `frontend/src/challenges/BaseChallenge.js`, add an icon for the help page:

```javascript
const CHALLENGE_ICONS = {
  // ... existing icons
  my_new_challenge: '🎲',  // Choose an appropriate emoji
};
```

## Challenge Preview System (REQUIRED)

**Every challenge MUST implement a `generatePreview()` function.** This function generates sample questions that can be displayed without needing backend data or database levels.

### Why Previews Are Required

Previews allow educators to see what a challenge looks like before adding it to a game. Without a preview function, users will see "Preview not available for this challenge" when they try to preview the challenge type.

### How to Implement Preview

Add this function to your challenge file:

```javascript
// Generate sample questions for preview (no backend needed)
// REQUIRED: Every challenge must implement this function
export function generatePreview() {
  // Create 2 sample questions that showcase the challenge
  const samples = [
    { /* sample 1 data */ },
    { /* sample 2 data */ },
  ];

  return samples.map(sample => ({
    question_type: challengeType,  // Use the exported challengeType constant
    questionData: { /* question display data */ },
    answerData: { correct: /* correct answer */, options: [/* answer options */] },
  }));
}
```

### Preview Requirements

1. Return an array of 2 sample questions
2. Each question must have the same structure as backend-generated questions
3. Use representative examples that showcase the challenge
4. Export the function alongside your default component

### Registering Preview in Category Index

When adding your challenge to the category's `index.js`, also register the preview generator:

```javascript
import MyChallenge, { generatePreview as myChallengePreview } from './MyChallenge';

export default {
  my_challenge: MyChallenge,
};

export const previewGenerators = {
  my_challenge: myChallengePreview,
};
```

## Voice-Over Help System

When `voiceEnabled` is true for a game, each challenge will:

1. **Display a help page** before the first question
2. **Speak the help instruction** using text-to-speech
3. **Show a "Start" button** for the child to proceed

The help page uses these translation keys:
- `help_{challengeTypeId}` - Detailed instruction (spoken and displayed)
- Falls back to `voice_{challengeTypeId}` if help key doesn't exist
- Falls back to `challenge_{challengeTypeId}_desc` for display if neither exists

### Writing Good Help Instructions

Help instructions should:
- Be written for children (simple, friendly language)
- Explain what they will see on screen
- Tell them what action to take
- Be short enough to speak clearly (1-2 sentences)

**Good example:**
> "Look at the screen and count how many objects you see. Then tap on the right number!"

**Bad example:**
> "This challenge tests your counting abilities by presenting visual representations of quantities which you must enumerate and match to the corresponding numeral."

## BaseChallenge Props

The `BaseChallenge` component handles common functionality:

| Prop | Type | Description |
|------|------|-------------|
| `challenge` | object | Question data from backend |
| `onAnswer` | function | Called when user submits answer |
| `onComplete` | function | Called after feedback is shown |
| `isPreview` | boolean | Whether in preview mode (no submission) |
| `language` | string | Language code ('pt' or 'en') |
| `voiceEnabled` | boolean | Whether voice-over is enabled |
| `showHelpOnStart` | boolean | Whether to show help page first |
| `challengeTypeId` | string | Challenge type identifier |
| `challengeName` | string | Display name of challenge |

## OptionButton Props

The `OptionButton` component is a helper for answer buttons:

| Prop | Type | Description |
|------|------|-------------|
| `value` | any | The answer value |
| `isSelected` | boolean | Whether this option is selected |
| `isCorrect` | boolean | Whether this is the correct answer |
| `showResult` | boolean | Whether to show correct/incorrect styling |
| `isDisabled` | boolean | Whether button is disabled |
| `onClick` | function | Click handler |
| `className` | string | Additional CSS classes |

## File Structure

```
frontend/src/challenges/
├── BaseChallenge.js       # Base component with help, feedback, etc.
├── index.js               # Challenge registry and renderer
├── README.md              # This documentation
├── math/
│   ├── index.js           # Math challenges registry
│   ├── CountingChallenge.js
│   ├── VisualAdditionChallenge.js
│   ├── VisualSubtractionChallenge.js
│   ├── NumberToQuantityChallenge.js
│   ├── VoiceToQuantityChallenge.js
│   └── VoiceToNumberChallenge.js
├── language/
│   ├── index.js
│   └── LetterRecognitionChallenge.js
├── logic/
│   ├── index.js
│   ├── PatternChallenge.js
│   └── OddOneOutChallenge.js
└── focus/
    └── index.js           # Placeholder for memory challenges
```

## Available Challenge Types

### Math Challenges

| Challenge Type | ID | Description |
|---------------|-----|-------------|
| Counting | `counting` | Count objects and select the correct number |
| Visual Addition | `visual_addition` | Add two groups of objects together |
| Visual Subtraction | `visual_subtraction` | Subtract objects from a group |
| Number to Quantity | `number_to_quantity` | See a number, select matching quantity |
| Voice to Quantity | `voice_to_quantity` | Hear a number + object name (e.g., "3 stars"), select the group with that quantity |
| Voice to Number | `voice_to_number` | Hear a number, select the correct digit |

### Language Challenges

| Challenge Type | ID | Description |
|---------------|-----|-------------|
| Letter Recognition | `letter_recognition` | Identify and match letters |
| Word Recognition | `word_recognition` | Match words with pictures |

### Logic Challenges

| Challenge Type | ID | Description |
|---------------|-----|-------------|
| Pattern | `pattern` | Complete the pattern sequence |
| Odd One Out | `odd_one_out` | Find the element that is different |
| Matching | `matching` | Connect matching pairs |

### Focus Challenges

| Challenge Type | ID | Description |
|---------------|-----|-------------|
| Memory Match | `memory_match` | Remember and find matching pairs |
| Sequence Recall | `sequence_recall` | Repeat a sequence in order |

## Voice Challenges

Voice-based challenges (like `voice_to_quantity` and `voice_to_number`) have special requirements:

### Auto-play Voice
The challenge voice is played automatically after the help overlay is dismissed. This is handled by the challenge component itself (not BaseChallenge).

### Replay Button
Voice challenges include a "Play Again" button so children can hear the prompt again.

### Translation Keys for Voice Challenges
For challenges like `voice_to_quantity` that speak object names, you need icon translations:

```javascript
// In translations.js - singular and plural forms
voiceIcon_star: 'star',
voiceIcon_star_plural: 'stars',
voiceIcon_bear: 'bear',
voiceIcon_bear_plural: 'bears',
// ... etc for each icon used
```

### Important: Voice Timing
The challenge voice should only play AFTER the help overlay is dismissed. Check `isDisabled` prop - when it's `false`, the help overlay has been dismissed and you can play the challenge voice.

## Testing Your Challenge

1. Start the development server: `npm start`
2. Create a game with your new challenge type
3. Test with voice-over enabled and disabled
4. Test in both Portuguese and English
5. Verify preview mode works correctly
6. Test on mobile devices for responsive design
