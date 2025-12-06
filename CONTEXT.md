# Educational Game Platform - Context Document

## Overview

This platform allows parents/guardians to create educational games for their children. The system supports multiple children per account, with customizable games containing age-appropriate learning challenges.

## Technology Stack

- **Database**: Firestore (Firebase)
- **Backend**: Express.js with firebase-admin SDK
- **Frontend**: React
- **Development**: Docker Compose with Firestore Emulator

## Domain Model

### Account
- Represents a login/user account (parent/guardian)
- Can have multiple kids associated with it
- Can create and manage multiple games

### Kid
- Belongs to an Account
- Has basic profile information (name, age, avatar)
- Can be assigned to games, creating playable links
- Progress is tracked per kid per game

### Game
- Created by an Account (exists independently)
- A collection of levels selected by the admin/parent
- Can be assigned to one or more kids
- **Assignment creates a unique play link (playToken)**

### Category
- Groups related challenge types (Math, Language, Logic, Focus)
- Has displayOrder for sorting
- Examples: Math, Language, Logic, Focus

### Challenge Type
- Defines HOW a challenge works (the renderer/behavior)
- Belongs to a Category
- Examples: counting, visual_addition, letter_recognition, pattern

### Level
- Pre-defined in the database (seeded on stack startup)
- Uses a Challenge Type (defines how questions are rendered)
- Has an age range (e.g., 3-5 years old)
- Has a difficulty rating
- Contains multiple questions (embedded array)
- Can be previewed by admin when building a game

### Question
- Embedded in Level document (not a separate collection)
- Contains questionData (what to display) and answerData (correct answer + options)
- Rendered by the challenge type's renderer

### Assignment
- Links a Game to a Kid
- Creates a unique `playToken` (UUID)
- The play link is: `/play/{playToken}`
- Tracks active/inactive status

### Progress
- Tracks a kid's progress on a specific question
- Links to Assignment, Level, and questionIndex
- Tracks attempts, isCorrect, completedAt

## Firestore Collections

```
categories/{categoryId}
  - slug: string
  - name: string
  - description: string
  - icon: string
  - displayOrder: number

challengeTypes/{challengeTypeId}
  - categoryId: string
  - slug: string
  - name: string
  - description: string
  - renderer: string (maps to frontend component)
  - configSchema: object

levels/{levelId}
  - challengeTypeId: string
  - slug: string
  - name: string
  - description: string (optional)
  - minAge: number
  - maxAge: number
  - difficulty: number (1-5)
  - config: object (challenge-type specific)
  - questions: array of {questionData, answerData}
  - questionCount: number
  - createdAt: timestamp

accounts/{accountId}
  - email: string
  - passwordHash: string
  - name: string (optional)
  - createdAt: timestamp

kids/{kidId}
  - accountId: string
  - name: string
  - age: number
  - avatar: string
  - createdAt: timestamp

games/{gameId}
  - accountId: string
  - name: string
  - description: string (optional)
  - levelIds: array of strings
  - createdAt: timestamp
  - updatedAt: timestamp

assignments/{assignmentId}
  - gameId: string
  - kidId: string
  - playToken: string (UUID)
  - isActive: boolean
  - createdAt: timestamp
  - updatedAt: timestamp

progress/{progressId}
  - assignmentId: string
  - levelId: string
  - questionIndex: number
  - isCompleted: boolean
  - isCorrect: boolean
  - attempts: number
  - completedAt: timestamp
  - createdAt: timestamp
```

## Data Relationships

```
Account (1) ──────< (N) Kid
Account (1) ──────< (N) Game
Game (N) >────────< (N) Level       [via levelIds array in Game]
Level (N) >──────── (1) ChallengeType
ChallengeType (N) >─ (1) Category
Kid (N) >─────────< (N) Game        [via Assignment - creates playToken]
Assignment (1) ────< (N) Progress
```

## Getting Started

### Using Docker Compose (Recommended)

```bash
cd /home/jmelo/jonny/learn
docker-compose up --build
```

This will:
1. Start Firestore Emulator on port 8080
2. Seed categories, challenge types, and levels
3. Start the backend API on http://localhost:3001
4. Start the frontend on http://localhost:3000

### Manual Setup

1. Start Firestore Emulator:
```bash
gcloud emulators firestore start --host-port=localhost:8080
```

2. Backend:
```bash
cd backend
npm install
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_PROJECT_ID=learn-dev
npm run seed      # Seeds initial data
npm start         # Starts on port 3001
```

3. Frontend:
```bash
cd frontend
npm install
npm start         # Starts on port 3000
```

### Production Setup

For production, set one of:
- `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`
- `FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}` (JSON string)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current account

### Kids (requires auth)
- `GET /api/kids` - List kids
- `POST /api/kids` - Create kid
- `PUT /api/kids/:id` - Update kid
- `DELETE /api/kids/:id` - Delete kid

### Levels (public)
- `GET /api/levels/categories` - Get all categories with challenge types
- `GET /api/levels` - List all levels (with optional filters)
- `GET /api/levels/by-category` - Get levels grouped by category and challenge type
- `GET /api/levels/:id` - Get level with questions
- `GET /api/levels/:id/preview` - Get level preview (sample questions)

### Games (requires auth)
- `GET /api/games` - List games
- `POST /api/games` - Create game with levels
- `GET /api/games/:id` - Get game details with levels and assignments
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game (and related assignments)
- `POST /api/games/:id/levels` - Add level to game
- `DELETE /api/games/:id/levels/:levelId` - Remove level from game

### Assignments (requires auth)
- `POST /api/assignments` - Assign game to kid (creates playToken)
- `GET /api/assignments/game/:gameId` - Get assignments for game
- `GET /api/assignments/kid/:kidId` - Get assignments for kid
- `DELETE /api/assignments/:id` - Remove assignment

### Play (public - no auth)
- `GET /api/play/:token` - Get game data for play
- `GET /api/play/:token/level/:levelId` - Get level questions
- `POST /api/play/:token/level/:levelId/question/:questionIndex/answer` - Submit answer

## User Flows

### Admin/Parent Flow
1. Register/Login to account
2. Add kids (name, age, avatar)
3. Create a new game:
   - See ALL available levels grouped by category
   - Preview any level before adding
   - Select levels to include
4. View game details
5. Assign game to kid(s) - generates unique play link
6. Share play link with kid

### Kid Play Flow
1. Access play link: `/play/{token}`
2. See list of levels in the game
3. Select a level to play
4. Complete questions one by one
5. Receive instant feedback (correct/incorrect)
6. Progress is automatically saved

## Seeded Content

### Categories
- **Math** - Numbers, counting, and basic operations
- **Language** - Letters, words, and reading
- **Logic** - Patterns, sequences, and problem solving
- **Focus** - Memory, attention, and concentration

### Challenge Types
| Category | Type | Renderer | Description |
|----------|------|----------|-------------|
| Math | counting | counting | Count objects and select the number |
| Math | visual_addition | visual_addition | Add objects visually |
| Math | visual_subtraction | visual_subtraction | Subtract objects visually |
| Language | letter_recognition | letter_recognition | Identify letters |
| Language | word_recognition | word_recognition | Match words with pictures |
| Logic | pattern | pattern | Complete the pattern |
| Logic | odd_one_out | odd_one_out | Find the different item |
| Logic | matching | matching | Match related items |
| Focus | memory_match | memory_match | Remember and match pairs |
| Focus | sequence_recall | sequence_recall | Remember and repeat sequences |

### Sample Levels
- Counting 1-3 (Stars, Bears, Robots) - ages 3-5
- Counting 1-5 (Hearts, Flowers) - ages 4-6
- Counting 1-10 (Apples) - ages 5-7
- Addition 1-3, 1-5, to 10 - various ages
- Letters A-E, F-J, K-O, P-T, U-Z - ages 3-6
- Color Patterns, Shape Patterns - ages 4-6
- Odd One Out (Fruits, Animals) - ages 3-5

## Question Data Formats

### counting
```json
{
  "questionData": {
    "text": "How many stars do you see?",
    "icons": ["star", "star", "star"]
  },
  "answerData": {
    "correct": 3,
    "options": [1, 2, 3]
  }
}
```

### visual_addition
```json
{
  "questionData": {
    "text": "How many in total?",
    "left": ["robot", "robot"],
    "right": ["robot"],
    "operator": "+"
  },
  "answerData": {
    "correct": 3,
    "options": [
      {"value": 2, "icons": ["robot", "robot"]},
      {"value": 3, "icons": ["robot", "robot", "robot"]},
      {"value": 4, "icons": ["robot", "robot", "robot", "robot"]}
    ]
  }
}
```

### letter_recognition
```json
{
  "questionData": {
    "text": "Find the letter A",
    "target": "A"
  },
  "answerData": {
    "correct": "A",
    "options": ["A", "B", "C"]
  }
}
```

### pattern
```json
{
  "questionData": {
    "text": "What comes next?",
    "pattern": ["red", "blue", "red", "blue", "red"],
    "display": "colors"
  },
  "answerData": {
    "correct": "blue",
    "options": ["red", "blue", "green"]
  }
}
```

### odd_one_out
```json
{
  "questionData": {
    "text": "Which one is different?",
    "items": ["apple", "apple", "banana", "apple"],
    "display": "fruits"
  },
  "answerData": {
    "correct": 2,
    "correctItem": "banana"
  }
}
```

## Icon Types Available
- star, bear, robot, heart, flower, car, apple, fish
- circle, square, triangle (shapes)
- red, blue, green, yellow (colors)
- cat, dog, banana (misc)

---

## Adding New Challenge Types (Scalable Architecture)

Challenges are **organized by category** for massive scalability. Each category has its own folder.

### Frontend Structure

```
frontend/src/challenges/
├── index.js              # Main registry (merges all categories)
├── BaseChallenge.js      # Shared logic (answer handling, feedback)
├── math/                 # Math category
│   ├── index.js          # Exports all math challenges
│   ├── CountingChallenge.js
│   └── VisualAdditionChallenge.js
├── language/             # Language category
│   ├── index.js
│   └── LetterRecognitionChallenge.js
├── logic/                # Logic category
│   ├── index.js
│   ├── PatternChallenge.js
│   └── OddOneOutChallenge.js
└── focus/                # Focus/attention category
    └── index.js
```

### How to Add a New Challenge Type

**Step 1: Add to database seeds**

Edit `backend/src/seeds/seed.js`:

```javascript
// Add challenge type
{ id: 'subtraction', categoryId: 'math', slug: 'subtraction', name: 'Visual Subtraction',
  description: 'Subtract objects visually', renderer: 'subtraction',
  configSchema: { iconType: 'string', maxNumber: 'number' } },

// Add levels
{ id: 'subtraction-1-3-stars', challengeTypeId: 'subtraction', slug: 'subtraction-1-3-stars',
  name: 'Subtraction 1-3 (Stars)', minAge: 4, maxAge: 6, difficulty: 1,
  config: { iconType: 'star', maxNumber: 3 },
  questions: generateSubtractionQuestions('star', 3) },
```

**Step 2: Create the challenge component**

Create `frontend/src/challenges/math/SubtractionChallenge.js`:

```javascript
import React from 'react';
import BaseChallenge, { OptionButton } from '../BaseChallenge';
import { IconDisplay } from '../../components/IconDisplay';

export const challengeType = 'subtraction';

function SubtractionRenderer({ challenge, selectedAnswer, result, isDisabled, onSelect, correctAnswer, isPreview }) {
  const { questionData, answerData } = challenge;

  return (
    <>
      <h2>{questionData.text}</h2>
      {/* Your visual display here */}
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

export default function SubtractionChallenge({ challenge, onAnswer, isPreview }) {
  return (
    <BaseChallenge challenge={challenge} onAnswer={onAnswer} isPreview={isPreview}>
      {(props) => <SubtractionRenderer {...props} />}
    </BaseChallenge>
  );
}
```

**Step 3: Export from the category's index.js**

Edit `frontend/src/challenges/math/index.js`:

```javascript
import CountingChallenge from './CountingChallenge';
import VisualAdditionChallenge from './VisualAdditionChallenge';
import SubtractionChallenge from './SubtractionChallenge';  // Add this

export default {
  counting: CountingChallenge,
  visual_addition: VisualAdditionChallenge,
  subtraction: SubtractionChallenge,  // Add this
};
```

That's it! The new challenge type will automatically:
- Work in the Play page
- Work in the Level Preview modal
- Handle answer submission and feedback
- Track progress

### Adding a New Category

To add an entirely new category (e.g., "music"):

1. Add to seed data in `backend/src/seeds/seed.js`
2. Create the folder: `frontend/src/challenges/music/`
3. Create `frontend/src/challenges/music/index.js`:
   ```javascript
   import RhythmChallenge from './RhythmChallenge';
   export default { rhythm: RhythmChallenge };
   ```
4. Import in `frontend/src/challenges/index.js`:
   ```javascript
   import musicChallenges from './music';
   const CHALLENGE_TYPES = { ...mathChallenges, ...musicChallenges, /* ... */ };
   ```

### BaseChallenge Props

The `BaseChallenge` wrapper provides these props to your renderer:

| Prop | Type | Description |
|------|------|-------------|
| `challenge` | object | Full challenge data from API |
| `selectedAnswer` | any | Currently selected answer (null if none) |
| `result` | object | API response after submission (null before) |
| `isDisabled` | boolean | True if buttons should be disabled |
| `onSelect` | function | Call with answer value to submit |
| `correctAnswer` | any | The correct answer from answerData |
| `isPreview` | boolean | True when shown in preview mode |

### OptionButton Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | any | The answer value this button represents |
| `isSelected` | boolean | If this option was selected |
| `isCorrect` | boolean | If this is the correct answer |
| `showResult` | boolean | If result styling should be shown |
| `isDisabled` | boolean | If button should be disabled |
| `onClick` | function | Click handler (pass `onSelect`) |
| `className` | string | Additional CSS classes (e.g., "visual") |
