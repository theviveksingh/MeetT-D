const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const api = {
  async signup(email, password, displayName) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, displayName })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async getMe() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async updateProfile(data) {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result;
  },

  async getRoomHistory() {
    const response = await fetch(`${API_URL}/auth/room-history`, {
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async getRandomChallenge(type, category, excludeIds) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    if (excludeIds) params.append('excludeIds', excludeIds.join(','));

    const response = await fetch(`${API_URL}/challenges/random?${params}`, {
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async createCustomChallenge(text, type, category) {
    const response = await fetch(`${API_URL}/challenges/custom`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, type, category })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async getCustomChallenges() {
    const response = await fetch(`${API_URL}/challenges/custom`, {
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async updateCustomChallenge(challengeId, data) {
    const response = await fetch(`${API_URL}/challenges/custom/${challengeId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result;
  },

  async deleteCustomChallenge(challengeId) {
    const response = await fetch(`${API_URL}/challenges/custom/${challengeId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  }
};
