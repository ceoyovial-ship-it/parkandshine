import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  House,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
  UsersRound,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCallback } from 'react';
import type { Role, User } from '@/types';
import { getNotifications } from '@/store';
import { useStoreData } from '@/hooks/useStoreData';

interface BottomNavigationProps {
  user: User;
  currentPage: string;
  onNavigate: (destination: string) => void;
}

interface NavigationItem {
  label: string;
  destination: string;
  icon: LucideIcon;
  activePages: string[];
}

const ROLE_NAVIGATION: Record<Role, NavigationItem[]> = {
  employee: [
    { label: 'Home', destination: 'home', icon: House, activePages: ['home'] },
    { label: 'Wallet/Rewards', destination: 'wallet', icon: Wallet, activePages: ['wallet'] },
    { label: 'Bookings', destination: 'track', icon: CalendarDays, activePages: ['track', 'book', 'history'] },
    { label: 'Help', destination: 'help', icon: CircleHelp, activePages: ['help'] },
    { label: 'Account', destination: 'profile', icon: UserRound, activePages: ['profile', 'vehicles'] },
  ],
  worker: [
    { label: 'Home', destination: 'worker', icon: House, activePages: ['worker'] },
    { label: 'My Jobs', destination: 'worker-jobs', icon: BriefcaseBusiness, activePages: ['worker-jobs'] },
    { label: 'Notifications', destination: 'notifications', icon: Bell, activePages: ['notifications'] },
    { label: 'Help', destination: 'help', icon: CircleHelp, activePages: ['help'] },
    { label: 'Account', destination: 'profile', icon: UserRound, activePages: ['profile'] },
  ],
  admin: [
    { label: 'Dashboard', destination: 'admin', icon: LayoutDashboard, activePages: ['admin', 'admin-slots', 'admin-prices'] },
    { label: 'Bookings', destination: 'admin-bookings', icon: ClipboardList, activePages: ['admin-bookings'] },
    { label: 'Staff', destination: 'admin-staff', icon: UsersRound, activePages: ['admin-staff'] },
    { label: 'Notifications', destination: 'notifications', icon: Bell, activePages: ['notifications'] },
    { label: 'Account', destination: 'profile', icon: UserRound, activePages: ['profile'] },
  ],
  security: [
    { label: 'Home', destination: 'security', icon: House, activePages: ['security'] },
    { label: 'Verify Bookings', destination: 'security-verify', icon: ShieldCheck, activePages: ['security-verify'] },
    { label: 'Notifications', destination: 'notifications', icon: Bell, activePages: ['notifications'] },
    { label: 'Account', destination: 'profile', icon: UserRound, activePages: ['profile'] },
  ],
};

export default function BottomNavigation({ user, currentPage, onNavigate }: BottomNavigationProps) {
  const fetchNotifications = useCallback(() => getNotifications(user.id), [user.id]);
  const [notifications] = useStoreData(fetchNotifications);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 shadow-[0_-6px_24px_rgba(16,24,40,0.12)] backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto flex min-h-16 max-w-xl items-stretch justify-around">
        {ROLE_NAVIGATION[user.role].map((item) => {
          const active = item.activePages.includes(currentPage);
          const Icon = item.icon;
          const showUnread = item.destination === 'notifications' && unreadCount > 0;
          return (
            <button
              key={item.destination}
              type="button"
              onClick={() => onNavigate(item.destination)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand ${
                active ? 'text-brand' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className={`relative flex h-7 w-9 items-center justify-center rounded-full transition-colors ${active ? 'bg-brand/10' : ''}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.9} aria-hidden="true" />
                {showUnread && (
                  <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span className={`w-full text-[10px] leading-3 ${item.label === 'Wallet/Rewards' ? 'whitespace-normal break-words' : 'truncate'} ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label === 'Wallet/Rewards' ? <>Wallet/<wbr />Rewards</> : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
