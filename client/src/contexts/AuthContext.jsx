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
          
          let retries = 5;
          let delay = 2000;
          
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
                // Network error, 502, 503, or timeout (Server is asleep/waking up)
                setWakingServer(true);
                retries -= 1;
                if (retries === 0) {
                  setWakingServer(false);
                  // We don't remove the token, just stop trying so they can manually refresh later
                } else {
                  await new Promise(r => setTimeout(r, delay));
                  delay += 2000; // Exponential-ish backoff
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
      const { data, error } = await supabase.auth.signUp({ email, password });
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-foreground">
          {wakingServer ? 'Waking up the server...' : 'Loading workspace...'}
        </h2>
        {wakingServer && (
          <p className="text-muted-foreground mt-2 text-center max-w-sm">
            The free Render server went to sleep. It usually takes 30-50 seconds to wake up. Hang tight!
          </p>
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
