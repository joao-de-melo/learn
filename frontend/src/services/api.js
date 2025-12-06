const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
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

  // Auth
  async register(email, password, name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  logout() {
    this.setToken(null);
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

  async getPlayLevel(token, levelId) {
    return this.request(`/play/${token}/level/${levelId}`);
  }

  async submitAnswer(token, levelId, questionIndex, answer) {
    return this.request(`/play/${token}/level/${levelId}/question/${questionIndex}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }
}

const api = new ApiService();
export default api;
