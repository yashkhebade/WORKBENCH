import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wakingServer, setWakingServer] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        setWakingServer(true);

        try {
          const res = await Promise.race([
            api.get('/auth/me'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 7000))
          ]);
          setUser(res.data);
        } catch (err) {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('token');
            setToken(null);
          } else {
            console.warn('Backend reachability timeout or error during initAuth:', err);
          }
        } finally {
          setWakingServer(false);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    // Always use the custom backend JWT auth — accounts live in our PostgreSQL DB.
    // Supabase is only used for email verification during signup.
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const signup = async (name, email, password) => {
    // Always register through the custom backend (PostgreSQL).
    // This creates the account AND returns a JWT token so the user is logged in immediately.
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // We no longer block rendering here so that the app shell can render immediately.
  // We'll let ProtectedRoute handle the loading state using skeletons.

  return (
    <AuthContext.Provider value={{ user, token, loading, wakingServer, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
