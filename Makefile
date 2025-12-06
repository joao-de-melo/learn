.PHONY: start stop emulators seed backend frontend install clean deploy

# Start everything with Firebase emulators (local development)
start: install
	@echo "Starting Firebase emulators and seeding data..."
	@$(MAKE) emulators-bg
	@sleep 8
	@$(MAKE) seed
	@echo "Starting frontend..."
	@cd frontend && REACT_APP_API_URL=http://localhost:5001/learn-dev/us-central1/api npm start

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
	@cd backend && FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=learn-dev npm run seed

# Start backend only (standalone, for local dev without functions)
backend:
	cd backend && FIRESTORE_EMULATOR_HOST=localhost:8080 FIREBASE_PROJECT_ID=learn-dev npm start

# Start frontend only
frontend:
	cd frontend && REACT_APP_API_URL=http://localhost:5001/learn-dev/us-central1/api npm start

# Stop all services
stop:
	@echo "Stopping services..."
	@pkill -f "firebase" || true
	@pkill -f "java.*firestore" || true
	@pkill -f "node.*backend" || true
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

# Clean node_modules
clean:
	rm -rf backend/node_modules functions/node_modules frontend/node_modules

# Set JWT secret for production
set-jwt-secret:
	@read -p "Enter JWT secret: " secret; \
	firebase functions:config:set jwt.secret="$$secret"

# View Firebase Functions logs
logs:
	firebase functions:log
