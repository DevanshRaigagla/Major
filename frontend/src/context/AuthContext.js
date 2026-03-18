import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token age on load — discard if older than 2 days
  const getStoredToken = () => {
    const t = localStorage.getItem('uptime_token');
    const savedAt = localStorage.getItem('uptime_token_saved_at');
    if (!t || !savedAt) return null;
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    if (Date.now() - parseInt(savedAt, 10) > TWO_DAYS_MS) {
      localStorage.removeItem('uptime_token');
      localStorage.removeItem('uptime_token_saved_at');
      localStorage.removeItem('uptime_user');
      return null;
    }
    return t;
  };

  const [token, setToken] = useState(getStoredToken);

  // Apply token to axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('uptime_token', token);
      localStorage.setItem('uptime_token_saved_at', Date.now().toString());
      const storedUser = localStorage.getItem('uptime_user');
      if (storedUser) setUser({ user_email: storedUser });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('uptime_token');
      localStorage.removeItem('uptime_token_saved_at');
      localStorage.removeItem('uptime_user');
    }
    setLoading(false);
  }, [token]);

  const login = async (user_email, password) => {
    const res = await axios.post('http://localhost:4000/api/auth/login', { user_email, password });
    setToken(res.data.token);
    setUser({ user_email: res.data.user_email });
    localStorage.setItem('uptime_user', res.data.user_email);
  };

  const register = async (user_email, password) => {
    const res = await axios.post('http://localhost:4000/api/auth/register', { user_email, password });
    setToken(res.data.token);
    setUser({ user_email: res.data.user_email });
    localStorage.setItem('uptime_user', res.data.user_email);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;