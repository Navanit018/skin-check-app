import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
};

export const assessmentAPI = {
  analyze: (answers: Record<string, string>) =>
    api.post('/assessment/analyze', { answers }),
  getHistory: (params?: { page?: number; limit?: number }) =>
    api.get('/assessment/history', { params }),
  getAssessment: (id: string) => api.get(`/assessment/${id}`),
  deleteAssessment: (id: string) => api.delete(`/assessment/${id}`),
};

export const productsAPI = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    skinType?: string;
    category?: string;
    priceRange?: string;
    concerns?: string;
  }) => api.get('/products', { params }),
  searchProducts: (query: string, params?: Record<string, string | number>) =>
    api.get('/products/search', { params: { q: query, ...params } }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  getByCategory: (category: string) => api.get(`/products/category/${category}`),
  getRecommendations: (assessmentId: string) =>
    api.get(`/products/recommendations/${assessmentId}`),
};

export const routinesAPI = {
  createRoutine: (data: {
    name: string;
    description?: string;
    assessmentId?: string;
  }) => api.post('/routine', data),
  getUserRoutines: () => api.get('/routine'),
  getRoutine: (id: string) => api.get(`/routine/${id}`),
  updateRoutine: (id: string, data: Record<string, unknown>) =>
    api.put(`/routine/${id}`, data),
  deleteRoutine: (id: string) => api.delete(`/routine/${id}`),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/profile', data),
  uploadPhoto: (formData: FormData) =>
    api.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
