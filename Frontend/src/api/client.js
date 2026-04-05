// Vite proxy forwards /api to http://localhost:5000 — no CORS issues
const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 5000?');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.message || data.error || (data.errors && data.errors[0]?.msg) || `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const authApi = {
  register: (username, email, password) =>
    api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),
  login: (email, password) =>
    api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const userApi = {
  getMe: () => api('/user/me'),
  updateMe: (body) => api('/user/me', { method: 'PUT', body: JSON.stringify(body) }),
  getProfile: (username) => api(`/user/profile/${username}`),
  search: (query) => api(`/user/search?q=${query}`),
  follow: (id) => api(`/user/${id}/follow`, { method: 'POST' }),
  unfollow: (id) => api(`/user/${id}/unfollow`, { method: 'POST' }),
};

export const movieApi = {
  search: (query, page = 1) => api(`/movies/search?query=${query}&page=${page}`),
  trending: () => api('/movies/trending'),
  getMovie: (id) => api(`/movies/${id}`),
};

export const reviewApi = {
  create: (movieId, rating, reviewText) => api('/reviews', { method: 'POST', body: JSON.stringify({ movieId, rating, reviewText }) }),
  getForMovie: (movieId) => api(`/reviews/movie/${movieId}`),
  getForUser: (userId) => api(`/reviews/user/${userId}`),
  delete: (id) => api(`/reviews/${id}`, { method: 'DELETE' }),
  like: (id) => api(`/reviews/${id}/like`, { method: 'POST' }),
  addComment: (id, text) => api(`/reviews/${id}/comment`, { method: 'POST', body: JSON.stringify({ text }) }),
  deleteComment: (id, commentId) => api(`/reviews/${id}/comment/${commentId}`, { method: 'DELETE' }),
};

export const watchlistApi = {
  get: () => api('/watchlist'),
  add: (movieId, status) => api('/watchlist', { method: 'POST', body: JSON.stringify({ movieId, status }) }),
  updateStatus: (movieId) => api(`/watchlist/${movieId}`, { method: 'PUT' }),
  remove: (movieId) => api(`/watchlist/${movieId}`, { method: 'DELETE' }),
  getStatus: (movieId) => api(`/watchlist/status/${movieId}`),
};

export const listApi = {
  getMyLists: () => api('/lists/me/all'),
  getUserLists: (userId) => api(`/lists/user/${userId}`),
  get: (id) => api(`/lists/${id}`),
  create: (name, description, isPublic) => api('/lists', { method: 'POST', body: JSON.stringify({ name, description, isPublic }) }),
  update: (id, data) => api(`/lists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => api(`/lists/${id}`, { method: 'DELETE' }),
  addMovie: (id, movieId) => api(`/lists/${id}/movies`, { method: 'POST', body: JSON.stringify({ movieId }) }),
  removeMovie: (id, movieId) => api(`/lists/${id}/movies/${movieId}`, { method: 'DELETE' }),
};

export const activityApi = {
  getFeed: (page = 1) => api(`/activity/feed?page=${page}`),
  getUserActivity: (userId) => api(`/activity/user/${userId}`),
};
