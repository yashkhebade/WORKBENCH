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
      let loggedIn = false;

      if (hasSupabaseConfig()) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser({ id: session.user.id, email: session.user.email, name: session.user.email.split('@')[0], role: 'Member' });
          setToken(session.access_token);
          localStorage.setItem('token', session.access_token);
          loggedIn = true;
        }
      } 
      
      // Fallback to legacy local token if no Supabase session was found (or if Supabase isn't configured)
      if (!loggedIn) {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          
          // Show server-waking UI immediately for better UX
          setWakingServer(true);

          let retries = 12; // ~60 seconds total - Render cold starts can take up to 50s
          let delay = 5000;
          
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
      }
      
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    if (hasSupabaseConfig()) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser({ id: data.user.id, email: data.user.email, name: data.user.email.split('@')[0], role: 'Member' });
      setToken(data.session.access_token);
      localStorage.setItem('token', data.session.access_token);
      return;
    }
    
    // Legacy flow
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
    if (hasSupabaseConfig()) {
      await supabase.auth.signOut();
    }
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
