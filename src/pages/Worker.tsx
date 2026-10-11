import { useEffect, useRef, useState } from 'react';
import { Car, MapPin, Clock, Key, PlayCircle, CheckCircle, ArrowLeftRight, Search, Wrench, Star, X } from 'lucide-react';
import type { User, Booking } from '@/types';
import { PACKAGES } from '@/types';
import { completeWorkerBooking, getBookings, getUsers, updateBookingStatus } from '@/store';
import { useStoreData } from '@/hooks/useStoreData';
import { useToast } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';

interface WorkerProps {
  user: User;
  initialView?: 'home' | 'jobs';
}

export default function WorkerPage({ user, initialView = 'home' }: WorkerProps) {
  const { toast } = useToast();
  const [bookings, refresh] = useStoreData(getBookings);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('active');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [confirmCompletion, setConfirmCompletion] = useState<Booking | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const jobsRef = useRef<HTMLDivElement>(null);
  const users = getUsers();

  useEffect(() => {
    if (initialView === 'jobs') jobsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [initialView]);

  const myJobs = bookings.filter((b) => b.workerId === user.id);
  const filtered = myJobs.filter((b) => {
    if (filter === 'active' && (b.status === 'completed' || b.status === 'cancelled')) return false;
    if (filter === 'done' && b.status !== 'completed' && b.status !== 'cancelled') return false;
    return b.carNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
  });

  const activeCount = myJobs.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').length;
  const doneCount = myJobs.filter((b) => b.status === 'completed').length;

  const handleAction = (booking: Booking) => {
    const flow: Record<string, { next: Booking['status']; label: string; toast: string }> = {
      keys_collected: { next: 'washing', label: 'Start Wash', toast: 'Wash started' },
      washing: { next: 'washed', label: 'Complete Wash', toast: 'Wash completed' },
      washed: { next: 'keys_returned', label: 'Return Keys', toast: 'Keys returned to security' },
    };
    const action = flow[booking.status];
    if (!action) return;
    if (booking.workerId !== user.id) {
      toast('You can only update jobs assigned to you.', 'error');
      return;
    }
    try {
      updateBookingStatus(booking.id, action.next);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to update this job.', 'error');
      return;
    }
    toast(action.toast, 'success');
    refresh();
    setSelected({ ...booking, status: action.next });
  };

  const handleConfirmCompletion = async () => {
    if (!confirmCompletion || completingId) return;
    const booking = confirmCompletion;
    setCompletingId(booking.id);
    try {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      completeWorkerBooking(booking.id);
      refresh();
      setSelected(null);
      setConfirmCompletion(null);
      toast(`Booking ${booking.id} marked as completed.`, 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to complete this booking.', 'error');
    } finally {
      setCompletingId(null);
    }
  };

  const currentBookings = getBookings();
  const updatedSelected = selected ? currentBookings.find((b) => b.id === selected.id) || selected : null;

  return (
    <div className="min-h-screen bg-navy pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold text-white">Worker Dashboard</h1>
          <p className="text-white/50 mt-1">{user.name} · {user.phone}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={Wrench} label="Active Jobs" value={activeCount} color="text-brand" />
          <StatCard icon={CheckCircle} label="Completed" value={doneCount} color="text-green-400" />
          <StatCard icon={Star} label="Rating" value="4.8" color="text-yellow-400" />
        </div>

        {/* Filters */}
        <div ref={jobsRef} id="worker-jobs" className="scroll-mt-24">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by car number or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-light border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition"
            />
          </div>
          <div className="flex gap-2 bg-navy-light p-1.5 rounded-xl">
            {(['active', 'done', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition capitalize ${filter === f ? 'bg-brand text-white' : 'text-white/60 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-navy-light rounded-2xl border border-white/10">
            <Car className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No jobs assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((b) => (
              <JobCard
                key={b.id}
                booking={b}
                customerPhone={users.find((candidate) => candidate.id === b.employeeId)?.phone}
                packageFeatures={PACKAGES.find((washPackage) => washPackage.id === b.packageId)?.features ?? []}
                onAction={handleAction}
                onComplete={() => setConfirmCompletion(b)}
                onOpen={() => setSelected(b)}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Detail modal */}
      {updatedSelected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setSelected(null)}>
          <div className="bg-navy-light border border-white/10 rounded-2xl p-6 max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-brand text-xs font-semibold uppercase tracking-wide">{updatedSelected.id}</p>
                <h3 className="text-xl font-bold text-white mt-1">{updatedSelected.carNumber}</h3>
                <p className="text-white/50 text-sm">{updatedSelected.employeeName} · {updatedSelected.carModel}</p>
                {users.find((candidate) => candidate.id === updatedSelected.employeeId)?.phone && (
                  <p className="text-white/40 text-sm mt-1">Customer contact: {users.find((candidate) => candidate.id === updatedSelected.employeeId)?.phone}</p>
                )}
              </div>
              <StatusBadge status={updatedSelected.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <InfoRow icon={Car} label="Vehicle" value={updatedSelected.carModel} />
              <InfoRow icon={Car} label="Package" value={updatedSelected.packageName} />
              <InfoRow icon={MapPin} label="Office" value={updatedSelected.office} />
              <InfoRow icon={MapPin} label="Floor" value={updatedSelected.parkingFloor} />
              <InfoRow icon={MapPin} label="Bay" value={updatedSelected.parkingBay} />
              <InfoRow icon={Clock} label="Booking time" value={`${updatedSelected.timeSlot} · ${updatedSelected.date}`} />
            </div>
            {updatedSelected.completedAt && (
              <p className="text-green-300 text-sm mb-4">
                Completed {new Date(updatedSelected.completedAt).toLocaleString('en-IN')}
              </p>
            )}
            {updatedSelected.parkingInstructions && (
              <p className="text-white/60 text-sm mb-4"><span className="text-white/40">Parking instructions:</span> {updatedSelected.parkingInstructions}</p>
            )}
            {(PACKAGES.find((washPackage) => washPackage.id === updatedSelected.packageId)?.features ?? []).length > 0 && (
              <div className="mb-4">
                <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">Package services</h4>
                <p className="text-white/45 text-sm">{PACKAGES.find((washPackage) => washPackage.id === updatedSelected.packageId)?.features.join(' · ')}</p>
              </div>
            )}

            {/* Timeline */}
            <h4 className="text-white font-semibold text-sm mb-3">Timeline</h4>
            <div className="space-y-3 mb-4">
              {updatedSelected.timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${i === updatedSelected.timeline.length - 1 ? 'bg-brand' : 'bg-brand/40'}`} />
                  <div>
                    <p className="text-white text-sm font-medium">{t.label}</p>
                    <p className="text-white/40 text-xs">{new Date(t.time).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action button */}
            {updatedSelected.status !== 'completed' && updatedSelected.status !== 'cancelled' && (
              <div className="space-y-2">
                {updatedSelected.status === 'keys_collected' && (
                  <button onClick={() => handleAction(updatedSelected)} className="w-full py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition flex items-center justify-center gap-2">
                    <PlayCircle className="w-5 h-5" /> Start Wash
                  </button>
                )}
                {updatedSelected.status === 'washing' && (
                  <button onClick={() => handleAction(updatedSelected)} className="w-full py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Complete Wash
                  </button>
                )}
                {updatedSelected.status === 'washed' && (
                  <button onClick={() => handleAction(updatedSelected)} className="w-full py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition flex items-center justify-center gap-2">
                    <ArrowLeftRight className="w-5 h-5" /> Return Keys to Security
                  </button>
                )}
                <button
                  onClick={() => setConfirmCompletion(updatedSelected)}
                  disabled={!canCompleteWash(updatedSelected) || completingId === updatedSelected.id}
                  className="w-full min-h-12 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-900/30 disabled:text-white/35 disabled:cursor-not-allowed text-white font-semibold transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Mark Wash as Completed
                </button>
                {!canCompleteWash(updatedSelected) && <p className="text-white/40 text-xs text-center">Finish washing and return the keys before completing this job.</p>}
              </div>
            )}
            <button onClick={() => setSelected(null)} className="mt-3 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-medium transition">
              Close
            </button>
          </div>
        </div>
      )}

      {confirmCompletion && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => completingId === null && setConfirmCompletion(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-dialog-title"
            className="w-full max-w-md bg-navy-light border border-white/10 rounded-2xl p-6 shadow-2xl animate-scale-in"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="w-11 h-11 rounded-xl bg-green-500/15 border border-green-400/20 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <h2 id="completion-dialog-title" className="text-xl font-bold text-white">Confirm wash completion</h2>
              </div>
              <button
                type="button"
                aria-label="Close confirmation"
                disabled={completingId !== null}
                onClick={() => setConfirmCompletion(null)}
                className="w-10 h-10 rounded-lg text-white/45 hover:text-white hover:bg-white/5 disabled:opacity-40 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/55 text-sm mt-4">Confirm that washing has actually finished for this vehicle.</p>
            <div className="mt-4 rounded-xl bg-navy border border-white/10 p-4 space-y-2">
              <p className="text-white/45 text-xs">BOOKING ID</p>
              <p className="text-white font-semibold">{confirmCompletion.id}</p>
              <p className="text-white/45 text-xs pt-2">VEHICLE</p>
              <p className="text-white font-semibold">{confirmCompletion.carNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                disabled={completingId !== null}
                onClick={() => setConfirmCompletion(null)}
                className="min-h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={completingId !== null}
                onClick={handleConfirmCompletion}
                className="min-h-12 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {completingId === confirmCompletion.id
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Completing...</>
                  : 'Confirm Completion'}
              </button>
            </div>
          </section>
        </div>
      )}
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
    <div className="flex min-w-0 items-start gap-2 text-white/50">
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span className="text-white/40 text-xs flex-shrink-0">{label}:</span>
      <span className="min-w-0 break-words text-white text-sm font-medium">{value}</span>
    </div>
  );
}

function canCompleteWash(booking: Booking): boolean {
  return booking.status === 'keys_returned';
}

function JobCard({ booking, customerPhone, packageFeatures, onAction, onComplete, onOpen }: {
  booking: Booking;
  customerPhone?: string;
  packageFeatures: string[];
  onAction: (b: Booking) => void;
  onComplete: () => void;
  onOpen: () => void;
}) {
  const actionLabel: Record<string, string> = {
    keys_collected: 'Start Wash',
    washing: 'Complete Wash',
    washed: 'Return Keys',
  };
  const actionIcon: Record<string, typeof Key> = {
    keys_collected: PlayCircle,
    washing: CheckCircle,
    washed: ArrowLeftRight,
  };

  return (
    <div className="bg-navy-light rounded-2xl border border-white/10 p-5 hover:border-brand/30 transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-brand text-xs font-semibold uppercase tracking-wide">{booking.id}</p>
          <p className="text-white font-bold text-lg mt-1">{booking.carNumber}</p>
          <p className="text-white/50 text-sm">{booking.employeeName} · {booking.carModel}</p>
          {customerPhone && <p className="text-white/35 text-xs mt-1">Contact: {customerPhone}</p>}
        </div>
        <span className="flex-shrink-0"><StatusBadge status={booking.status} /></span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <InfoRow icon={MapPin} label="Office" value={booking.office} />
        <InfoRow icon={MapPin} label="Floor" value={booking.parkingFloor} />
        <InfoRow icon={MapPin} label="Bay" value={booking.parkingBay} />
        <InfoRow icon={Clock} label="Time" value={`${booking.timeSlot} · ${booking.date}`} />
        <InfoRow icon={Car} label="Package" value={booking.packageName} />
      </div>
      {packageFeatures.length > 0 && <p className="text-white/35 text-xs mb-3">{packageFeatures.join(' · ')}</p>}
      {booking.completedAt && (
        <p className="text-green-300 text-xs mb-3">Completed {new Date(booking.completedAt).toLocaleString('en-IN')}</p>
      )}
      {booking.parkingInstructions && <p className="mb-3 text-white/40 text-sm">Note: {booking.parkingInstructions}</p>}
      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
        <button onClick={onOpen} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 font-medium text-sm transition">
          View Details
        </button>
        {actionLabel[booking.status] && (() => {
          const Icon = actionIcon[booking.status];
          return (
            <button
              onClick={() => onAction(booking)}
              className="flex-1 py-2 rounded-lg bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition flex items-center justify-center gap-1.5"
            >
              <Icon className="w-4 h-4" /> {actionLabel[booking.status]}
            </button>
          );
        })()}
      </div>
      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <>
          <button
            onClick={onComplete}
            disabled={!canCompleteWash(booking)}
            className="w-full min-h-12 mt-3 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-green-900/30 disabled:text-white/35 disabled:cursor-not-allowed text-white font-semibold transition flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Mark Wash as Completed
          </button>
          {!canCompleteWash(booking) && <p className="text-white/40 text-xs text-center mt-2">Finish washing and return the keys before completing this job.</p>}
        </>
      )}
    </div>
  );
}
