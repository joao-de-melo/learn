import { auth } from '../config/firebase';

// Local: Use hosting emulator which rewrites /api/** to functions emulator
// Production: Use relative path (same origin, Firebase Hosting rewrites to functions)
const useEmulators = process.env.REACT_APP_USE_EMULATORS === 'true';
const API_URL = useEmulators ? 'http://127.0.0.1:5001/learn-made-fun/europe-west2/api/api' : '/api';

class ApiService {
  async getToken() {
    if (auth.currentUser) {
      return auth.currentUser.getIdToken();
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = await this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Kids
  async getKids() {
    return this.request('/kids');
  }

  async createKid(data) {
    return this.request('/kids', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKid(id, data) {
    return this.request(`/kids/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKid(id) {
    return this.request(`/kids/${id}`, {
      method: 'DELETE',
    });
  }

  // Levels
  async getCategories() {
    return this.request('/levels/categories');
  }

  async getLevels(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/levels?${params}`);
  }

  async getLevelsByCategory() {
    return this.request('/levels/by-category');
  }

  async getLevelPreview(id) {
    return this.request(`/levels/${id}/preview`);
  }

  async getLevel(id) {
    return this.request(`/levels/${id}`);
  }

  // Games
  async getGames() {
    return this.request('/games');
  }

  async getGame(id) {
    return this.request(`/games/${id}`);
  }

  async createGame(data) {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGame(id, data) {
    return this.request(`/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGame(id) {
    return this.request(`/games/${id}`, {
      method: 'DELETE',
    });
  }

  async addLevelToGame(gameId, levelId) {
    return this.request(`/games/${gameId}/levels`, {
      method: 'POST',
      body: JSON.stringify({ levelId }),
    });
  }

  async removeLevelFromGame(gameId, levelId) {
    return this.request(`/games/${gameId}/levels/${levelId}`, {
      method: 'DELETE',
    });
  }

  // Assignments
  async createAssignment(gameId, kidId) {
    return this.request('/assignments', {
      method: 'POST',
      body: JSON.stringify({ gameId, kidId }),
    });
  }

  async getGameAssignments(gameId) {
    return this.request(`/assignments/game/${gameId}`);
  }

  async getKidAssignments(kidId) {
    return this.request(`/assignments/kid/${kidId}`);
  }

  async deleteAssignment(id) {
    return this.request(`/assignments/${id}`, {
      method: 'DELETE',
    });
  }

  // Play (no auth required)
  async getPlayData(token) {
    return this.request(`/play/${token}`);
  }

  async getPlayChallenge(token, challengeTypeId) {
    return this.request(`/play/${token}/challenge/${challengeTypeId}`);
  }

  async submitAnswer(token, challengeTypeId, questionIndex, answer, questionData, sessionId) {
    return this.request(`/play/${token}/challenge/${challengeTypeId}/question/${questionIndex}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer, questionData, sessionId }),
    });
  }

  async recordChallengeRepeat(token, challengeTypeId) {
    return this.request(`/play/${token}/challenge/${challengeTypeId}/repeat`, {
      method: 'POST',
    });
  }

  async completeGame(token) {
    return this.request(`/play/${token}/complete`, {
      method: 'POST',
    });
  }

  // Kid metrics
  async getKidMetrics(kidId) {
    return this.request(`/kids/${kidId}/metrics`);
  }
}

const api = new ApiService();
export default api;
