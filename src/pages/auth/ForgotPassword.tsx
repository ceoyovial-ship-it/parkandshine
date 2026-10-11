import { useState } from 'react';
import { ArrowLeft, Car, Info, Mail } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      setSubmitted(false);
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-md bg-navy-light border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-slide-up">
        <button onClick={onBack} className="min-h-11 text-white/55 hover:text-white transition flex items-center gap-1.5 text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
        <div className="flex items-center gap-3 mb-7">
          <span className="w-11 h-11 rounded-xl bg-brand flex items-center justify-center"><Car className="w-6 h-6 text-white" /></span>
          <div>
            <p className="text-white font-bold text-xl">ParkShine</p>
            <p className="text-white/40 text-xs">Account recovery</p>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white">Forgot your password?</h1>
        <p className="text-white/55 text-sm leading-relaxed mt-2">Enter the email associated with your account.</p>

        <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 mt-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
          <p className="text-amber-100/75 text-sm leading-relaxed">
            Password recovery is not available because this demo project has no authentication provider or email verification service connected. No reset email will be sent.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="recovery-email" className="text-white/75 text-sm font-medium block mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35" aria-hidden="true" />
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setSubmitted(false); }}
                aria-invalid={Boolean(error)}
                className={`w-full min-h-12 pl-11 pr-4 py-3 rounded-xl bg-navy border ${error ? 'border-red-500' : 'border-white/10'} text-white focus:border-brand focus:outline-none transition`}
              />
            </div>
            {error && <p role="alert" className="text-red-300 text-xs mt-1.5">{error}</p>}
          </div>
          {submitted && <p role="status" className="text-white/70 text-sm">Recovery cannot be completed until an authentication provider is configured.</p>}
          <button type="submit" className="w-full min-h-12 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-200">
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}
