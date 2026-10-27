import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

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
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    console.log('[API] Token:', token ? 'Present ✓' : 'Missing ✗');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Authorization header added');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      console.log('🔴 Authentication Error:', errorData?.message);
      
      // Save current location for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
      
      // Clear user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      // Emit custom event for React to handle
      window.dispatchEvent(new CustomEvent('sessionExpired', { 
        detail: { message: errorData?.message || 'Session expired' } 
      }));
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (token) => api.post('/auth/google', { token }),
  post: (url, data) => api.post(url, data)
};

// Perfume APIs
export const perfumeAPI = {
  getAllPerfumes: (params) => api.get('/perfumes', { params }),
  getPerfumeById: (id) => api.get(`/perfumes/${id}`),
  createPerfume: (data, token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post('/perfumes', data, config);
  },
  updatePerfume: (id, data, token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.put(`/perfumes/${id}`, data, config);
  },
  deletePerfume: (id, token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.delete(`/perfumes/${id}`, config);
  },
  addComment: (id, commentData) => api.post(`/perfumes/${id}/comments`, commentData),
  getAllBrands: (token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.get('/brands', config);
  },
};

// Brand APIs
export const brandAPI = {
  getAllBrands: (token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.get('/brands', config);
  },
  getBrandById: (id, token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.get(`/brands/${id}`, config);
  },
  createBrand: (data, token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.post('/brands', data, config);
  },
  updateBrand: (id, data, token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.put(`/brands/${id}`, data, config);
  },
  deleteBrand: (id, token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return api.delete(`/brands/${id}`, config);
  },
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  getCollectors: () => api.get('/users/collectors'),
  createCollector: (data) => api.post('/users/collectors', data),
  deactivateCollector: (id) => api.patch(`/users/${id}/deactivate`),
};

// Feedback APIs
export const feedbackAPI = {
  getFeedbacks: () => api.get('/feedback'),
  createFeedback: (data) => api.post('/feedback', data),
};
export default api;
