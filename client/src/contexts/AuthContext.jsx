import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { supabase, hasSupabaseConfig } from '../services/supabase';

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
    // Sign out from Supabase if it was used for signup
    try { if (hasSupabaseConfig()) await supabase.auth.signOut(); } catch(e) {}
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading || wakingServer) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">
              {wakingServer ? '⏳ Server is waking up...' : 'Loading workspace...'}
            </h2>
            {wakingServer && (
              <p className="text-gray-400 mt-2 text-sm max-w-sm">
                The Render free server went to sleep. It takes <strong className="text-white">30–60 seconds</strong> to boot. Please wait — do not refresh.
              </p>
            )}
          </div>
        </div>
        {wakingServer && (
          <div className="w-64 bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-1/3" />
          </div>
        )}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
