import axios from 'axios';
import { clean } from '../utils/helpers';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthCall = err.config?.url?.includes('/api/auth/');
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (e) => {
  const d = e?.response?.data;
  if (d?.fields) return Object.values(d.fields).join('. ');
  return d?.message || (e?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?' : e?.message) || 'Something went wrong';
};

export const fileUrl = (u) => (u ? (u.startsWith('http') ? u : API_URL + u) : null);

export const authApi = {
  login: (data) => api.post('/api/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/api/auth/register', data).then((r) => r.data),
  me: () => api.get('/api/users/me').then((r) => r.data),
};

export const usersApi = {
  list: () => api.get('/api/users').then((r) => r.data),
  setRole: (id, role) => api.patch(`/api/users/${id}/role`, { role }).then((r) => r.data),
};

export const projectsApi = {
  list: () => api.get('/api/projects').then((r) => r.data),
  get: (id) => api.get(`/api/projects/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/projects', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/projects/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/projects/${id}`),
  addMember: (id, userId) => api.post(`/api/projects/${id}/members/${userId}`).then((r) => r.data),
  removeMember: (id, userId) => api.delete(`/api/projects/${id}/members/${userId}`).then((r) => r.data),
};

export const ticketsApi = {
  search: (params) => api.get('/api/tickets', { params: clean(params) }).then((r) => r.data),
  get: (id) => api.get(`/api/tickets/${id}`).then((r) => r.data),
  create: (data) => api.post('/api/tickets', data).then((r) => r.data),
  update: (id, data) => api.put(`/api/tickets/${id}`, data).then((r) => r.data),
  setStatus: (id, status) => api.patch(`/api/tickets/${id}/status`, { status }).then((r) => r.data),
  assign: (id, assigneeId) => api.patch(`/api/tickets/${id}/assign`, { assigneeId }).then((r) => r.data),
  remove: (id) => api.delete(`/api/tickets/${id}`),
  upload: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/api/tickets/${id}/attachment`, fd).then((r) => r.data);
  },
  removeAttachment: (id) => api.delete(`/api/tickets/${id}/attachment`).then((r) => r.data),
};

export const commentsApi = {
  list: (ticketId) => api.get(`/api/tickets/${ticketId}/comments`).then((r) => r.data),
  add: (ticketId, content) => api.post(`/api/tickets/${ticketId}/comments`, { content }).then((r) => r.data),
  remove: (id) => api.delete(`/api/comments/${id}`),
};

export default api;
