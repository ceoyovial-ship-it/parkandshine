import { useState } from 'react';
import { Car, Eye, EyeOff, Mail, Lock, LogIn, Sparkles } from 'lucide-react';

interface LoginProps {
  onRegister: () => void;
  onForgotPassword: () => void;
  onDemoLogin: () => void;
}

const HERO_IMG = 'https://images.pexels.com/photos/6873174/pexels-photo-6873174.jpeg?auto=compress&cs=tinysrgb&w=1600';

export default function Login({ onRegister, onForgotPassword, onDemoLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation: Record<string, string> = {};
    if (!email.trim()) validation.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) validation.email = 'Enter a valid email address';
    if (!password) validation.password = 'Password is required';
    setErrors(validation);
    setSubmitError('');
    if (Object.keys(validation).length) return;

    setLoading(true);
    await Promise.resolve();
    setLoading(false);
    setSubmitError('Email and password authentication is not configured in this demo. Choose “Explore demo roles” to access a role dashboard.');
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-navy px-4 py-8 sm:px-6">
      <img src={HERO_IMG} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/85 to-blue-950/95" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <section className="relative z-10 flex w-full max-w-md flex-col items-center">
        <header className="mb-6 text-center">
          <Brand />
          <p className="mt-2 text-sm font-medium tracking-wide text-cyan-200/75">Your car care, simplified.</p>
        </header>

        <div className="w-full rounded-3xl border border-white/10 bg-navy-light/95 p-6 shadow-2xl shadow-black/30 animate-slide-up sm:p-8">
          <div className="mb-7 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">ParkShine account</p>
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-white/55">Sign in to manage your washes, vehicles, and bookings.</p>
          </div>

          <div className="mb-6 rounded-xl border border-cyan-300/15 bg-cyan-300/5 px-4 py-3">
            <p className="text-cyan-100/80 text-sm leading-relaxed">
              This project currently runs in demo mode; email authentication and password recovery are not connected.
              Use demo roles to explore the existing dashboards.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="login-email" className="text-white/75 text-sm font-medium block mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                  placeholder="you@example.com"
                  className={`w-full min-h-12 pl-11 pr-4 py-3 rounded-xl bg-navy border ${errors.email ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition`}
                />
              </div>
              {errors.email && <p id="login-email-error" role="alert" className="text-red-300 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="text-white/75 text-sm font-medium">Password</label>
                <button type="button" onClick={onForgotPassword} className="text-cyan-300 hover:text-cyan-200 text-sm font-medium transition">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'login-password-error' : undefined}
                  placeholder="Enter your password"
                  className={`w-full min-h-12 pl-11 pr-12 py-3 rounded-xl bg-navy border ${errors.password ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20 transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 text-white/45 hover:text-white transition flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p id="login-password-error" role="alert" className="text-red-300 text-xs mt-1.5">{errors.password}</p>}
            </div>

            {submitError && <p role="alert" className="text-red-200 text-sm rounded-xl border border-red-400/20 bg-red-400/10 p-3 leading-relaxed">{submitError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-12 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-brand/20 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            >
              {loading ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</> : <><LogIn className="w-5 h-5" /> Sign In</>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/55 text-sm">
              New to ParkShine?{' '}
              <button type="button" onClick={onRegister} className="text-cyan-300 hover:text-cyan-200 font-semibold transition">
                Create Account
              </button>
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            <button type="button" onClick={onDemoLogin} className="w-full min-h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/75 hover:text-white font-medium text-sm transition flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300" /> Explore demo roles
            </button>
            <p className="text-white/35 text-xs text-center mt-3">Demo access is for preview only and is not production authentication.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Brand() {
  return (
    <div className="inline-flex items-center gap-3" aria-label="ParkShine">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/25">
        <Car className="h-7 w-7 text-white" />
      </span>
      <span className="text-2xl font-bold tracking-tight text-white">ParkShine</span>
    </div>
  );
}
