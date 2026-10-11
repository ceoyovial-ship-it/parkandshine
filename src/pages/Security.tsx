import { useEffect, useRef, useState } from 'react';
import { Search, Key, KeyRound, ShieldCheck, Car, MapPin, Clock, User as UserIcon, CheckCircle, X } from 'lucide-react';
import type { User, Booking } from '@/types';
import { getBookings, updateBookingStatus } from '@/store';
import { useStoreData } from '@/hooks/useStoreData';
import { useToast } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';

interface SecurityProps {
  user: User;
  focusVerify?: boolean;
}

export default function SecurityPage({ user, focusVerify = false }: SecurityProps) {
  const { toast } = useToast();
  const [bookings, refresh] = useStoreData(getBookings);
  const [search, setSearch] = useState('');
  const [verifyId, setVerifyId] = useState('');
  const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);
  const verifySectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusVerify) verifySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusVerify]);

  const activeBookings = bookings.filter((b) =>
    b.status !== 'cancelled' && b.status !== 'completed'
  );

  const searchResults = search
    ? bookings.filter((b) =>
        b.id.toLowerCase().includes(search.toLowerCase()) ||
        b.carNumber.toLowerCase().includes(search.toLowerCase())
      )
    : activeBookings;

  const handleVerify = () => {
    const booking = bookings.find((b) => b.id.toLowerCase() === verifyId.trim().toLowerCase());
    if (!booking) {
      toast('Booking not found', 'error');
      return;
    }
    setVerifiedBooking(booking);
    toast(`Booking ${booking.id} verified — ${booking.carNumber}`, 'success');
  };

  const handleKeyAction = (booking: Booking, action: 'collect' | 'return') => {
    try {
      if (action === 'collect') {
        updateBookingStatus(booking.id, 'keys_collected');
        toast(`Keys collected for ${booking.carNumber}`, 'success');
      } else {
        updateBookingStatus(booking.id, 'keys_returned');
        toast(`Keys returned for ${booking.carNumber}`, 'success');
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to update this key handover.', 'error');
      return;
    }
    refresh();
    setVerifiedBooking(null);
    setVerifyId('');
  };

  const stats = {
    pending: activeBookings.filter((b) => b.status === 'booked' || b.status === 'assigned').length,
    inProgress: activeBookings.filter((b) => b.status === 'keys_collected' || b.status === 'washing' || b.status === 'washed').length,
    today: bookings.filter((b) => b.date === new Date().toISOString().split('T')[0]).length,
  };

  return (
    <div className="min-h-screen bg-navy pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-white">Security Checkpoint</h1>
          <p className="text-white/50 mt-1">{user.name} · Verify bookings & manage key handover</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <StatCard icon={ShieldCheck} label="Pending Verification" value={stats.pending} color="text-blue-400" />
          <StatCard icon={Key} label="Keys In Custody" value={stats.inProgress} color="text-amber-400" />
          <StatCard icon={Car} label="Today's Bookings" value={stats.today} color="text-green-400" />
        </div>

        {/* Verify section */}
        <div ref={verifySectionRef} id="verify-booking" className="scroll-mt-24 bg-navy-light rounded-2xl border border-white/10 p-6 mb-8">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand" /> Verify Booking
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="Enter Booking ID (e.g. BK001)"
              className="w-full min-w-0 flex-1 px-4 py-3 rounded-xl bg-navy border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition"
            />
            <button
              onClick={handleVerify}
              className="w-full sm:w-auto justify-center px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition flex items-center gap-2"
            >
              <Search className="w-5 h-5" /> Verify
            </button>
          </div>
        </div>

        {/* Verified booking detail */}
        {verifiedBooking && (
          <div className="bg-gradient-to-br from-brand/10 to-navy-light rounded-2xl border border-brand/30 p-6 mb-8 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-brand" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Verified: {verifiedBooking.id}</p>
                  <p className="text-white/50 text-sm">Booking confirmed in system</p>
                </div>
              </div>
              <button onClick={() => { setVerifiedBooking(null); setVerifyId(''); }} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
              <InfoRow icon={Car} label="Car" value={verifiedBooking.carNumber} />
              <InfoRow icon={UserIcon} label="Employee" value={verifiedBooking.employeeName} />
              <InfoRow icon={MapPin} label="Location" value={`${verifiedBooking.parkingFloor}·${verifiedBooking.parkingBay}`} />
              <InfoRow icon={Clock} label="Slot" value={verifiedBooking.timeSlot} />
              <InfoRow icon={ShieldCheck} label="Worker" value={verifiedBooking.workerName || 'Not assigned'} />
              <InfoRow icon={Car} label="Package" value={verifiedBooking.packageName} />
              <InfoRow icon={MapPin} label="Office" value={verifiedBooking.office} />
              <div className="flex items-center gap-2"><StatusBadge status={verifiedBooking.status} /></div>
            </div>
            {verifiedBooking.parkingInstructions && (
              <p className="text-white/60 text-sm mb-3"><span className="text-white/40">Parking instructions:</span> {verifiedBooking.parkingInstructions}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/45 mb-4">
              {verifiedBooking.keyCollectionTime && <p>Keys collected: {new Date(verifiedBooking.keyCollectionTime).toLocaleString('en-IN')}</p>}
              {verifiedBooking.washStartTime && <p>Wash started: {new Date(verifiedBooking.washStartTime).toLocaleString('en-IN')}</p>}
              {verifiedBooking.washCompleteTime && <p>Wash completed: {new Date(verifiedBooking.washCompleteTime).toLocaleString('en-IN')}</p>}
              {verifiedBooking.keyReturnTime && <p>Keys returned: {new Date(verifiedBooking.keyReturnTime).toLocaleString('en-IN')}</p>}
            </div>

            {/* Key actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-white/10">
              {verifiedBooking.status === 'assigned' && (
                <button
                  onClick={() => handleKeyAction(verifiedBooking, 'collect')}
                  className="flex-1 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-semibold transition flex items-center justify-center gap-2"
                >
                  <Key className="w-5 h-5" /> Record Key Collection
                </button>
              )}
              {verifiedBooking.status === 'washed' && (
                <button
                  onClick={() => handleKeyAction(verifiedBooking, 'return')}
                  className="flex-1 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 font-semibold transition flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-5 h-5" /> Record Key Return
                </button>
              )}
              {(verifiedBooking.status === 'booked' || verifiedBooking.status === 'completed' || verifiedBooking.status === 'cancelled') && (
                <p className="text-white/40 text-sm text-center w-full py-2">
                  {verifiedBooking.status === 'booked' && 'Waiting for worker assignment before key collection.'}
                  {verifiedBooking.status === 'completed' && 'This booking is fully completed.'}
                  {verifiedBooking.status === 'cancelled' && 'This booking was cancelled.'}
                </p>
              )}
              {(verifiedBooking.status === 'keys_collected' || verifiedBooking.status === 'washing') && (
                <p className="text-white/40 text-sm text-center w-full py-2">
                  Keys already collected. Wash in progress — return keys after wash completion.
                </p>
              )}
              {verifiedBooking.status === 'keys_returned' && (
                <p className="text-white/40 text-sm text-center w-full py-2">
                  Keys returned. Awaiting completion confirmation.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Search & list */}
        <div className="w-full mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by booking ID or car number..."
              className="w-full min-w-0 pl-10 pr-4 py-3 rounded-xl bg-navy-light border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-navy-light rounded-2xl border border-white/10">
              <ShieldCheck className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No bookings found.</p>
            </div>
          ) : (
            searchResults.map((b) => (
              <div key={b.id} className="bg-navy-light rounded-2xl border border-white/10 p-5 hover:border-brand/30 transition">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-white font-bold">{b.carNumber}</p>
                    <p className="text-white/40 text-sm break-words">{b.id} · {b.employeeName}</p>
                  </div>
                  <span className="flex-shrink-0"><StatusBadge status={b.status} /></span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start gap-2 text-white/50 break-words"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" /> {b.office} · {b.parkingFloor} · {b.parkingBay}</div>
                  <div className="flex items-center gap-2 text-white/50"><Clock className="w-4 h-4 flex-shrink-0" /> {b.timeSlot} · {b.date}</div>
                  {b.parkingInstructions && <p className="text-white/40 pl-6">Note: {b.parkingInstructions}</p>}
                  {b.workerName && <div className="flex items-center gap-2 text-white/50"><ShieldCheck className="w-4 h-4" /> {b.workerName}</div>}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                  {b.status === 'assigned' && (
                    <button onClick={() => { setVerifiedBooking(b); }} className="flex-1 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-medium text-sm transition flex items-center justify-center gap-1.5">
                      <Key className="w-4 h-4" /> Collect Keys
                    </button>
                  )}
                  {b.status === 'washed' && (
                    <button onClick={() => { setVerifiedBooking(b); }} className="flex-1 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium text-sm transition flex items-center justify-center gap-1.5">
                      <KeyRound className="w-4 h-4" /> Return Keys
                    </button>
                  )}
                  <button
                    onClick={() => setVerifiedBooking(b)}
                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 font-medium text-sm transition"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Car; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-navy-light rounded-2xl border border-white/10 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-white/40 text-xs">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Car; label: string; value: string }) {
  return (
    <div className="min-w-0 flex items-center gap-2 text-white/50">
      <Icon className="w-4 h-4" />
      <span className="text-white/40 text-xs">{label}:</span>
      <span className="min-w-0 break-words text-white text-sm font-medium">{value}</span>
    </div>
  );
}
