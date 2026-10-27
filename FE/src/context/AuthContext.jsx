import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  // Auto-refresh user profile if fullName is missing (e.g. Google login before fix)
  useEffect(() => {
    if (token && user && !user.fullName) {
      axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        const updatedUser = { ...user, ...res.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }).catch(() => {
        // Silently fail - user can still use the app
      });
    }
  }, [token, user?.fullName]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const setRedirectPath = (path) => {
    setRedirectAfterLogin(path);
  };

  const clearRedirectPath = () => {
    setRedirectAfterLogin(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, redirectAfterLogin, setRedirectPath, clearRedirectPath }}>
      {children}
    </AuthContext.Provider>
  );
};