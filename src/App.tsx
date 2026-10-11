import { useCallback, useEffect, useState } from 'react';
import { initDemoData, getCurrentUser, setCurrentUser, getUsers } from '@/store';
import type { User, Role } from '@/types';
import { ToastProvider } from '@/components/Toast';
import Navbar from '@/components/Navbar';
import DemoLoginModal from '@/components/DemoLoginModal';
import BottomNavigation from '@/components/BottomNavigation';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import EmployeePage from '@/pages/Employee';
import WorkerPage from '@/pages/Worker';
import SecurityPage from '@/pages/Security';
import AdminPage from '@/pages/Admin';
import Profile from '@/pages/Profile';
import NotificationsPage from '@/pages/Notifications';
import HelpPage from '@/pages/Help';
import WalletPage from '@/pages/Wallet';

type EmployeeSubPage = 'home' | 'book' | 'track' | 'profile' | 'vehicles' | 'history';
type AdminSubPage = 'admin-bookings' | 'admin-staff' | 'admin-slots' | 'admin-prices';
type Page = 'login' | 'register' | 'forgot-password' | Role | EmployeeSubPage |
  'worker-jobs' | 'security-verify' | AdminSubPage | 'notifications' | 'help' | 'wallet';

const PAGE_PATHS: Record<Page, string> = {
  login: '/login',
  register: '/register',
  'forgot-password': '/forgot-password',
  employee: '/dashboard',
  worker: '/worker',
  security: '/security',
  admin: '/admin',
  home: '/dashboard',
  book: '/book',
  track: '/bookings',
  profile: '/profile',
  vehicles: '/vehicles',
  history: '/history',
  wallet: '/wallet',
  'worker-jobs': '/worker/jobs',
  'security-verify': '/security/verify',
  'admin-bookings': '/admin/bookings',
  'admin-staff': '/admin/staff',
  'admin-slots': '/admin/slots',
  'admin-prices': '/admin/prices',
  notifications: '/notifications',
  help: '/help',
};

function roleHome(role: Role): Page {
  return role === 'employee' ? 'home' : role;
}

function pageForPath(path: string): Page | null {
  const pages: Record<string, Page> = {
    '/': 'login',
    '/login': 'login',
    '/register': 'register',
    '/forgot-password': 'forgot-password',
    '/dashboard': 'home',
    '/book': 'book',
    '/bookings': 'track',
    '/vehicles': 'vehicles',
    '/history': 'history',
    '/wallet': 'wallet',
    '/profile': 'profile',
    '/worker': 'worker',
    '/worker/jobs': 'worker-jobs',
    '/security': 'security',
    '/security/verify': 'security-verify',
    '/admin': 'admin',
    '/admin/bookings': 'admin-bookings',
    '/admin/staff': 'admin-staff',
    '/admin/slots': 'admin-slots',
    '/admin/prices': 'admin-prices',
    '/notifications': 'notifications',
    '/help': 'help',
  };
  return pages[path] || null;
}

function pathForPage(page: string, role: Role | null): string {
  if (page === 'home' && role && role !== 'employee') return PAGE_PATHS[role];
  if (page === 'employee') return PAGE_PATHS.home;
  return PAGE_PATHS[page as Page] || (role ? PAGE_PATHS[roleHome(role)] : '/login');
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>('login');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [ready, setReady] = useState(false);

  const navigate = useCallback((path: string, replace = false) => {
    if (replace) window.history.replaceState(null, '', path);
    else if (window.location.pathname !== path) window.history.pushState(null, '', path);
    const target = pageForPath(path);
    if (target) setPage(target);
    window.scrollTo(0, 0);
  }, []);

  const resolvePath = useCallback((currentUser: User | null, path = window.location.pathname) => {
    const target = pageForPath(path);
    if (!currentUser) {
      if (target === 'register' || target === 'forgot-password' || target === 'login') {
        setPage(target);
      } else {
        navigate('/login', true);
      }
      return;
    }

    if (!target || target === 'login' || target === 'register' || target === 'forgot-password') {
      const home = roleHome(currentUser.role);
      navigate(PAGE_PATHS[home], true);
      setPage(home);
      return;
    }

    const employeePages: Page[] = ['home', 'book', 'track', 'vehicles', 'history', 'wallet'];
    if (employeePages.includes(target) && currentUser.role !== 'employee') {
      const home = roleHome(currentUser.role);
      navigate(PAGE_PATHS[home], true);
      setPage(home);
      return;
    }
    if (target === 'security' && currentUser.role !== 'security') {
      const home = roleHome(currentUser.role);
      navigate(PAGE_PATHS[home], true);
      setPage(home);
      return;
    }
    if (target === 'admin' && currentUser.role !== 'admin') {
      const home = roleHome(currentUser.role);
      navigate(PAGE_PATHS[home], true);
      setPage(home);
      return;
    }
    if (target === 'worker' && currentUser.role !== 'worker') {
      const home = roleHome(currentUser.role);
      navigate(PAGE_PATHS[home], true);
      setPage(home);
      return;
    }
    if (target === 'worker-jobs' && currentUser.role !== 'worker') {
      const home = roleHome(currentUser.role);
      navigate(PAGE_PATHS[home], true);
      setPage(home);
      return;
    }
    if (target === 'security-verify' && currentUser.role !== 'security') {
      const home = roleHome(currentUser.role);
      navigate(PAGE_PATHS[home], true);
      setPage(home);
      return;
    }
    const adminPages: Page[] = ['admin', 'admin-bookings', 'admin-staff', 'admin-slots', 'admin-prices'];
    if (adminPages.includes(target) && currentUser.role !== 'admin') {
      const home = roleHome(currentUser.role);
      navigate(PAGE_PATHS[home], true);
      setPage(home);
      return;
    }

    setPage(target);
  }, [navigate]);

  useEffect(() => {
    initDemoData();
    getUsers();
    const existing = getCurrentUser();
    resolvePath(existing);
    setUser(existing);
    setReady(true);

    const handlePopState = () => resolvePath(getCurrentUser());
    const handleSessionChange = () => {
      const updatedUser = getCurrentUser();
      setUser(updatedUser);
      resolvePath(updatedUser);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'parkshine_current_user' || event.key === null) handleSessionChange();
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('parkshine_auth_update', handleSessionChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('parkshine_auth_update', handleSessionChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [resolvePath]);

  const handleDemoLogin = (role: Role, userId?: string) => {
    const found = getUsers().find((candidate) => userId ? candidate.id === userId : candidate.role === role);
    if (!found) return;
    setCurrentUser(found);
    setUser(found);
    setShowDemoModal(false);
    const home = roleHome(found.role);
    navigate(PAGE_PATHS[home], true);
    setPage(home);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setShowDemoModal(false);
    navigate('/login', true);
    setPage('login');
  };

  const handleNavigate = (destination: string) => {
    const path = pathForPage(destination, user?.role ?? null);
    const target = pageForPath(path);
    if (user) {
      navigate(path);
      resolvePath(user, path);
    }
    else if (target === 'register' || target === 'forgot-password' || target === 'login') setPage(target);
    else {
      navigate('/login', true);
      return;
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderPage = () => {
    if (!user) {
      switch (page) {
        case 'register':
          return <Register onBack={() => navigate('/login')} onLogin={() => navigate('/login')} onRegisterSuccess={() => navigate('/login')} />;
        case 'forgot-password':
          return <ForgotPassword onBack={() => navigate('/login')} />;
        default:
          return <Login onRegister={() => navigate('/register')} onForgotPassword={() => navigate('/forgot-password')} onDemoLogin={() => setShowDemoModal(true)} />;
      }
    }

    if (user.role === 'employee') {
      switch (page) {
        case 'notifications': return <NotificationsPage user={user} />;
        case 'help': return <HelpPage user={user} />;
        case 'wallet': return <WalletPage userId={user.id} />;
        case 'book': return <EmployeePage key={page} user={user} initialView="book" onNavigate={handleNavigate} />;
        case 'track': return <EmployeePage key={page} user={user} initialView="track" onNavigate={handleNavigate} />;
        case 'history': return <EmployeePage key={page} user={user} initialView="track" onNavigate={handleNavigate} />;
        case 'vehicles': return <Profile key={page} user={user} onUserUpdate={handleUserUpdate} initialTab="vehicles" />;
        case 'profile': return <Profile key={page} user={user} onUserUpdate={handleUserUpdate} initialTab="profile" />;
        default: return <EmployeePage key={page} user={user} initialView="home" onNavigate={handleNavigate} />;
      }
    }

    if (page === 'profile') {
      return <Profile key={page} user={user} onUserUpdate={handleUserUpdate} initialTab="profile" />;
    }
    if (page === 'notifications') return <NotificationsPage user={user} />;
    if (page === 'help') return <HelpPage user={user} />;

    switch (user.role) {
      case 'worker':
        return <WorkerPage key={page} user={user} initialView={page === 'worker-jobs' ? 'jobs' : 'home'} />;
      case 'security':
        return <SecurityPage key={page} user={user} focusVerify={page === 'security-verify'} />;
      case 'admin': {
        const adminTab = page === 'admin-bookings' ? 'bookings'
          : page === 'admin-staff' ? 'staff'
            : page === 'admin-slots' ? 'slots'
              : page === 'admin-prices' ? 'prices' : 'dashboard';
        return <AdminPage key={page} user={user} initialTab={adminTab} onNavigate={handleNavigate} />;
      }
    }
  };

  if (!ready) return <div className="min-h-screen bg-navy" aria-busy="true" />;

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-navy">
        {user && (
          <Navbar user={user} role={user.role} onLogout={handleLogout} onNavigate={handleNavigate} currentPage={page} />
        )}
        <main className={`flex-1 ${user ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0' : ''}`}>{renderPage()}</main>
        {user && <BottomNavigation user={user} currentPage={page} onNavigate={handleNavigate} />}
      </div>
      <DemoLoginModal open={showDemoModal} onClose={() => setShowDemoModal(false)} users={getUsers()} onSelect={handleDemoLogin} />
    </ToastProvider>
  );
}

export default App;
