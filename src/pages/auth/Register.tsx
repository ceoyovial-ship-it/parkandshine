import { useState } from 'react';
import { Car, Eye, EyeOff, Mail, Phone, Lock, User as UserIcon, ArrowLeft, UserPlus, ShieldCheck, Star, Clock, Shield } from 'lucide-react';
import { registerUser } from '@/store';
import { useToast } from '@/components/Toast';

interface RegisterProps {
  onBack: () => void;
  onLogin: () => void;
  onRegisterSuccess: () => void;
}

const HERO_IMG = 'https://images.pexels.com/photos/6872591/pexels-photo-6872591.jpeg?auto=compress&cs=tinysrgb&w=1200';

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['bg-red-500', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'];
  return { score, label: labels[score], color: colors[score] };
}

export default function Register({ onBack, onLogin, onRegisterSuccess }: RegisterProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(form.password);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Enter at least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^\+?\d{10}$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid 10-digit phone';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    if (!agree) e.terms = 'Please accept the terms to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      try {
        registerUser(form.name.trim(), form.email.toLowerCase().trim(), form.phone.trim());
      } catch (error) {
        setLoading(false);
        const message = error instanceof Error ? error.message : 'Could not save the demo profile';
        toast(message, 'error');
        return;
      }
      setLoading(false);
      toast('Demo profile saved. No password was stored and you have not been signed in. Connect an authentication provider to create a real account.', 'info');
      onRegisterSuccess();
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col lg:flex-row">
      {/* Left: imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={HERO_IMG} alt="Professional car detailing" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/70 to-brand/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30">
              <Car className="w-7 h-7 text-white" />
            </div>
            <span className="text-white font-bold text-2xl">ParkShine</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Join ParkShine.<br />
            <span className="text-brand">Shine Every Day.</span>
          </h2>
          <p className="text-white/60 text-sm mt-4 max-w-sm leading-relaxed">
            Create your account and start booking premium car washes right from your office desk.
          </p>
          <div className="flex items-center gap-5 mt-6">
            <div className="flex items-center gap-1.5 text-white/60 text-xs"><Star className="w-4 h-4 text-yellow-400" /> 4.8 Rating</div>
            <div className="flex items-center gap-1.5 text-white/60 text-xs"><Shield className="w-4 h-4 text-brand" /> Key-Safe</div>
            <div className="flex items-center gap-1.5 text-white/60 text-xs"><Clock className="w-4 h-4 text-green-400" /> 20-75 min</div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-5 flex items-center justify-between lg:hidden">
          <button onClick={onBack} className="text-white/50 hover:text-white transition flex items-center gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">ParkShine</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md animate-slide-up">
            <div className="hidden lg:block mb-2">
              <button onClick={onBack} className="text-white/50 hover:text-white transition flex items-center gap-1.5 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </div>
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-white/50 text-sm mt-2">Sign up to book premium car washes at your office</p>

            <div className="mt-4 bg-brand/10 border border-brand/20 rounded-xl p-3 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
              <p className="text-white/60 text-xs">
                New accounts are created as <span className="text-brand font-semibold">User</span> role.
                Worker, Security, and Admin roles are assigned by an administrator.
              </p>
            </div>
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-amber-100/75 text-xs leading-relaxed">
                Demo mode only: this form saves profile details in this browser but does not create an authenticated account, verify your email, or save your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="register-name" className="text-white/60 text-sm font-medium block mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    aria-invalid={Boolean(errors.name)}
                    placeholder="Arjun Sharma"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-navy-light border ${errors.name ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="register-email" className="text-white/60 text-sm font-medium block mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    aria-invalid={Boolean(errors.email)}
                    placeholder="your.name@company.in"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-navy-light border ${errors.email ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="register-phone" className="text-white/60 text-sm font-medium block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    id="register-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    aria-invalid={Boolean(errors.phone)}
                    placeholder="98765 43210"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl bg-navy-light border ${errors.phone ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`}
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="register-password" className="text-white/60 text-sm font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    aria-invalid={Boolean(errors.password)}
                    placeholder="Min 6 characters"
                    className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-navy-light border ${errors.password ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                {form.password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < strength.score ? strength.color : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <p className="text-white/40 text-xs mt-1">Strength: <span className="font-medium">{strength.label}</span></p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="text-white/60 text-sm font-medium block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    id="register-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    aria-invalid={Boolean(errors.confirm)}
                    placeholder="Re-enter password"
                    className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-navy-light border ${errors.confirm ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
              </div>

              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) => setAgree(event.target.checked)}
                    aria-invalid={Boolean(errors.terms)}
                    className="mt-0.5 w-5 h-5 flex-shrink-0 accent-blue-500"
                  />
                  <span className="text-white/60 text-sm leading-relaxed">
                    I agree to the <span className="text-brand">Terms of Service</span> and <span className="text-brand">Privacy Policy</span>
                  </span>
                </label>
                {errors.terms && <p className="text-red-400 text-xs mt-1">{errors.terms}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                ) : (
                  <><UserPlus className="w-5 h-5" /> Create Account</>
                )}
              </button>

              <p className="text-center text-white/50 text-sm">
                Already have an account?{' '}
                <button type="button" onClick={onLogin} className="text-brand hover:text-brand-light font-semibold transition">
                  Login
                </button>
              </p>
            </form>

            <p className="text-white/30 text-xs text-center mt-6">
              Demo authentication · Not production-secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
