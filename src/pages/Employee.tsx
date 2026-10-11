import { useState } from 'react';
import {
  Car, Building2, MapPin, Clock, CreditCard, CheckCircle, Search, Calendar,
  Sparkles, Zap, Crown, Droplets, X, ArrowRight, Bell, Home as HomeIcon, Plus,
  Check, TrendingUp, UserCircle,
} from 'lucide-react';
import type { User, Booking, Package } from '@/types';
import { PACKAGES, STATUS_LABELS } from '@/types';
import {
  getBookings, saveBooking, generateBookingId, generatePaymentRef, getSlots,
  getNotifications, addNotification,
} from '@/store';
import { useStoreData } from '@/hooks/useStoreData';
import { useToast } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';

interface EmployeeProps {
  user: User;
  initialView?: 'home' | 'book' | 'track';
  onNavigate: (page: string) => void;
}

const PACKAGE_ICONS: Record<string, typeof Zap> = { quick: Zap, premium: Droplets, signature: Crown };
const PACKAGE_ACCENT: Record<string, string> = { quick: 'text-blue-400', premium: 'text-brand', signature: 'text-yellow-400' };

const CAR_MODELS = [
  'Hyundai Creta', 'Maruti Suzuki Brezza', 'Toyota Innova Crysta', 'Honda City',
  'Mahindra XUV700', 'Tata Nexon', 'Kia Seltos', 'Maruti Swift', 'Volkswagen Vento', 'Renault Triber',
];

const TIMELINE_STEPS: { key: string; label: string }[] = [
  { key: 'booked', label: 'Confirmed' },
  { key: 'assigned', label: 'Worker Assigned' },
  { key: 'keys_collected', label: 'Keys Collected' },
  { key: 'washing', label: 'Washing' },
  { key: 'keys_returned', label: 'Car Returned' },
];

function getTimelineIndex(status: string): number {
  if (status === 'cancelled') return -1;
  if (status === 'completed') return TIMELINE_STEPS.length;
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function EmployeePage({ user, initialView = 'home', onNavigate }: EmployeeProps) {
  const { toast } = useToast();
  const [bookings, refresh] = useStoreData(getBookings);
  const [notifications] = useStoreData(() => getNotifications(user.id));
  const [view, setView] = useState<'home' | 'book' | 'track'>(initialView);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    carNumber: '',
    carModel: '',
    office: user.office || '',
    parkingFloor: '',
    parkingBay: '',
    parkingInstructions: '',
    packageId: 'premium',
    timeSlot: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  const myBookings = bookings.filter((b) => b.employeeId === user.id);
  const filteredBookings = myBookings.filter((b) =>
    b.carNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  const upcomingBookings = myBookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled');
  const recentBookings = myBookings.slice(0, 4);
  const activeBooking = upcomingBookings[0];
  const unreadNotifs = notifications.filter((n) => !n.read);

  const slots = getSlots();
  const selectedPkg = PACKAGES.find((p) => p.id === form.packageId)!;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.carNumber.trim()) e.carNumber = 'Car number is required';
    else if (!/^[A-Z]{2}\d/.test(form.carNumber.toUpperCase().replace(/\s/g, ''))) e.carNumber = 'Enter valid plate (e.g. KA01 AB 1234)';
    if (!form.carModel) e.carModel = 'Select car model';
    if (!form.office.trim()) e.office = 'Office or building is required';
    if (!form.parkingFloor.trim()) e.parkingFloor = 'Parking floor required';
    if (!form.parkingBay.trim()) e.parkingBay = 'Parking bay required';
    if (!form.timeSlot) e.timeSlot = 'Select a time slot';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) {
      toast('Please fix the errors in the form', 'error');
      return;
    }
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        const booking: Booking = {
          id: generateBookingId(),
          carNumber: form.carNumber.toUpperCase(),
          carModel: form.carModel,
          employeeName: user.name,
          employeeId: user.id,
          office: form.office.trim(),
          parkingFloor: form.parkingFloor.trim(),
          parkingBay: form.parkingBay.trim(),
          parkingInstructions: form.parkingInstructions.trim(),
          packageId: form.packageId,
          packageName: selectedPkg.name,
          price: selectedPkg.price,
          timeSlot: form.timeSlot,
          date: form.date,
          status: 'booked',
          paymentRef: generatePaymentRef(),
          createdAt: new Date().toISOString(),
          timeline: [{ status: 'booked', label: 'Booking confirmed', time: new Date().toISOString() }],
        };
        saveBooking(booking);
        addNotification({
          id: `n${Date.now()}`,
          userId: user.id,
          title: 'Booking Confirmed',
          message: `Your ${selectedPkg.name} for ${booking.carNumber} is confirmed. Booking ID: ${booking.id}.`,
          time: new Date().toISOString(),
          read: false,
        });
        setLastBooking(booking);
        toast(`Booking ${booking.id} confirmed!`, 'success');
        refresh();
        setPaymentSuccess(false);
        setForm({ ...form, carNumber: '', carModel: '', parkingFloor: '', parkingBay: '', parkingInstructions: '', timeSlot: '' });
      }, 1200);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-navy pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'home' ? (
          <HomeDashboard
            user={user}
            bookings={myBookings}
            upcomingBookings={upcomingBookings}
            activeBooking={activeBooking}
            recentBookings={recentBookings}
            notifications={notifications}
            unreadNotifs={unreadNotifs}
            onBook={() => onNavigate('book')}
            onTrack={() => onNavigate('track')}
            onVehicles={() => onNavigate('vehicles')}
            onHistory={() => onNavigate('history')}
            onProfile={() => onNavigate('profile')}
          />
        ) : view === 'book' ? (
          <>
            {/* Tabs */}
            <div className="hidden md:flex gap-2 mb-6 bg-navy-light p-1.5 rounded-xl w-fit">
              <button onClick={() => setView('home')} className="px-5 py-2.5 rounded-lg font-medium text-sm transition text-white/60 hover:text-white flex items-center gap-1.5">
                <HomeIcon className="w-4 h-4" /> Home
              </button>
              <button onClick={() => setView('book')} className="px-5 py-2.5 rounded-lg font-medium text-sm transition bg-brand text-white">
                Book a Wash
              </button>
              <button onClick={() => setView('track')} className="px-5 py-2.5 rounded-lg font-medium text-sm transition text-white/60 hover:text-white">
                My Bookings ({myBookings.length})
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                {/* Package selection with checklists */}
                <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand" /> Choose Package
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PACKAGES.map((pkg: Package) => {
                      const Icon = PACKAGE_ICONS[pkg.id];
                      const selected = form.packageId === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          onClick={() => setForm({ ...form, packageId: pkg.id })}
                          className={`text-left p-4 rounded-xl border-2 transition-all relative ${selected ? 'border-brand bg-brand/10' : 'border-white/10 hover:border-white/20'} ${pkg.popular ? 'ring-1 ring-brand/30' : ''}`}
                        >
                          {pkg.popular && (
                            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold whitespace-nowrap">
                              RECOMMENDED
                            </span>
                          )}
                          <div className="flex items-center justify-between mb-2">
                            <Icon className={`w-6 h-6 ${selected ? 'text-brand' : PACKAGE_ACCENT[pkg.id]}`} />
                            <span className="text-white/40 text-xs">{pkg.duration}</span>
                          </div>
                          <p className="text-white font-semibold">{pkg.name}</p>
                          <p className="text-2xl font-bold text-white mt-1">₹{pkg.price}</p>
                          <ul className="mt-3 space-y-1.5">
                            {pkg.features.map((f) => (
                              <li key={f} className="flex items-start gap-1.5 text-white/50 text-xs">
                                <Check className={`w-3 h-3 flex-shrink-0 mt-0.5 ${selected ? 'text-brand' : 'text-white/30'}`} /> {f}
                              </li>
                            ))}
                          </ul>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Car & parking details */}
                <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-brand" /> Car & Parking Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm font-medium block mb-1.5">Car Number</label>
                      <input
                        value={form.carNumber}
                        onChange={(e) => setForm({ ...form, carNumber: e.target.value })}
                        placeholder="KA01 AB 1234"
                        className={`w-full px-4 py-2.5 rounded-xl bg-navy border ${errors.carNumber ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`}
                      />
                      {errors.carNumber && <p className="text-red-400 text-xs mt-1">{errors.carNumber}</p>}
                    </div>
                    <div>
                      <label className="text-white/60 text-sm font-medium block mb-1.5">Car Model</label>
                      <select
                        value={form.carModel}
                        onChange={(e) => setForm({ ...form, carModel: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl bg-navy border ${errors.carModel ? 'border-red-500' : 'border-white/10'} text-white focus:border-brand focus:outline-none transition`}
                      >
                        <option value="">Select model</option>
                        {CAR_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      {errors.carModel && <p className="text-red-400 text-xs mt-1">{errors.carModel}</p>}
                    </div>
                    <div>
                      <label className="text-white/60 text-sm font-medium block mb-1.5">Office / Building</label>
                      <input
                        value={form.office}
                        onChange={(e) => setForm({ ...form, office: e.target.value })}
                        placeholder="e.g. Orion Business Centre, Building 2"
                        className={`w-full px-4 py-2.5 rounded-xl bg-navy border ${errors.office ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`}
                      />
                      <p className="text-white/35 text-xs mt-1">Enter the building or office name where your vehicle is parked.</p>
                      {errors.office && <p className="text-red-400 text-xs mt-1">{errors.office}</p>}
                    </div>
                    <div>
                      <label className="text-white/60 text-sm font-medium block mb-1.5">Date</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-navy border border-white/10 text-white focus:border-brand focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm font-medium block mb-1.5">Parking Floor</label>
                      <input
                        value={form.parkingFloor}
                        onChange={(e) => setForm({ ...form, parkingFloor: e.target.value })}
                        placeholder="e.g. Basement 2 or Floor 4"
                        className={`w-full px-4 py-2.5 rounded-xl bg-navy border ${errors.parkingFloor ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`}
                      />
                      {errors.parkingFloor && <p className="text-red-400 text-xs mt-1">{errors.parkingFloor}</p>}
                    </div>
                    <div>
                      <label className="text-white/60 text-sm font-medium block mb-1.5">Parking Bay</label>
                      <input
                        value={form.parkingBay}
                        onChange={(e) => setForm({ ...form, parkingBay: e.target.value })}
                        placeholder="e.g. A-12 or Blue Zone 18"
                        className={`w-full px-4 py-2.5 rounded-xl bg-navy border ${errors.parkingBay ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`}
                      />
                      {errors.parkingBay && <p className="text-red-400 text-xs mt-1">{errors.parkingBay}</p>}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-white/60 text-sm font-medium block mb-1.5">Parking Instructions <span className="text-white/30">(optional)</span></label>
                    <textarea
                      value={form.parkingInstructions}
                      onChange={(e) => setForm({ ...form, parkingInstructions: e.target.value })}
                      placeholder="e.g. Use the visitor ramp; car is near the lift"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl bg-navy border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition resize-y"
                    />
                  </div>
                </div>

                {/* Time slot */}
                <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand" /> Select Time Slot
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {slots.map((slot) => {
                      const full = slot.booked >= slot.capacity;
                      const selected = form.timeSlot === slot.time;
                      return (
                        <button
                          key={slot.id}
                          disabled={full}
                          onClick={() => setForm({ ...form, timeSlot: slot.time })}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${selected ? 'border-brand bg-brand/10' : full ? 'border-white/5 opacity-40 cursor-not-allowed' : 'border-white/10 hover:border-white/30'}`}
                        >
                          <p className="text-white text-sm font-semibold">{slot.time}</p>
                          <p className="text-white/40 text-xs mt-0.5">{full ? 'Full' : `${slot.capacity - slot.booked} left`}</p>
                        </button>
                      );
                    })}
                  </div>
                  {errors.timeSlot && <p className="text-red-400 text-xs mt-2">{errors.timeSlot}</p>}
                </div>
              </div>

              {/* Summary & Pay */}
              <div className="lg:col-span-1">
                <div className="bg-navy-light rounded-2xl border border-white/10 p-6 sticky top-24">
                  <h3 className="text-white font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-white/50">Package</span><span className="text-white font-medium">{selectedPkg.name}</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Duration</span><span className="text-white font-medium">{selectedPkg.duration}</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Slot</span><span className="text-white font-medium">{form.timeSlot || '—'}</span></div>
                    <div className="flex justify-between"><span className="text-white/50">Date</span><span className="text-white font-medium">{form.date}</span></div>
                    {form.carNumber && <div className="flex justify-between"><span className="text-white/50">Car</span><span className="text-white font-medium">{form.carNumber.toUpperCase()}</span></div>}
                    {form.parkingBay && <div className="flex justify-between"><span className="text-white/50">Bay</span><span className="text-white font-medium">{form.parkingFloor} · {form.parkingBay}</span></div>}
                  </div>
                  <div className="my-4 border-t border-white/10" />
                  <div className="flex justify-between items-end">
                    <span className="text-white/60">Total</span>
                    <span className="text-3xl font-bold text-white">₹{selectedPkg.price}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {selectedPkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-white/60 text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>

                  {paying ? (
                    <div className="mt-6 py-3 rounded-xl bg-brand/20 border border-brand/30 text-center">
                      <div className="inline-block w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-brand text-sm font-medium">Processing payment...</p>
                    </div>
                  ) : paymentSuccess ? (
                    <div className="mt-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-center animate-scale-in">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                      <p className="text-green-400 text-sm font-medium">Payment Successful!</p>
                    </div>
                  ) : (
                    <button
                      onClick={handlePay}
                      className="mt-6 w-full py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-brand/20"
                    >
                      <CreditCard className="w-5 h-5" /> Pay ₹{selectedPkg.price} & Book
                    </button>
                  )}
                  <p className="text-white/30 text-xs text-center mt-3">Simulated payment · No real charge</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2 mb-6 bg-navy-light p-1.5 rounded-xl w-fit">
              <button onClick={() => setView('home')} className="px-5 py-2.5 rounded-lg font-medium text-sm transition text-white/60 hover:text-white flex items-center gap-1.5">
                <HomeIcon className="w-4 h-4" /> Home
              </button>
              <button onClick={() => setView('book')} className="px-5 py-2.5 rounded-lg font-medium text-sm transition text-white/60 hover:text-white">
                Book a Wash
              </button>
              <button onClick={() => setView('track')} className="px-5 py-2.5 rounded-lg font-medium text-sm transition bg-brand text-white">
                My Bookings ({myBookings.length})
              </button>
            </div>

            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by car number or booking ID..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-light border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition"
                  />
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-20 bg-navy-light rounded-2xl border border-white/10">
                  <Car className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40">No bookings yet. Book your first wash!</p>
                  <button onClick={() => setView('book')} className="mt-4 px-5 py-2.5 rounded-xl bg-brand text-white font-medium text-sm hover:bg-brand-dark transition">
                    Book Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Success modal */}
      {lastBooking && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setLastBooking(null)}>
          <div className="bg-navy-light border border-white/10 rounded-2xl p-8 max-w-md w-full animate-scale-in relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLastBooking(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white text-center">Booking Confirmed!</h3>
            <p className="text-white/50 text-center text-sm mt-1">Your car wash is scheduled</p>
            <div className="mt-6 bg-navy rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/50">Booking ID</span><span className="text-white font-semibold">{lastBooking.id}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Car</span><span className="text-white">{lastBooking.carNumber}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Package</span><span className="text-white">{lastBooking.packageName}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Slot</span><span className="text-white">{lastBooking.timeSlot} · {lastBooking.date}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Payment</span><span className="text-green-400 font-medium">₹{lastBooking.price} Paid</span></div>
              <div className="flex justify-between"><span className="text-white/50">Ref</span><span className="text-white/70 text-xs">{lastBooking.paymentRef}</span></div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setLastBooking(null); setView('track'); }} className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-medium transition">
                Track Booking
              </button>
              <button onClick={() => setLastBooking(null)} className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Home Dashboard ---
function HomeDashboard({
  user, bookings, upcomingBookings, activeBooking, recentBookings, notifications, unreadNotifs,
  onBook, onTrack, onVehicles, onHistory, onProfile,
}: {
  user: User;
  bookings: Booking[];
  upcomingBookings: Booking[];
  activeBooking?: Booking;
  recentBookings: Booking[];
  notifications: { id: string; title: string; message: string; time: string; read: boolean }[];
  unreadNotifs: typeof notifications;
  onBook: () => void;
  onTrack: () => void;
  onVehicles: () => void;
  onHistory: () => void;
  onProfile: () => void;
}) {
  const vehicles = user.vehicles || [];
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const totalSpent = bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-white/50 mt-1">{user.office} · Your car, our care</p>
        </div>
        <button
          onClick={onBook}
          className="px-5 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition-all hover:scale-[1.02] flex items-center gap-2 shadow-lg shadow-brand/20"
        >
          <Plus className="w-5 h-5" /> Book a Wash
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Car} label="Vehicles" value={vehicles.length} color="text-brand" />
        <MiniStat icon={Calendar} label="Upcoming" value={upcomingBookings.length} color="text-amber-400" />
        <MiniStat icon={CheckCircle} label="Completed" value={completedCount} color="text-green-400" />
        <MiniStat icon={TrendingUp} label="Total Spent" value={`₹${totalSpent}`} color="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <ActionCard icon={Plus} title="Book a Wash" description="Choose a package and time" onClick={onBook} primary />
        <ActionCard icon={Search} title="Track Booking" description="Follow your wash progress" onClick={onTrack} />
        <ActionCard icon={Car} title="My Vehicles" description="Manage your registered cars" onClick={onVehicles} />
        <ActionCard icon={Calendar} title="Booking History" description="Review your past washes" onClick={onHistory} />
        <ActionCard icon={UserCircle} title="My Profile" description="Update your details" onClick={onProfile} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming + vehicle */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active booking with timeline */}
          {activeBooking ? (
            <div className="bg-gradient-to-br from-navy-light to-navy rounded-2xl border border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wide">Active Booking</p>
                  <p className="text-white font-bold text-xl mt-1">{activeBooking.carNumber}</p>
                  <p className="text-white/50 text-sm">{activeBooking.carModel} · {activeBooking.packageName}</p>
                </div>
                <StatusBadge status={activeBooking.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-sm">
                <div className="flex items-center gap-1.5 text-white/50"><Calendar className="w-4 h-4 flex-shrink-0" /> {activeBooking.date}</div>
                <div className="flex items-center gap-1.5 text-white/50"><Clock className="w-4 h-4 flex-shrink-0" /> {activeBooking.timeSlot}</div>
                <div className="flex items-center gap-1.5 text-white/50"><MapPin className="w-4 h-4 flex-shrink-0" /> {activeBooking.parkingFloor} · {activeBooking.parkingBay}</div>
              </div>
              <p className="text-white/50 text-sm mb-2">{activeBooking.office}</p>
              {activeBooking.parkingInstructions && <p className="text-white/40 text-sm mb-4">Note: {activeBooking.parkingInstructions}</p>}

              {/* Visual timeline */}
              <p className="text-white/40 text-xs font-medium uppercase tracking-wide mb-3">Progress</p>
              <div className="flex items-center justify-between">
                {TIMELINE_STEPS.map((step, i) => {
                  const currentIdx = getTimelineIndex(activeBooking.status);
                  const done = i < currentIdx;
                  const current = i === currentIdx;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-0.5 ${done ? 'bg-brand' : 'bg-white/10'}`} />
                      )}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${done ? 'bg-brand' : current ? 'bg-brand/30 border-2 border-brand' : 'bg-white/5 border border-white/10'}`}>
                        {done && <Check className="w-4 h-4 text-white" />}
                        {current && <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />}
                      </div>
                      <p className={`text-[10px] text-center mt-1.5 font-medium ${done || current ? 'text-white' : 'text-white/30'}`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>

              {activeBooking.workerName && (
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand font-semibold text-sm">
                    {activeBooking.workerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Assigned Worker</p>
                    <p className="text-white text-sm font-medium">{activeBooking.workerName}</p>
                  </div>
                </div>
              )}

              <button onClick={onTrack} className="mt-4 text-brand text-sm font-medium hover:text-brand-light transition flex items-center gap-1">
                View all bookings <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-navy-light rounded-2xl border border-white/10 p-8 text-center">
              <Car className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No active bookings right now.</p>
              <button onClick={onBook} className="mt-4 px-5 py-2.5 rounded-xl bg-brand text-white font-medium text-sm hover:bg-brand-dark transition inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Book a Wash
              </button>
            </div>
          )}

          {/* Registered vehicle */}
          <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-brand" /> Your Vehicle{vehicles.length !== 1 ? 's' : ''}
            </h3>
            {vehicles.length === 0 ? (
              <p className="text-white/40 text-sm">No vehicles registered yet. Add one from your profile.</p>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 p-4 rounded-xl bg-navy border border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center">
                      <Car className="w-6 h-6 text-brand" />
                    </div>
                    <div>
                      <p className="text-white font-bold">{v.number}</p>
                      <p className="text-white/50 text-sm">{v.model}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">Registered</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Recent Bookings</h3>
              <button onClick={onTrack} className="text-brand text-sm font-medium hover:text-brand-light transition">View all</button>
            </div>
            {recentBookings.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">No bookings yet.</p>
            ) : (
              <div className="space-y-2">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
                        <Car className="w-4 h-4 text-brand" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{b.carNumber} · {b.id}</p>
                        <p className="text-white/40 text-xs">{b.packageName} · {b.date}</p>
                        <p className="text-white/35 text-xs mt-0.5">{b.office} · {b.parkingFloor} · {b.parkingBay}</p>
                        {b.parkingInstructions && <p className="text-white/35 text-xs mt-0.5">Note: {b.parkingInstructions}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-sm font-medium">₹{b.price}</span>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications */}
        <div className="lg:col-span-1">
          <div className="bg-navy-light rounded-2xl border border-white/10 p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand" /> Notifications
              </h3>
              {unreadNotifs.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand text-white text-xs font-bold">{unreadNotifs.length}</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">No notifications yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-xl border transition ${!n.read ? 'bg-brand/5 border-brand/20' : 'bg-navy border-white/5'}`}>
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-white/30 text-xs mt-1">{new Date(n.time).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: typeof Car; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-navy-light rounded-xl border border-white/10 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-white/40 text-xs">{label}</p>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick, primary = false }: {
  icon: typeof Car;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[112px] rounded-2xl border p-4 text-left transition flex items-center gap-3 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand ${primary ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20 hover:bg-brand-dark' : 'bg-navy-light border-white/10 text-white hover:border-brand/40'}`}
    >
      <span className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${primary ? 'bg-white/15' : 'bg-brand/15'}`}>
        <Icon className={`w-5 h-5 ${primary ? 'text-white' : 'text-brand'}`} />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold">{title}</span>
        <span className={`block text-xs mt-1 ${primary ? 'text-white/75' : 'text-white/45'}`}>{description}</span>
      </span>
      <ArrowRight className={`w-4 h-4 ml-auto flex-shrink-0 ${primary ? 'text-white/75' : 'text-white/30'}`} />
    </button>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-navy-light rounded-2xl border border-white/10 p-5 hover:border-brand/30 transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-bold text-lg">{booking.carNumber}</p>
          <p className="text-white/40 text-sm">{booking.carModel}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-white/50"><Calendar className="w-4 h-4" /> {booking.date}</div>
        <div className="flex items-center gap-2 text-white/50"><Clock className="w-4 h-4" /> {booking.timeSlot}</div>
        <div className="flex items-center gap-2 text-white/50 min-w-0"><MapPin className="w-4 h-4 flex-shrink-0" /> {booking.parkingFloor} · {booking.parkingBay}</div>
        <div className="flex items-center gap-2 text-white/50 min-w-0"><Building2 className="w-4 h-4 flex-shrink-0" /> {booking.office}</div>
      </div>
      {booking.parkingInstructions && <p className="mt-3 text-white/40 text-sm">Parking note: {booking.parkingInstructions}</p>}
      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
        <div>
          <p className="text-white/40 text-xs">Package</p>
          <p className="text-white font-medium text-sm">{booking.packageName} · ₹{booking.price}</p>
        </div>
        {booking.workerName && (
          <div className="text-right">
            <p className="text-white/40 text-xs">Worker</p>
            <p className="text-white font-medium text-sm">{booking.workerName}</p>
          </div>
        )}
      </div>
      {/* Timeline */}
      <div className="mt-4 flex items-center gap-1">
        {booking.timeline.map((t, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={`w-2.5 h-2.5 rounded-full ${i === booking.timeline.length - 1 ? 'bg-brand' : 'bg-brand/40'}`} />
            {i < booking.timeline.length - 1 && <div className="flex-1 h-0.5 bg-brand/20 mx-1" />}
          </div>
        ))}
      </div>
      <p className="text-white/40 text-xs mt-2">Current: {STATUS_LABELS[booking.status]}</p>
    </div>
  );
}
