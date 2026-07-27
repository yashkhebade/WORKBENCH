import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader2, Key } from 'lucide-react';
import api from '../services/api';

function Field({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div className="relative group">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400 transition-colors z-10" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        autoComplete="email"
        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onFocus={e => {
          e.target.style.border = '1px solid rgba(139,92,246,0.6)';
          e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)';
          e.target.style.background = 'rgba(139,92,246,0.08)';
        }}
        onBlur={e => {
          e.target.style.border = '1px solid rgba(255,255,255,0.1)';
          e.target.style.boxShadow = 'none';
          e.target.style.background = 'rgba(255,255,255,0.05)';
        }}
      />
    </div>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDemoCode('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.demo_code) {
        setDemoCode(res.data.demo_code);
      }
      // Keep them here for a few seconds to see the message/code before redirecting to reset
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0b0b12', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-full max-w-md p-8 relative" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
        
        <Link to="/login" className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm font-medium mb-8">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
          <Key className="text-violet-400" size={24} />
        </div>

        <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          Reset Password
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Enter your email and we'll send you a 6-digit reset code.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '0.85rem 1rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7', padding: '0.85rem 1rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {message}
          </div>
        )}

        {/* DEMO PURPOSES ONLY */}
        {demoCode && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-6">
            <p className="text-yellow-200/80 text-xs font-semibold uppercase tracking-wider mb-2">Simulated Email Received</p>
            <p className="text-yellow-100 text-sm mb-4">Because this demo doesn't have an email server, here is the code that would have been emailed to you:</p>
            <div className="text-2xl font-mono tracking-[0.25em] font-bold text-yellow-400 text-center bg-black/40 py-3 rounded-lg border border-yellow-500/30">
              {demoCode}
            </div>
            <button 
              onClick={() => navigate('/reset-password', { state: { email, code: demoCode } })}
              className="mt-4 w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 rounded-lg text-sm font-medium transition-colors"
            >
              Continue to Reset Password &rarr;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field
            icon={Mail}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={isLoading || demoCode}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.9rem 1.5rem',
              borderRadius: 12,
              border: 'none',
              cursor: isLoading || demoCode ? 'not-allowed' : 'pointer',
              background: isLoading || demoCode ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Code'}
          </button>
        </form>
      </div>
    </div>
  );
}
