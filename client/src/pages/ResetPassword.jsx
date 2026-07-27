import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Key, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

function Field({ icon: Icon, type, placeholder, value, onChange, right }) {
  return (
    <div className="relative group">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-violet-400 transition-colors z-10" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200"
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
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{right}</div>}
    </div>
  );
}

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If navigated from ForgotPassword with state
    if (location.state?.email) setEmail(location.state.email);
    if (location.state?.code) setCode(location.state.code);
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/reset-password-with-code', { email, code, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The code might be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0b0b12', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-full max-w-md p-8 relative" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {!success && (
          <Link to="/forgot-password" className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm font-medium mb-8">
            <ArrowLeft size={16} /> Back
          </Link>
        )}

        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
          <Key className="text-violet-400" size={24} />
        </div>

        <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          Choose a new password
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Enter the 6-digit code we sent you and your new password.
        </p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '0.85rem 1rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7', padding: '1.5rem', borderRadius: 12, textAlign: 'center' }}>
            <h3 className="font-bold text-lg mb-2">Password Reset!</h3>
            <p className="text-sm opacity-80 mb-4">Your password has been changed successfully. Redirecting you to login...</p>
            <Loader2 size={24} className="animate-spin mx-auto opacity-50" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Field
              icon={Mail}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Field
              icon={Key}
              type="text"
              placeholder="6-digit Reset Code"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <Field
              icon={Lock}
              type={showPw ? 'text' : 'password'}
              placeholder="New Password (min 8 chars)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              right={
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', padding: 4, display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={isLoading || newPassword.length < 8}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.9rem 1.5rem',
                borderRadius: 12,
                border: 'none',
                cursor: isLoading || newPassword.length < 8 ? 'not-allowed' : 'pointer',
                background: isLoading || newPassword.length < 8 ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
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
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
