import { useState } from 'react';
import {
  User as UserIcon, Mail, Phone, Building2, Car, Key,
  Edit3, Save, X, Plus, Trash2, Info,
} from 'lucide-react';
import type { User, Vehicle } from '@/types';
import { updateUser, addVehicle, removeVehicle, setCurrentUser } from '@/store';
import { useToast } from '@/components/Toast';

interface ProfileProps {
  user: User;
  onUserUpdate: (u: User) => void;
  initialTab?: 'profile' | 'vehicles' | 'password';
}

const CAR_MODELS = [
  'Hyundai Creta', 'Maruti Suzuki Brezza', 'Toyota Innova Crysta', 'Honda City',
  'Mahindra XUV700', 'Tata Nexon', 'Kia Seltos', 'Maruti Swift', 'Volkswagen Vento', 'Renault Triber',
];

export default function Profile({ user, onUserUpdate, initialTab = 'profile' }: ProfileProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<'profile' | 'vehicles' | 'password'>(initialTab);

  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user.name, email: user.email, phone: user.phone || '', office: user.office || '' });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ number: '', model: '' });
  const [vehicleErrors, setVehicleErrors] = useState<Record<string, string>>({});

  const vehicles = user.vehicles || [];
  const roleLabel = user.role === 'employee' ? 'User' : `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}`;

  const handleSaveProfile = () => {
    const e: Record<string, string> = {};
    if (!profileForm.name.trim()) e.name = 'Name is required';
    if (!profileForm.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) e.email = 'Enter a valid email';
    if (!profileForm.phone.trim()) e.phone = 'Phone is required';
    else if (profileForm.phone.replace(/\D/g, '').length !== 10) e.phone = 'Enter a valid 10-digit phone number';
    setProfileErrors(e);
    if (Object.keys(e).length > 0) return;

    const updated = { ...user, name: profileForm.name.trim(), email: profileForm.email.trim(), phone: profileForm.phone.trim(), office: profileForm.office };
    updateUser(updated);
    setCurrentUser(updated);
    onUserUpdate(updated);
    setEditing(false);
    toast('Profile updated successfully', 'success');
  };

  const handleAddVehicle = () => {
    const e: Record<string, string> = {};
    if (!vehicleForm.number.trim()) e.number = 'Car number required';
    else if (!/^[A-Z]{2}\d/.test(vehicleForm.number.toUpperCase().replace(/\s/g, ''))) e.number = 'Enter valid plate (e.g. KA01 AB 1234)';
    if (!vehicleForm.model) e.model = 'Select car model';
    setVehicleErrors(e);
    if (Object.keys(e).length > 0) return;

    const vehicle: Vehicle = { id: `v${Date.now()}`, number: vehicleForm.number.toUpperCase(), model: vehicleForm.model };
    addVehicle(user.id, vehicle);
    const updated = { ...user, vehicles: [...(user.vehicles || []), vehicle] };
    onUserUpdate(updated);
    toast('Vehicle added', 'success');
    setVehicleForm({ number: '', model: '' });
    setShowVehicleForm(false);
  };

  const handleRemoveVehicle = (id: string) => {
    if (confirm('Remove this vehicle?')) {
      removeVehicle(user.id, id);
      const updated = { ...user, vehicles: (user.vehicles || []).filter((v) => v.id !== id) };
      onUserUpdate(updated);
      toast('Vehicle removed', 'success');
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Edit Profile', icon: Edit3 },
    { id: 'password' as const, label: 'Change Password', icon: Key },
    ...(user.role === 'employee' ? [{ id: 'vehicles' as const, label: 'Vehicles', icon: Car }] : []),
  ];

  return (
    <div className="min-h-screen bg-navy pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header card */}
        <div className="bg-gradient-to-br from-navy-light to-navy rounded-2xl border border-white/10 p-6 mb-6 animate-slide-up">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-brand/20 border-2 border-brand/30 flex items-center justify-center text-brand font-bold text-3xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-brand text-sm font-medium mt-0.5">{roleLabel}</p>
              <p className="text-white/50 text-sm flex items-center gap-1.5 mt-1"><Mail className="w-4 h-4" /> {user.email}</p>
              <p className="text-white/50 text-sm flex items-center gap-1.5 mt-0.5"><Phone className="w-4 h-4" /> {user.phone}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-navy-light p-1.5 rounded-xl overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition flex items-center gap-2 whitespace-nowrap ${tab === t.id ? 'bg-brand text-white' : 'text-white/60 hover:text-white'}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Profile edit */}
        {tab === 'profile' && (
          <div className="bg-navy-light rounded-2xl border border-white/10 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Profile Information</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand font-medium text-sm transition flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              ) : (
                <button onClick={() => { setEditing(false); setProfileErrors({}); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition flex items-center gap-1.5">
                  <X className="w-4 h-4" /> Cancel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field icon={UserIcon} label="Full Name" value={profileForm.name} editable={editing}
                onChange={(v) => setProfileForm({ ...profileForm, name: v })} error={profileErrors.name} />
              <Field icon={Mail} label="Email" value={profileForm.email} editable={editing}
                onChange={(v) => setProfileForm({ ...profileForm, email: v })} error={profileErrors.email} />
              <Field icon={Phone} label="Phone" value={profileForm.phone} editable={editing}
                onChange={(v) => setProfileForm({ ...profileForm, phone: v })} error={profileErrors.phone} />
              <Field icon={Building2} label="Office" value={profileForm.office} editable={editing}
                onChange={(v) => setProfileForm({ ...profileForm, office: v })} />
            </div>

            {editing && (
              <button onClick={handleSaveProfile} className="mt-6 px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition flex items-center gap-2">
                <Save className="w-5 h-5" /> Save Changes
              </button>
            )}
          </div>
        )}

        {/* Vehicles */}
        {tab === 'vehicles' && (
          <div className="bg-navy-light rounded-2xl border border-white/10 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Registered Vehicles</h3>
              <button onClick={() => setShowVehicleForm(!showVehicleForm)} className="px-4 py-2 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand font-medium text-sm transition flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Vehicle
              </button>
            </div>

            {showVehicleForm && (
              <div className="mb-6 bg-navy rounded-xl border border-white/10 p-5 animate-scale-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm font-medium block mb-1.5">Car Number</label>
                    <input value={vehicleForm.number} onChange={(e) => setVehicleForm({ ...vehicleForm, number: e.target.value })} placeholder="KA01 AB 1234"
                      className={`w-full px-4 py-2.5 rounded-xl bg-navy-light border ${vehicleErrors.number ? 'border-red-500' : 'border-white/10'} text-white placeholder-white/30 focus:border-brand focus:outline-none transition`} />
                    {vehicleErrors.number && <p className="text-red-400 text-xs mt-1">{vehicleErrors.number}</p>}
                  </div>
                  <div>
                    <label className="text-white/60 text-sm font-medium block mb-1.5">Car Model</label>
                    <select value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl bg-navy-light border ${vehicleErrors.model ? 'border-red-500' : 'border-white/10'} text-white focus:border-brand focus:outline-none transition`}>
                      <option value="">Select model</option>
                      {CAR_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    {vehicleErrors.model && <p className="text-red-400 text-xs mt-1">{vehicleErrors.model}</p>}
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={handleAddVehicle} className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-medium text-sm transition">Add Vehicle</button>
                  <button onClick={() => { setShowVehicleForm(false); setVehicleErrors({}); }} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition">Cancel</button>
                </div>
              </div>
            )}

            {vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No vehicles registered yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 p-4 rounded-xl bg-navy border border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center">
                      <Car className="w-6 h-6 text-brand" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{v.number}</p>
                      <p className="text-white/50 text-sm">{v.model}</p>
                    </div>
                    <button onClick={() => handleRemoveVehicle(v.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Change password */}
        {tab === 'password' && (
          <div className="bg-navy-light rounded-2xl border border-white/10 p-6 animate-fade-in max-w-lg">
            <h3 className="text-white font-semibold text-lg mb-2">Change Password</h3>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2 mb-6">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-200/80 text-sm leading-relaxed">
                Password changes are unavailable in this demo because no authentication provider is connected. Passwords are not saved in LocalStorage. Connect an authentication provider to securely enable password changes.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, editable, onChange, error }: {
  icon: typeof UserIcon;
  label: string;
  value: string;
  editable: boolean;
  onChange?: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="text-white/60 text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={!editable}
          className={`w-full pl-11 pr-4 py-3 rounded-xl bg-navy border ${error ? 'border-red-500' : 'border-white/10'} text-white focus:border-brand focus:outline-none transition ${!editable ? 'opacity-70 cursor-default' : ''}`}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
