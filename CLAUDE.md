# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Educational game platform for children. Educators create game assignments with various challenge types (math, language, logic, focus), assign them to kids via shareable links, and track progress. Built with React frontend, Firebase Cloud Functions backend, and Firestore database.

## Development Commands

```bash
# Start full local development environment (emulators + frontend + seed data)
make start

# Install all dependencies (backend, functions, frontend)
make install

# Start Firebase emulators only (foreground)
make emulators

# Seed local Firestore database (requires emulators running)
make seed

# Deploy to production
make deploy              # Functions + Hosting
make deploy-functions    # Cloud Functions only
make deploy-hosting      # Frontend hosting only
make deploy-all          # Everything + seed production
```

## Local Development URLs

- Frontend: http://localhost:3000
- API (Cloud Functions): http://localhost:5001
- Firebase Emulator UI: http://localhost:4000
- Firestore Emulator: http://localhost:8080
- Auth Emulator: http://localhost:9099

## Architecture

### Three-Part Structure

1. **`frontend/`** - React SPA with react-router-dom
   - Uses Firebase Auth SDK directly for authentication
   - Communicates with backend via `/api/**` endpoints
   - Contains challenge renderers in `src/challenges/`

2. **`functions/`** - Firebase Cloud Functions (Express app)
   - Single export `api` handles all `/api/**` routes
   - Routes: `/api/kids`, `/api/levels`, `/api/games`, `/api/assignments`, `/api/play`
   - Question generation logic lives in `routes/play.js`

3. **`backend/`** - Local development utilities only
   - Database seeding scripts (`src/seeds/seed.js`)
   - Not deployed to production

### Firestore Collections

- `categories` - Challenge categories (math, language, logic, focus)
- `challengeTypes` - Individual challenge type definitions
- `accounts` - Educator accounts (managed by Firebase Auth)
- `kids` - Children profiles linked to accounts
- `games` - Game configurations with challenge lists
- `assignments` - Links between games and kids (contains play tokens)
- `progress` - Individual answer records

### Challenge System

Challenges are organized by category in `frontend/src/challenges/{category}/`:

```
challenges/
├── BaseChallenge.js    # Common functionality (help overlay, feedback, voice)
├── index.js            # Registry and ChallengeRenderer component
├── math/               # CountingChallenge, VisualAddition, etc.
├── language/           # LetterRecognitionChallenge, etc.
├── logic/              # PatternChallenge, OddOneOutChallenge
└── focus/              # Memory challenges (placeholder)
```

**Adding a new challenge type:**
1. Create component in appropriate category folder, extending `BaseChallenge`
2. Export `generatePreview()` function for preview mode
3. Register in category's `index.js` and add to `previewGenerators`
4. Add question generator in `functions/routes/play.js`
5. Add config schema in `frontend/src/pages/CreateGame.js` under `CHALLENGE_CONFIGS`
6. Add translations in `frontend/src/i18n/translations.js` (pt and en)

See `frontend/src/challenges/README.md` for complete documentation.

### Key Frontend Patterns

- **AuthContext** (`contexts/AuthContext.js`) - Firebase Auth state management
- **LanguageProvider** (`i18n/`) - i18n with Portuguese (default) and English
- **Play route** (`/play/:token`) - Public route, no auth required (shareable links)
- Uses `REACT_APP_USE_EMULATORS=true` for local development

### API Structure

All API routes are prefixed with `/api/` and served by the `api` Cloud Function:
- Firebase Hosting rewrites `/api/**` to the function
- Auth is handled client-side; functions receive authenticated requests
