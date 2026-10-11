import { useState } from 'react';
import {
  LayoutDashboard, Calendar, Users, Clock, IndianRupee, Search, Trash2, X, MoreHorizontal,
  Car, TrendingUp, CheckCircle, UserPlus, Plus, Minus, Star, Phone, Mail, MapPin,
} from 'lucide-react';
import type { User, Booking, Worker, TimeSlot } from '@/types';
import { PACKAGES, STATUS_LABELS } from '@/types';
import {
  getBookings, deleteBooking, assignWorker, getWorkers, saveWorker, deleteWorker,
  getSlots, saveSlots, getPrices, savePrices, getUsers, getNotifications,
  loadWorkflowDemoBookings, resetWorkflowDemoBookings,
} from '@/store';
import { useStoreData } from '@/hooks/useStoreData';
import { useToast } from '@/components/Toast';
import StatusBadge from '@/components/StatusBadge';

interface AdminProps {
  user: User;
  initialTab?: Tab;
  onNavigate: (page: string) => void;
}

type Tab = 'dashboard' | 'bookings' | 'staff' | 'slots' | 'prices';

export default function AdminPage({ user, initialTab = 'dashboard', onNavigate }: AdminProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [showMore, setShowMore] = useState(false);
  const [bookings, refreshBookings] = useStoreData(getBookings);
  const [workers, refreshWorkers] = useStoreData(getWorkers);
  const [slots, refreshSlots] = useStoreData(getSlots);
  const [prices, refreshPrices] = useStoreData(getPrices);
  const [notifications] = useStoreData(() => getNotifications(user.id));
  const [assignFor, setAssignFor] = useState<Booking | null>(null);
  const [demoAction, setDemoAction] = useState<'load' | 'reset' | null>(null);
  const users = getUsers();

  const handleLoadDemoData = () => {
    setDemoAction('load');
    try {
      const result = loadWorkflowDemoBookings();
      refreshBookings();
      if (result.created.length) {
        toast(`Loaded demo bookings: ${result.created.join(', ')}.${result.skipped.length ? ` Already present or skipped: ${result.skipped.join(', ')}.` : ''}`, 'success');
      } else {
        toast(`No new bookings loaded. Already present or skipped: ${result.skipped.join(', ')}.`, 'info');
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to load demo bookings.', 'error');
    } finally {
      setDemoAction(null);
    }
  };

  const handleResetDemoData = () => {
    if (!window.confirm('Remove only ParkShine workflow demo bookings (BK005–BK007) and their notifications? Other bookings and accounts will be kept.')) return;
    setDemoAction('reset');
    try {
      const removed = resetWorkflowDemoBookings();
      refreshBookings();
      toast(removed.length ? `Removed seeded demo bookings: ${removed.join(', ')}.` : 'No seeded demo bookings to reset.', removed.length ? 'success' : 'info');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to reset demo bookings.', 'error');
    } finally {
      setDemoAction(null);
    }
  };

  const handleAssign = (workerId: string) => {
    if (!assignFor) return;
    try {
      const assigned = assignWorker(assignFor.id, workerId);
      toast(`${assigned.workerName} assigned to ${assigned.id}`, 'success');
      refreshBookings();
      setAssignFor(null);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to assign this booking.', 'error');
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'slots', label: 'Slots', icon: Clock },
    { id: 'prices', label: 'Prices', icon: IndianRupee },
  ];

  const selectTab = (nextTab: Tab) => {
    setTab(nextTab);
    setShowMore(false);
    onNavigate(nextTab === 'dashboard' ? 'admin' : `admin-${nextTab}`);
  };

  return (
    <div className="min-h-screen bg-navy pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between gap-3 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {tab === 'dashboard' ? 'Admin Dashboard' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </h1>
            <p className="text-white/50 mt-1">{user.name} · {tab === 'dashboard' ? 'Full system overview & management' : 'Admin management'}</p>
          </div>
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setShowMore((open) => !open)}
              aria-expanded={showMore}
              className="flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-navy-light px-3 text-sm font-medium text-white/80"
            >
              <MoreHorizontal className="h-4 w-4" /> More
            </button>
            {showMore && (
              <div className="absolute right-0 top-full z-30 mt-2 min-w-36 overflow-hidden rounded-xl border border-white/10 bg-navy-light shadow-xl">
                <button type="button" onClick={() => selectTab('slots')} className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5">Slots</button>
                <button type="button" onClick={() => selectTab('prices')} className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5">Prices</button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="hidden md:flex gap-2 mb-6 bg-navy-light p-1.5 rounded-xl overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTab(t.id)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition flex items-center gap-2 whitespace-nowrap ${tab === t.id ? 'bg-brand text-white' : 'text-white/60 hover:text-white'}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <Dashboard
            bookings={bookings}
            workers={workers}
            users={users}
            notifications={notifications}
            onAssign={setAssignFor}
            onLoadDemo={handleLoadDemoData}
            onResetDemo={handleResetDemoData}
            demoAction={demoAction}
          />
        )}
        {tab === 'bookings' && <BookingsTab bookings={bookings} users={users} onRefresh={refreshBookings} toast={toast} onAssign={setAssignFor} />}
        {tab === 'staff' && <StaffTab workers={workers} onRefresh={refreshWorkers} toast={toast} />}
        {tab === 'slots' && <SlotsTab slots={slots} onRefresh={refreshSlots} />}
        {tab === 'prices' && <PricesTab prices={prices} onRefresh={refreshPrices} toast={toast} />}
      </div>
      {assignFor && (
        <AssignmentModal
          booking={assignFor}
          workers={workers.filter((worker) => worker.active)}
          users={users}
          onCancel={() => setAssignFor(null)}
          onConfirm={handleAssign}
        />
      )}
    </div>
  );
}

// --- Dashboard ---
function Dashboard({ bookings, workers, users, notifications, onAssign, onLoadDemo, onResetDemo, demoAction }: {
  bookings: Booking[];
  workers: Worker[];
  users: User[];
  notifications: ReturnType<typeof getNotifications>;
  onAssign: (booking: Booking) => void;
  onLoadDemo: () => void;
  onResetDemo: () => void;
  demoAction: 'load' | 'reset' | null;
}) {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === today);
  const revenue = bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0);
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const active = bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;

  const statusBreakdown = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    key,
    label,
    count: bookings.filter((b) => b.status === key).length,
  })).filter((s) => s.count > 0);

  return (
    <div className="animate-fade-in space-y-6">
      {import.meta.env.DEV && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4">
          <div>
            <p className="text-white font-semibold text-sm">Workflow demo data</p>
            <p className="text-white/45 text-xs mt-1">Seeds only BK005–BK007. Reset removes only records created by this seed.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onLoadDemo}
              disabled={demoAction !== null}
              className="min-h-10 px-4 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-50 text-white text-sm font-semibold"
            >
              {demoAction === 'load' ? 'Loading...' : 'Load Demo Data'}
            </button>
            <button
              onClick={onResetDemo}
              disabled={demoAction !== null}
              className="min-h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white/75 text-sm font-medium"
            >
              {demoAction === 'reset' ? 'Resetting...' : 'Reset Demo Data'}
            </button>
          </div>
        </div>
      )}
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Car} label="Total Bookings" value={bookings.length} color="text-brand" />
        <StatCard icon={TrendingUp} label="Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} color="text-green-400" />
        <StatCard icon={CheckCircle} label="Completed" value={completed} color="text-teal-400" />
        <StatCard icon={Clock} label="Active" value={active} color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {statusBreakdown.map((s) => (
              <div key={s.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">{s.label}</span>
                  <span className="text-white font-medium">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${(s.count / bookings.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick info */}
        <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">System Overview</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoBox label="Today's Bookings" value={todayBookings.length} />
            <InfoBox label="Active Workers" value={workers.filter((w) => w.active).length} />
            <InfoBox label="Registered Customers" value={users.filter((registeredUser) => registeredUser.role === 'employee').length} />
            <InfoBox label="Cancelled" value={cancelled} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-white font-semibold">Unassigned bookings</h3>
            <span className="text-amber-300 text-sm">{bookings.filter((booking) => booking.status === 'booked' && !booking.workerId).length} need action</span>
          </div>
          <div className="space-y-3">
            {bookings.filter((booking) => booking.status === 'booked' && !booking.workerId).slice(0, 4).map((booking) => (
              <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-navy border border-white/5 p-3">
                <div>
                  <p className="text-white text-sm font-semibold">{booking.id} · {booking.carNumber}</p>
                  <p className="text-white/45 text-xs mt-1">{booking.employeeName} · {booking.office}, {booking.parkingFloor} {booking.parkingBay}</p>
                </div>
                <button onClick={() => onAssign(booking)} className="min-h-10 px-3 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand text-sm font-semibold">
                  Assign Worker
                </button>
              </div>
            ))}
            {bookings.every((booking) => booking.status !== 'booked' || !!booking.workerId) && (
              <p className="text-white/40 text-sm py-3">No unassigned bookings require action.</p>
            )}
          </div>
        </div>
        <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Recent operational updates</h3>
          <div className="space-y-3">
            {bookings.filter((booking) => booking.status === 'assigned' || booking.status === 'completed').slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-start justify-between gap-3 rounded-xl bg-navy border border-white/5 p-3">
                <div>
                  <p className="text-white text-sm font-medium">{booking.id} · {booking.carNumber}</p>
                  <p className="text-white/45 text-xs mt-1">{booking.status === 'completed' ? `Completed ${booking.completedAt ? new Date(booking.completedAt).toLocaleString('en-IN') : ''}` : `Assigned to ${booking.workerName || 'worker'} · ${booking.assignedAt ? new Date(booking.assignedAt).toLocaleString('en-IN') : ''}`}</p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
            {bookings.filter((booking) => booking.status === 'assigned' || booking.status === 'completed').length === 0 && (
              <p className="text-white/40 text-sm">No assignments or completions yet.</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-white/70 text-sm font-medium mb-2">Recent completion notifications</h4>
            {notifications.filter((notification) => notification.title === 'Car Wash Completed').slice(0, 3).map((notification) => (
              <p key={notification.id} className="text-white/45 text-xs py-1">{notification.message} · {new Date(notification.time).toLocaleString('en-IN')}</p>
            ))}
            {notifications.every((notification) => notification.title !== 'Car Wash Completed') && (
              <p className="text-white/35 text-xs">No completion notifications yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-navy-light rounded-2xl border border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Recent Bookings</h3>
        <div className="space-y-2">
          {bookings.slice(0, 5).map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center">
                  <Car className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{b.carNumber} · {b.id}</p>
                  <p className="text-white/40 text-xs">{b.employeeName} · {b.packageName}</p>
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
      </div>
    </div>
  );
}

// --- Bookings Tab ---
type BookingFilter = 'all' | 'booked' | 'assigned' | 'keys_collected' | 'washing' | 'completed' | 'cancelled';

const BOOKING_FILTERS: { id: BookingFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'booked', label: 'Unassigned' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'keys_collected', label: 'Keys collected' },
  { id: 'washing', label: 'Washing' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

function BookingsTab({ bookings, users, onRefresh, toast, onAssign }: {
  bookings: Booking[];
  users: User[];
  onRefresh: () => void;
  toast: (m: string, t?: 'success' | 'error' | 'info') => void;
  onAssign: (booking: Booking) => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<BookingFilter>('all');

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = bookings.filter((booking) => {
    const customer = users.find((candidate) => candidate.id === booking.employeeId);
    const matchesSearch = !normalizedSearch || [
      booking.carNumber,
      booking.id,
      booking.employeeName,
      customer?.email,
      customer?.phone,
    ].some((value) => value?.toLowerCase().includes(normalizedSearch));
    const matchesFilter = filter === 'all' ||
      (filter === 'booked' ? booking.status === 'booked' && !booking.workerId : booking.status === filter);
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    if (confirm(`Delete booking ${id}?`)) {
      deleteBooking(id);
      toast(`Booking ${id} deleted`, 'success');
      onRefresh();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search booking ID, customer, vehicle, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-light border border-white/10 text-white placeholder-white/30 focus:border-brand focus:outline-none transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {BOOKING_FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`min-h-10 px-3 rounded-lg whitespace-nowrap text-sm font-medium transition ${filter === item.id ? 'bg-brand text-white' : 'bg-navy-light text-white/55 hover:text-white'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map((booking) => {
          const customer = users.find((candidate) => candidate.id === booking.employeeId);
          const canAssign = booking.status === 'booked' && !booking.workerId;
          return (
            <article key={booking.id} className="bg-navy-light rounded-2xl border border-white/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-brand text-xs font-semibold uppercase tracking-wide">{booking.id}</p>
                  <h3 className="text-white font-bold mt-1">{booking.employeeName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-white/45 text-xs">
                    {customer?.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>}
                    {customer?.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>}
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                <BookingField label="Vehicle" value={`${booking.carNumber} · ${booking.carModel}`} />
                <BookingField label="Wash package" value={`${booking.packageName} · ₹${booking.price}`} />
                <BookingField label="Scheduled" value={`${booking.date} · ${booking.timeSlot}`} />
                <BookingField label="Location" value={`${booking.office}, ${booking.parkingFloor}, ${booking.parkingBay}`} icon={MapPin} />
                <BookingField label="Assigned worker" value={booking.workerName || 'Unassigned'} />
                <BookingField label="Assigned at" value={booking.assignedAt ? new Date(booking.assignedAt).toLocaleString('en-IN') : '—'} />
              </div>
              {booking.parkingInstructions && <p className="text-white/40 text-xs mt-3">Parking instructions: {booking.parkingInstructions}</p>}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
                {canAssign && (
                  <button onClick={() => onAssign(booking)} className="min-h-10 px-4 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-semibold">
                    Assign Worker
                  </button>
                )}
                <button onClick={() => handleDelete(booking.id)} aria-label={`Delete booking ${booking.id}`} className="w-10 min-h-10 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-white/40">No bookings match this search or filter.</div>}
    </div>
  );
}

function BookingField({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof MapPin }) {
  return (
    <div className="min-w-0">
      <p className="text-white/35 text-xs">{label}</p>
      <p className="text-white/80 text-sm break-words mt-0.5 flex items-start gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />}
        <span>{value}</span>
      </p>
    </div>
  );
}

function AssignmentModal({ booking, workers, users, onCancel, onConfirm }: {
  booking: Booking;
  workers: Worker[];
  users: User[];
  onCancel: () => void;
  onConfirm: (workerId: string) => void;
}) {
  const [workerId, setWorkerId] = useState('');
  const [processing, setProcessing] = useState(false);
  const customer = users.find((candidate) => candidate.id === booking.employeeId);
  const selectedWorker = workers.find((worker) => worker.id === workerId);

  const confirmAssignment = async () => {
    if (!selectedWorker || processing) return;
    setProcessing(true);
    try {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      onConfirm(selectedWorker.id);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => !processing && onCancel()}>
      <section role="dialog" aria-modal="true" aria-labelledby="assign-modal-title" className="bg-navy-light border border-white/10 rounded-2xl p-6 max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 id="assign-modal-title" className="text-white font-bold text-lg">Assign Worker</h3>
          <button onClick={onCancel} disabled={processing} aria-label="Close assignment dialog" className="w-9 h-9 rounded-lg text-white/45 hover:text-white disabled:opacity-40 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>
        <div className="rounded-xl bg-navy border border-white/10 p-4 space-y-2 mb-5">
          <p className="text-brand text-xs font-semibold">{booking.id}</p>
          <p className="text-white font-semibold">{booking.employeeName}{customer?.phone ? ` · ${customer.phone}` : ''}</p>
          <p className="text-white/55 text-sm">{booking.carNumber} · {booking.carModel} · {booking.packageName}</p>
          <p className="text-white/45 text-sm">{booking.office}, {booking.parkingFloor}, {booking.parkingBay}</p>
          <p className="text-white/45 text-sm">{booking.date} · {booking.timeSlot}</p>
        </div>
        <label htmlFor="assignment-worker" className="block text-white/65 text-sm font-medium mb-2">Active worker</label>
        <select id="assignment-worker" disabled={processing} value={workerId} onChange={(event) => setWorkerId(event.target.value)} className="w-full min-h-12 px-4 rounded-xl bg-navy border border-white/10 text-white focus:border-brand focus:outline-none disabled:opacity-50">
          <option value="">Choose a worker</option>
          {workers.map((worker) => {
            const workerUser = users.find((user) => user.id === worker.id && user.role === 'worker');
            return (
              <option key={worker.id} value={worker.id} disabled={!workerUser}>
                {worker.name} · {worker.phone}{workerUser ? '' : ' · no worker account'}
              </option>
            );
          })}
        </select>
        {workers.length === 0 && <p className="text-amber-300 text-sm mt-2">There are no active workers available.</p>}
        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button onClick={onCancel} disabled={processing} className="flex-1 min-h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white/75 font-medium disabled:opacity-40">Cancel</button>
          <button onClick={confirmAssignment} disabled={!selectedWorker || processing} className="flex-1 min-h-12 rounded-xl bg-brand hover:bg-brand-dark disabled:opacity-45 disabled:cursor-not-allowed text-white font-semibold">
            {processing ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </section>
    </div>
  );
}

// --- Staff Tab ---
function StaffTab({ workers, onRefresh, toast }: { workers: Worker[]; onRefresh: () => void; toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAdd = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.phone.trim()) e.phone = 'Phone required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter 10-digit phone';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    saveWorker({
      id: `w${Date.now()}`,
      name: form.name,
      phone: form.phone,
      rating: 5.0,
      jobsDone: 0,
      active: true,
    });
    toast(`${form.name} added as worker`, 'success');
    onRefresh();
    setForm({ name: '', phone: '' });
    setShowAdd(false);
  };

  const handleToggle = (w: Worker) => {
    saveWorker({ ...w, active: !w.active });
    toast(`${w.name} ${w.active ? 'deactivated' : 'activated'}`, 'info');
    onRefresh();
  };

  const handleDelete = (w: Worker) => {
    if (confirm(`Remove ${w.name}?`)) {
      deleteWorker(w.id);
      toast(`${w.name} removed`, 'success');
      onRefresh();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Workers ({workers.length})</h3>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-medium text-sm transition flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Worker
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((w) => (
          <div key={w.id} className={`bg-navy-light rounded-2xl border p-5 transition ${w.active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand font-bold">
                  {w.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold">{w.name}</p>
                  <p className="text-white/40 text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> {w.phone}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${w.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {w.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm mb-3">
              <div className="flex items-center gap-1 text-white/60"><Star className="w-4 h-4 text-yellow-400" /> {w.rating}</div>
              <div className="text-white/60">{w.jobsDone} jobs done</div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-white/10">
              <button onClick={() => handleToggle(w)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 font-medium text-sm transition">
                {w.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => handleDelete(w)} className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add worker modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setShowAdd(false)}>
          <div className="bg-navy-light border border-white/10 rounded-2xl p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-4">Add New Worker</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm font-medium block mb-1.5">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ravi Kumar"
                  className={`w-full px-4 py-2.5 rounded-xl bg-navy border ${errors.name ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-white/60 text-sm font-medium block mb-1.5">Phone Number</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210"
                  className={`w-full px-4 py-2.5 rounded-xl bg-navy border ${errors.phone ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition">Add Worker</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Slots Tab ---
function SlotsTab({ slots, onRefresh }: { slots: TimeSlot[]; onRefresh: () => void }) {
  const updateCapacity = (id: string, delta: number) => {
    const updated = slots.map((s) => s.id === id ? { ...s, capacity: Math.max(1, Math.min(20, s.capacity + delta)) } : s);
    saveSlots(updated);
    onRefresh();
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-white font-semibold text-lg mb-4">Time Slot Management</h3>
      <p className="text-white/50 text-sm mb-6">Adjust the capacity for each time slot. Workers and slots update across all dashboards in real-time.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {slots.map((slot) => (
          <div key={slot.id} className="bg-navy-light rounded-2xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-brand" />
              <p className="text-white font-semibold">{slot.time}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-xs">Capacity</p>
                <p className="text-white text-2xl font-bold">{slot.capacity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateCapacity(slot.id, -1)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => updateCapacity(slot.id, 1)} className="w-8 h-8 rounded-lg bg-brand hover:bg-brand-dark text-white flex items-center justify-center transition">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/40 text-xs">Booked: {slot.booked}/{slot.capacity}</p>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mt-1">
                <div className="h-full bg-brand rounded-full" style={{ width: `${(slot.booked / slot.capacity) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Prices Tab ---
function PricesTab({ prices, onRefresh, toast }: { prices: Record<string, number>; onRefresh: () => void; toast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [values, setValues] = useState(prices);

  const handleSave = () => {
    savePrices(values);
    toast('Prices updated successfully', 'success');
    onRefresh();
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <h3 className="text-white font-semibold text-lg mb-4">Package Pricing</h3>
      <div className="space-y-4">
        {PACKAGES.map((pkg) => (
          <div key={pkg.id} className="bg-navy-light rounded-2xl border border-white/10 p-5 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-white font-semibold">{pkg.name}</p>
              <p className="text-white/40 text-sm">{pkg.duration} · {pkg.features.length} services</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-lg">₹</span>
              <input
                type="number"
                value={values[pkg.id] || pkg.price}
                onChange={(e) => setValues({ ...values, [pkg.id]: parseInt(e.target.value) || 0 })}
                className="w-24 px-3 py-2 rounded-xl bg-navy border border-white/10 text-white text-right font-semibold focus:border-brand focus:outline-none transition"
              />
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSave} className="mt-6 px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition">
        Save Prices
      </button>
    </div>
  );
}

// --- Shared ---
function StatCard({ icon: Icon, label, value, color }: { icon: typeof Car; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-navy-light rounded-2xl border border-white/10 p-5">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-white/40 text-sm mt-0.5">{label}</p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-navy rounded-xl p-4">
      <p className="text-white/40 text-xs">{label}</p>
      <p className="text-white text-xl font-bold mt-1">{value}</p>
    </div>
  );
}
