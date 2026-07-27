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
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.7 }} />
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
        className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm text-white placeholder:text-white/30 outline-none transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: 'none',
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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0b0b12' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-between relative flex-1 overflow-hidden p-12">
        <ParticleCanvas />

        {/* Gradient orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '30%', width: '420px', height: '420px', background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={22} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>HW Team Hub</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(139,92,246,0.9)' }}>Hardware Project Management</p>
          <h2 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1, color: 'white', marginBottom: '1.2rem' }}>
            Build better<br />
            <span style={{ background: 'linear-gradient(90deg,#8b5cf6,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              hardware, together.
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 380 }}>
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
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} HW Team Hub · Built for hardware engineers
          </p>
        </div>
      </div>

      {/* ── Right panel (login form) ── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[480px] lg:min-w-[480px] p-8 relative"
        style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={22} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>HW Team Hub</span>
        </div>

        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Heading */}
          <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
            Sign in to your workspace
          </p>

          {/* Error banner */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', padding: '0.85rem 1rem', borderRadius: 12, marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1rem' }}>⚠</span> {error}
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
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ color: 'rgba(255,255,255,0.3)', cursor: 'pointer', background: 'none', border: 'none', padding: 4, display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginTop: '-4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#8b5cf6', cursor: 'pointer', width: '14px', height: '14px' }}
                />
                <label htmlFor="remember" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
                  Remember my email
                </label>
              </div>
              <Link to="/forgot-password" style={{ color: '#8b5cf6', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => e.target.style.color = '#a78bfa'}
                onMouseLeave={e => e.target.style.color = '#8b5cf6'}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.9rem 1.5rem',
                borderRadius: 12,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                background: isLoading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: isLoading ? 'none' : '0 0 24px rgba(139,92,246,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(139,92,246,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isLoading ? 'none' : '0 0 24px rgba(139,92,246,0.35)'; }}
            >
              {isLoading
                ? <><Loader2 size={18} className="animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight size={17} /></>
              }
            </button>
          </form>

          {/* Divider + Sign up */}
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textAlign: 'center' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#a78bfa'}
                onMouseLeave={e => e.target.style.color = '#8b5cf6'}>
                Request access →
              </Link>
            </p>
          </div>

          {/* Security note */}
          <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>
            <Shield size={11} />
            <span>256-bit encrypted · Authorized personnel only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
