import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Cpu, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, Zap, Shield, GitBranch } from 'lucide-react';

/* ── Animated canvas dots background ─────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      r:   Math.random() * 1.5 + 0.5,
      dx:  (Math.random() - 0.5) * 0.3,
      dy:  (Math.random() - 0.5) * 0.3,
      a:   Math.random() * 0.6 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.a})`;
        ctx.fill();
      });

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050508]">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-screen opacity-50" />
      
      {/* Hardware Grid overlay */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
    </div>
  );
}

/* ── Feature pill ──────────────────────────────────────────────── */
function Pill({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <Icon size={14} className="text-violet-400 shrink-0" />
      <span className="text-sm text-white/70">{text}</span>
    </div>
  );
}

/* ── Input field ───────────────────────────────────────────────── */
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
        autoComplete={type === 'email' ? 'username' : type === 'password' ? 'current-password' : 'off'}
        className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 focus:bg-white/[0.05] focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
      />
      {right && <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{right}</div>}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between relative flex-1 overflow-hidden p-16">
        <ParticleCanvas />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">HW Team Hub</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Workspace Login</span>
          </div>
          <h2 className="text-5xl font-black leading-[1.1] text-white mb-6 tracking-tight">
            Build better<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              hardware, together.
            </span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            Streamline your PCB design pipeline, track firmware tasks, and collaborate with your engineering team — all in one workspace.
          </p>

          <div className="flex flex-col gap-2.5 mt-8">
            <Pill icon={GitBranch} text="Drag-and-drop task board with Kanban workflow" />
            <Pill icon={Shield}    text="Role-based team access with secure authentication" />
            <Pill icon={Zap}       text="Real-time updates via WebSockets" />
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-sm text-text-secondary/60 font-medium">
            © {new Date().getFullYear()} HW Team Hub · Built for hardware engineers
          </p>
        </div>
      </div>

      {/* ── Right panel (login form) ── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[540px] lg:min-w-[540px] p-8 relative bg-white/[0.01] border-l border-white/5 backdrop-blur-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.2)]">

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Cpu size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">HW Team Hub</span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-text-secondary">
              Enter your credentials to access your workspace
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6 animate-in fade-in slide-in-from-top-2">
              <Shield size={16} className="shrink-0" /> 
              <span>{error}</span>
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
            <Field
              icon={Lock}
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              right={
                <button type="button" onClick={() => setShowPw(v => !v)} className="text-white/30 hover:text-white transition-colors p-1 flex items-center justify-center">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between px-1 mt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 rounded border border-white/20 bg-white/5 group-hover:border-primary/50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={e => setRememberMe(e.target.checked)}
                    className="peer absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 rounded bg-primary scale-0 peer-checked:scale-100 transition-transform duration-200" />
                  <svg className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <span className="text-sm text-text-secondary group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-indigo-300 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-4 w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all duration-300 ${
                isLoading 
                  ? 'bg-primary/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5'
              }`}
            >
              {isLoading
                ? <><Loader2 size={18} className="animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight size={17} /></>
              }
            </button>
          </form>

          {/* Divider + Sign up */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex items-center w-full gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs font-medium text-white/30 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <p className="text-sm text-text-secondary text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:text-indigo-300 transition-colors ml-1">
                Request access &rarr;
              </Link>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-12 flex items-center justify-center gap-2 text-xs font-medium text-white/20">
            <Shield size={14} />
            <span>256-bit encrypted · Authorized personnel only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
