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
    <div className="dark min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      
      {/* Hardware Grid overlay */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <div className="w-full max-w-[420px] p-10 z-10 flex flex-col items-center bg-white/[0.01] border border-white/5 backdrop-blur-3xl shadow-2xl rounded-3xl mx-4">
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-8 shadow-[0_8px_30px_rgba(16,185,129,0.3)]">
          <UserPlus size={32} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tight text-white">
          Create Account
        </h1>
        <p className="text-text-secondary mb-10 text-center">
          Join the hardware workspace.<br/><span className="text-xs opacity-50">(Powered by Supabase)</span>
        </p>
        
        {error && (
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 animate-in fade-in slide-in-from-top-2">
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6 animate-in fade-in slide-in-from-top-2">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          
          <div className="relative group">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors z-10" />
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 focus:bg-white/[0.05] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
              required
            />
          </div>

          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors z-10" />
            <input 
              type="password" 
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 focus:bg-white/[0.05] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
              required
            />
          </div>

          <button 
            type="submit" 
            className={`mt-4 w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all duration-300 ${
              isLoading || success
                ? 'bg-emerald-600/50 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5'
            }`}
            disabled={isLoading || success}
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Registering...</> : 'Sign Up'} 
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-sm text-text-secondary text-center">
          Already have an account? <Link to="/login" className="text-emerald-500 font-semibold hover:text-emerald-400 transition-colors ml-1">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
