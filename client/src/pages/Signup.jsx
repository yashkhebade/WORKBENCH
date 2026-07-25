import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Cpu, Lock, Mail, ArrowRight, UserPlus, Loader2 } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signup, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await signup(email, password);
      setSuccess('Registration successful! Please check your email to verify your account.');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative Orbs */}
      <div className="animate-float" style={{ position: 'absolute', top: '15%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />
      <div className="animate-float" style={{ position: 'absolute', bottom: '15%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0, animationDelay: '2s' }} />

      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '3rem', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 25px rgba(16,185,129,0.4)' }}>
          <UserPlus size={32} color="white" />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Create Account
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', textAlign: 'center' }}>
          Join the hardware workspace.<br/>(Powered by Supabase)
        </p>
        
        {error && (
          <div className="animate-shake" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ width: '100%', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', transition: 'all 0.2s' }}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', transition: 'all 0.2s' }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.9rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
            disabled={isLoading || success}
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Registering...</> : 'Sign Up'} 
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
