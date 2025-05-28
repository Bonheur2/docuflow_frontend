import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || ''); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 

  const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, 
  });

  useEffect(() => {
    if (token) {
      api.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      });
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/details');
      setUser(response.data); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { username, password });
      setToken(response.data.token); 
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', username);
      await fetchUser(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/users', userData);
      if (response.status === 200) {
        await login(userData.username, userData.password); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    signup,
    fetchUser,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};