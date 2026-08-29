const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const authHeaders = () => {
  const token = localStorage.getItem('fin-dash-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const authApi = {
  async signup(data) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Signup failed');
    return result;
  },

  async login(credentials) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Login failed');
    return result;
  },

  async googleAuth(credential) {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Google authentication failed');
    return result;
  },

  async getMe() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to fetch profile');
    return result;
  },

  async completeOnboarding() {
    const response = await fetch(`${API_URL}/auth/onboarding`, {
      method: 'POST',
      headers: authHeaders(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to complete onboarding');
    return result;
  }
};
