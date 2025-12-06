FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Wait for Firestore emulator and run seed
CMD sh -c "sleep 5 && npm run seed && npm start"
