import { Car, LogIn, UserPlus, Sparkles, Shield, Clock, Star } from 'lucide-react';

interface WelcomeProps {
  onLogin: () => void;
  onRegister: () => void;
  onDemoLogin: () => void;
}

const HERO_IMG = 'https://images.pexels.com/photos/6873174/pexels-photo-6873174.jpeg?auto=compress&cs=tinysrgb&w=1600';

export default function Welcome({ onLogin, onRegister, onDemoLogin }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-navy relative overflow-hidden flex flex-col">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="Premium car wash" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/90 to-navy" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand shadow-lg shadow-brand/30 mb-6">
            <Car className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">ParkShine</h1>
          <p className="text-brand text-sm font-medium mt-2">Premium Office Car Wash</p>

          {/* Tagline */}
          <h2 className="text-2xl font-semibold text-white mt-10 leading-snug">
            Your Car Gets Clean.
            <br />
            <span className="text-brand">Your Day Stays Yours.</span>
          </h2>
          <p className="text-white/60 text-sm mt-4 leading-relaxed">
            Professional car wash delivered to your office parking.
            Book in seconds, we wash while you work.
          </p>

          {/* Feature pills */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-1.5 text-white/50 text-xs"><Star className="w-4 h-4 text-yellow-400" /> 4.8</div>
            <div className="flex items-center gap-1.5 text-white/50 text-xs"><Shield className="w-4 h-4 text-brand" /> Key-Safe</div>
            <div className="flex items-center gap-1.5 text-white/50 text-xs"><Clock className="w-4 h-4 text-green-400" /> 20-75 min</div>
          </div>

          {/* CTA buttons */}
          <div className="mt-10 space-y-3">
            <button
              onClick={onLogin}
              className="w-full py-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-brand/30"
            >
              <LogIn className="w-5 h-5" /> Login
            </button>
            <button
              onClick={onRegister}
              className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold transition-all backdrop-blur flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> Create Account
            </button>
          </div>

          {/* Demo login shortcut */}
          <button
            onClick={onDemoLogin}
            className="mt-6 text-white/40 hover:text-brand text-xs font-medium transition flex items-center gap-1.5 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" /> Demo role login for presentations
          </button>

          <p className="text-white/30 text-xs mt-8">
            Demo authentication · Not production-secure
          </p>
        </div>
      </div>

      <div className="relative z-10 text-center pb-6">
        <p className="text-white/30 text-xs">
          Designed & Developed by <span className="text-brand/70 font-semibold">Yovial Technologies</span>
        </p>
      </div>
    </div>
  );
}
