import { Car, ArrowRight, User as UserIcon, Wrench, ShieldCheck, Settings, X } from 'lucide-react';
import type { Role, User } from '@/types';
import { useToast } from '@/components/Toast';

interface DemoLoginModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  onSelect: (role: Role, userId?: string) => void;
}

const ROLE_CARDS: { role: Role; label: string; desc: string; icon: typeof UserIcon }[] = [
  { role: 'employee', label: 'User', desc: 'Book car washes', icon: UserIcon },
  { role: 'worker', label: 'Worker', desc: 'Manage wash jobs', icon: Wrench },
  { role: 'security', label: 'Security', desc: 'Verify & manage keys', icon: ShieldCheck },
  { role: 'admin', label: 'Admin', desc: 'Full system control', icon: Settings },
];

export default function DemoLoginModal({ open, onClose, users, onSelect }: DemoLoginModalProps) {
  const { toast } = useToast();
  if (!open) return null;

  const handleSelect = (role: Role, userId?: string) => {
    onSelect(role, userId);
    toast(`Logged in as ${role}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-navy-light border border-white/10 rounded-2xl p-8 max-w-2xl w-full animate-scale-in relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Demo Login</h3>
        </div>
        <p className="text-white/50 text-sm mb-6">Choose a role to explore the existing ParkShine demo data. Demo role access is not real authentication and should not be used to protect production data.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROLE_CARDS.map((r) => (
            <button
              key={r.role}
              onClick={() => handleSelect(r.role)}
              className="group flex items-center gap-4 p-4 rounded-xl bg-navy border border-white/10 hover:border-brand/40 hover:bg-brand/5 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center group-hover:scale-110 transition">
                <r.icon className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="text-white font-semibold">{r.label}</p>
                <p className="text-white/50 text-xs">{r.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-brand ml-auto transition" />
            </button>
          ))}
        </div>
        {users.some((user) => user.role === 'employee') && (
          <div className="mt-6">
            <h4 className="text-white/70 text-sm font-semibold mb-2">Customer demo accounts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {users.filter((user) => user.role === 'employee').map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect('employee', user.id)}
                  className="p-3 rounded-xl bg-navy border border-white/10 hover:border-brand/40 transition text-left"
                >
                  <span className="block text-white text-sm font-medium">{user.name}</span>
                  <span className="block text-white/40 text-xs mt-1">{user.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <button onClick={onClose} className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-medium transition">
          Cancel
        </button>
      </div>
    </div>
  );
}
