.PHONY: start stop emulators seed frontend install clean deploy help

# Show available commands
help:
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "  make start          Start everything (emulators + frontend)"
	@echo "  make stop           Stop all services"
	@echo "  make frontend       Start frontend only (with emulators flag)"
	@echo "  make emulators      Start Firebase emulators (foreground)"
	@echo "  make seed           Seed local Firestore database"
	@echo "  make seed-prod      Seed production Firestore database"
	@echo "  make install        Install all dependencies"
	@echo "  make clean          Remove all node_modules"
	@echo ""
	@echo "  make deploy         Deploy functions + hosting"
	@echo "  make deploy-all     Deploy everything + seed production"
	@echo "  make deploy-functions  Deploy Cloud Functions only"
	@echo "  make deploy-hosting    Deploy Hosting only"
	@echo "  make deploy-rules      Deploy Firestore rules/indexes"
	@echo "  make logs           View Firebase Functions logs"
	@echo ""

# Start everything with Firebase emulators (local development)
start: install
	@echo "Starting Firebase emulators..."
	@$(MAKE) emulators-bg
	@sleep 8
	@$(MAKE) seed
	@echo "Starting frontend in background..."
	@cd frontend && REACT_APP_USE_EMULATORS=true npm start > /tmp/frontend.log 2>&1 &
	@sleep 5
	@clear
	@echo ""
	@echo "=========================================="
	@echo "  Stack is ready!"
	@echo "=========================================="
	@echo ""
	@echo "  Frontend:        http://localhost:3000"
	@echo "  Backend (API):   http://localhost:5001"
	@echo ""
	@echo "  Emulator UI:     http://localhost:4000"
	@echo "  Auth Emulator:   http://localhost:9099"
	@echo "  Firestore:       http://localhost:8080"
	@echo "  Hosting:         http://localhost:5000"
	@echo ""
	@echo "  Frontend logs:   /tmp/frontend.log"
	@echo "  Emulator logs:   /tmp/firebase-emulators.log"
	@echo ""
	@echo "  Stop all:        make stop"
	@echo "=========================================="
	@echo ""
	@tail -f /tmp/frontend.log

# Start Firebase emulators in background
emulators-bg:
	@firebase emulators:start > /tmp/firebase-emulators.log 2>&1 &

# Start Firebase emulators (foreground, shows UI at localhost:4000)
emulators:
	firebase emulators:start

# Install all dependencies
install:
	@echo "Installing backend dependencies..."
	@cd backend && npm install
	@echo "Installing functions dependencies..."
	@cd functions && npm install
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install

# Seed the database (requires emulators to be running)
seed:
	@echo "Seeding Firestore..."
	@cd backend && NODE_ENV=local npm run seed

seed-prod:
	@echo "Seeding production Firestore..."
	@cd backend && NODE_ENV=production npm run seed

# Start frontend only
frontend:
	cd frontend && REACT_APP_USE_EMULATORS=true npm start

# Stop all services
stop:
	@echo "Stopping services..."
	@pkill -f "firebase" || true
	@pkill -f "java" || true
	@pkill -f "react-scripts" || true
	@echo "All services stopped"

# Deploy to Firebase
deploy: deploy-functions deploy-hosting

deploy-functions:
	@echo "Deploying Cloud Functions..."
	firebase deploy --only functions

deploy-hosting:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Deploying to Firebase Hosting..."
	firebase deploy --only hosting

deploy-rules:
	@echo "Deploying Firestore rules and indexes..."
	firebase deploy --only firestore

deploy-all:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Deploying everything..."
	firebase deploy --force
	@echo "Seeding production database..."
	@$(MAKE) seed-prod

# Clean node_modules
clean:
	rm -rf backend/node_modules functions/node_modules frontend/node_modules

# View Firebase Functions logs
logs:
	firebase functions:log
