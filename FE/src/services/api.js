import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 session expired - auto logout and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      console.log('🔴 Session Expired:', errorData?.message);

      // Save current location for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);

      // Clear stored auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      // Emit event for React to handle logout + redirect
      window.dispatchEvent(new CustomEvent('sessionExpired', {
        detail: { message: errorData?.message || 'Session expired' }
      }));
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
};

// Perfume APIs
export const perfumeAPI = {
  getAllPerfumes: (params) => api.get('/api/perfumes', { params }),
  getPerfumeById: (id) => api.get(`/api/perfumes/${id}`),
  getAllBrands: () => api.get('/api/brands'),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  changePassword: (data) => api.put('/api/users/change-password', data),
  getCollectors: () => api.get('/api/users/collectors'),
};

// Feedback APIs
export const feedbackAPI = {
  getFeedbacks: () => api.get('/api/feedback'),
  createFeedback: (data) => api.post('/api/feedback', data),
  getPerfumeFeedbacks: (perfumeId) => api.get(`/api/feedback/perfume/${perfumeId}`),
  updateFeedback: (feedbackId, data) => api.put(`/api/feedback/${feedbackId}`, data),
  deleteFeedback: (feedbackId) => api.delete(`/api/feedback/${feedbackId}`),
};

export default api;
