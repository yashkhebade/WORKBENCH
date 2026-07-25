import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { supabase, hasSupabaseConfig } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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
          try {
            const res = await api.get('/auth/me');
            setUser(res.data.user);
          } catch (err) {
            localStorage.removeItem('token');
            setToken(null);
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

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
