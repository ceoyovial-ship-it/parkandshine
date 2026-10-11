import { Car, LogOut, RotateCcw, UserCircle, Bell } from 'lucide-react';
import type { Role, User } from '@/types';
import { resetDemoData, getNotifications, markNotificationRead } from '@/store';
import { useStoreData } from '@/hooks/useStoreData';
import { useState } from 'react';

interface NavbarProps {
  user: User | null;
  role: Role | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const ROLE_LABELS: Record<Role, string> = {
  employee: 'User',
  worker: 'Worker',
  security: 'Security',
  admin: 'Admin',
};

export default function Navbar({ user, role, onLogout, onNavigate, currentPage }: NavbarProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications] = useStoreData(() => user ? getNotifications(user.id) : []);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleReset = () => {
    if (confirm('Reset all demo data? This restores the original sample bookings and staff.')) {
      resetDemoData();
    }
  };

  if (!user || !role) return null;
  const isEmployee = role === 'employee';
  const showNotifications = true;

  return (
    <nav className="sticky top-0 z-50 bg-navy/95 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate(role)} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center group-hover:scale-105 transition">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ParkShine</span>
            <span className="hidden sm:inline text-white/40 text-xs font-medium ml-1 px-2 py-0.5 rounded bg-white/5">
              {ROLE_LABELS[role]}
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            {isEmployee && (
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm font-medium transition hidden md:block ${currentPage === 'home' ? 'text-brand' : 'text-white/60 hover:text-white'}`}
              >
                Home
              </button>
            )}
            {isEmployee && (
              <button
                onClick={() => onNavigate('track')}
                className={`text-sm font-medium transition hidden md:block ${currentPage === 'track' || currentPage === 'history' ? 'text-brand' : 'text-white/60 hover:text-white'}`}
              >
                Bookings
              </button>
            )}
            {isEmployee && (
              <button
                onClick={() => onNavigate('wallet')}
                className={`text-sm font-medium transition hidden md:block ${currentPage === 'wallet' ? 'text-brand' : 'text-white/60 hover:text-white'}`}
              >
                Wallet/Rewards
              </button>
            )}
            {!isEmployee && (
              <button
                onClick={() => onNavigate(role)}
                className="text-white/60 hover:text-white text-sm font-medium transition hidden md:block"
              >
                Home
              </button>
            )}
            <button
              onClick={handleReset}
              className="text-white/60 hover:text-white transition flex items-center gap-1.5 text-sm font-medium"
              title="Reset demo data"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Notifications */}
            {showNotifications && (
              <div className="relative">
                <button
                  onClick={() => setShowNotif(!showNotif)}
                  className="text-white/60 hover:text-white transition relative"
                  aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-navy-light border border-white/10 rounded-xl shadow-2xl z-50 animate-slide-down overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white font-semibold text-sm">Notifications</p>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-white/40 text-sm p-4 text-center">No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => !n.read && markNotificationRead(n.id)}
                              className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition ${!n.read ? 'bg-brand/5' : ''}`}
                            >
                              <p className="text-white text-sm font-medium">{n.title}</p>
                              <p className="text-white/50 text-xs mt-0.5">{n.message}</p>
                              <p className="text-white/30 text-xs mt-1">{new Date(n.time).toLocaleString('en-IN')}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Profile */}
            {isEmployee && (
              <button
                onClick={() => onNavigate('profile')}
                className={`w-9 h-9 rounded-full bg-brand/20 border flex items-center justify-center transition ${currentPage === 'profile' ? 'border-brand' : 'border-brand/30 hover:border-brand'}`}
                title="Profile"
              >
                <UserCircle className="w-5 h-5 text-brand" />
              </button>
            )}

            {!isEmployee && role !== 'security' && (
              <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand font-semibold text-sm">
                  {user.name.charAt(0)}
                </div>
                <span className="text-white/80 text-sm font-medium hidden sm:block">{user.name}</span>
              </div>
            )}
            {!isEmployee && (
              <button
                onClick={() => onNavigate('profile')}
                className={`w-9 h-9 rounded-full bg-brand/20 border flex items-center justify-center transition ${currentPage === 'profile' ? 'border-brand' : 'border-brand/30 hover:border-brand'}`}
                title="Profile"
                aria-label="Open profile"
              >
                <UserCircle className="w-5 h-5 text-brand" />
              </button>
            )}
            <button
              onClick={onLogout}
              className="text-white/60 hover:text-red-400 transition flex items-center gap-1.5 text-sm font-medium"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
