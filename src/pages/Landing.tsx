import { useState } from 'react';
import { Car, Sparkles, Shield, Clock, Check, ArrowRight, Star, Droplets, Zap, Crown, Wrench } from 'lucide-react';
import { PACKAGES } from '@/types';
import type { Role } from '@/types';
import DemoLoginModal from '@/components/DemoLoginModal';
import { getUsers } from '@/store';

interface LandingProps {
  onBookNow: () => void;
  onDemoLogin: (role: Role, userId?: string) => void;
}

const HERO_IMG = 'https://images.pexels.com/photos/6873174/pexels-photo-6873174.jpeg?auto=compress&cs=tinysrgb&w=1600';
const SERVICE_IMGS = [
  'https://images.pexels.com/photos/6872591/pexels-photo-6872591.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6872153/pexels-photo-6872153.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6873006/pexels-photo-6873006.jpeg?auto=compress&cs=tinysrgb&w=800',
];

const PACKAGE_ICONS: Record<string, typeof Zap> = { quick: Zap, premium: Droplets, signature: Crown };

export default function Landing({ onBookNow, onDemoLogin }: LandingProps) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-navy">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Premium car wash" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/20 border border-brand/30 mb-6">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="text-brand text-sm font-medium">Premium Office Car Wash Service</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Your car shines
              <br />
              <span className="text-brand">while you work.</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl">
              ParkShine brings professional car wash to your office parking. Book in seconds,
              we wash while you work, and your car is ready by your next break.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onBookNow}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-brand/30"
              >
                Book Now <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all backdrop-blur"
              >
                Demo Login
              </button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.8 Rating</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-brand" /> Key-Safe Process</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-green-400" /> 20-75 min</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy-light border-y border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2,500+', label: 'Cars Washed' },
            { value: '4', label: 'Office Towers' },
            { value: '8', label: 'Daily Slots' },
            { value: '4.8★', label: 'Avg Rating' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-white/50 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Our Services</h2>
            <p className="mt-4 text-white/60 text-lg">Professional care for every car, right in your office parking</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_IMGS.map((img, i) => {
              const titles = ['Exterior Foam Wash', 'Interior Deep Clean', 'Full Detailing & Wax'];
              const descs = [
                'High-pressure foam wash with premium soap and tire cleaning.',
                'Vacuum, dashboard wipe, glass cleaning, and air freshener.',
                'Complete interior + exterior with wax polish and ceramic spray.',
              ];
              return (
                <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-brand/40 transition-all">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={img} alt={titles[i]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white">{titles[i]}</h3>
                    <p className="text-white/60 text-sm mt-1">{descs[i]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-navy-light border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Simple Pricing</h2>
            <p className="mt-4 text-white/60 text-lg">Choose the package that fits your car</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PACKAGES.map((pkg) => {
              const Icon = PACKAGE_ICONS[pkg.id];
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl p-8 transition-all hover:scale-105 ${
                    pkg.popular
                      ? 'bg-gradient-to-b from-brand/20 to-navy border-2 border-brand shadow-xl shadow-brand/20'
                      : 'bg-navy border border-white/10 hover:border-white/20'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand text-white text-xs font-semibold">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pkg.popular ? 'bg-brand' : 'bg-white/10'}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                      <p className="text-white/50 text-sm">{pkg.duration}</p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white">
                    ₹{pkg.price}
                    <span className="text-white/40 text-base font-normal">/wash</span>
                  </p>
                  <ul className="mt-6 space-y-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-white/70 text-sm">
                        <Check className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onBookNow}
                    className={`mt-8 w-full py-3 rounded-xl font-semibold transition-all ${
                      pkg.popular
                        ? 'bg-brand hover:bg-brand-dark text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    Book {pkg.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Book', desc: 'Choose package, slot & parking location', icon: Car },
              { step: '2', title: 'Assign', desc: 'Worker is assigned & keys collected', icon: Wrench },
              { step: '3', title: 'Wash', desc: 'Professional wash while you work', icon: Droplets },
              { step: '4', title: 'Ready', desc: 'Keys returned, car delivered clean', icon: Check },
            ].map((s) => (
              <div key={s.step} className="relative rounded-2xl bg-navy-light border border-white/10 p-6 hover:border-brand/30 transition">
                <div className="w-12 h-12 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-brand" />
                </div>
                <p className="text-brand text-sm font-bold mb-1">Step {s.step}</p>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-white/50 text-sm mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand/20 via-navy to-navy border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to shine?</h2>
          <p className="mt-4 text-white/70 text-lg">Book your car wash in under 30 seconds.</p>
          <button
            onClick={onBookNow}
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-brand/30"
          >
            Book Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Demo Login Modal */}
      <DemoLoginModal open={showLogin} onClose={() => setShowLogin(false)} users={getUsers()} onSelect={onDemoLogin} />
    </div>
  );
}
