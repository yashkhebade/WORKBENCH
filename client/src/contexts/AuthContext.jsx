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
      // Always use the custom backend JWT auth.
      // Supabase is only used for email verification during signup, not for sessions.
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        
        // Show server-waking UI immediately for better UX
        setWakingServer(true);

        let retries = 12;
        let delay = 3000; // 3s between retries = ~36s total
        
        while (retries > 0) {
          try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            setWakingServer(false);
            break; // Success!
          } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              // Invalid or expired token
              localStorage.removeItem('token');
              setToken(null);
              setWakingServer(false);
              break;
            } else {
              // Network error, 502, 503, or timeout (Server is asleep/waking up on Render free tier)
              retries -= 1;
              if (retries === 0) {
                setWakingServer(false);
                // Don't remove the token - let the user manually retry
              } else {
                await new Promise(r => setTimeout(r, delay));
              }
            }
          }
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

  const signup = async (email, password) => {
    if (hasSupabaseConfig()) {
      // Pass the production site URL so verification emails redirect to the live app,
      // not localhost. window.location.origin works for both Vercel and local dev.
      const redirectTo = `${window.location.origin}/login`;
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      return data;
    }
    throw new Error('Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
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
