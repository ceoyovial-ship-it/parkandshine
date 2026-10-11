export type Role = 'employee' | 'worker' | 'security' | 'admin';

export type BookingStatus =
  | 'booked'
  | 'assigned'
  | 'keys_collected'
  | 'washing'
  | 'washed'
  | 'keys_returned'
  | 'completed'
  | 'cancelled';

export interface Vehicle {
  id: string;
  number: string;
  model: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  bookingId?: string;
}

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  type: 'Promotional credit' | 'Reward credit' | 'Reward redemption' | 'Points redemption';
  status: 'Demo';
}

export interface WalletAccount {
  userId: string;
  balance: number;
  points: number;
  lifetimePoints: number;
  redeemedRewardIds: string[];
  transactions: WalletTransaction[];
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone?: string;
  office?: string;
  avatar?: string;
  vehicles?: Vehicle[];
  demoSeedKey?: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  rating: number;
  jobsDone: number;
  active: boolean;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

export interface Booking {
  id: string;
  carNumber: string;
  carModel: string;
  employeeName: string;
  employeeId: string;
  office: string;
  parkingFloor: string;
  parkingBay: string;
  parkingInstructions?: string;
  packageId: string;
  packageName: string;
  price: number;
  timeSlot: string;
  date: string;
  workerId?: string;
  workerName?: string;
  assignedAt?: string;
  assignedByAdminId?: string;
  demoSeedKey?: string;
  status: BookingStatus;
  paymentRef: string;
  createdAt: string;
  timeline: { status: BookingStatus; label: string; time: string }[];
  keyCollectionTime?: string;
  keyReturnTime?: string;
  washStartTime?: string;
  washCompleteTime?: string;
  completedAt?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  capacity: number;
  booked: number;
}

export const OFFICES = [
  'Tower A — Tech Park',
  'Tower B — Business Bay',
  'Tower C — Cyber Gateway',
  'Tower D — Innovation Hub',
];

export const PACKAGES: Package[] = [
  {
    id: 'quick',
    name: 'Quick Wash',
    price: 199,
    duration: '20 min',
    features: ['Exterior water wash', 'Wheel cleaning', 'Exterior wipe down'],
  },
  {
    id: 'premium',
    name: 'Premium Wash',
    price: 349,
    duration: '40 min',
    features: ['Quick Wash included', 'Interior vacuum', 'Dashboard cleaning', 'Glass cleaning', 'Air freshener'],
    popular: true,
  },
  {
    id: 'signature',
    name: 'Signature Detailing',
    price: 699,
    duration: '75 min',
    features: ['Premium Wash included', 'Deep interior cleaning', 'Tyre dressing', 'Premium wax & finishing'],
  },
];

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'slot1', time: '09:00 AM', capacity: 5, booked: 0 },
  { id: 'slot2', time: '10:00 AM', capacity: 5, booked: 0 },
  { id: 'slot3', time: '11:00 AM', capacity: 5, booked: 0 },
  { id: 'slot4', time: '12:00 PM', capacity: 5, booked: 0 },
  { id: 'slot5', time: '02:00 PM', capacity: 5, booked: 0 },
  { id: 'slot6', time: '03:00 PM', capacity: 5, booked: 0 },
  { id: 'slot7', time: '04:00 PM', capacity: 5, booked: 0 },
  { id: 'slot8', time: '05:00 PM', capacity: 5, booked: 0 },
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  booked: 'Booked',
  assigned: 'Worker Assigned',
  keys_collected: 'Keys Collected',
  washing: 'Wash In Progress',
  washed: 'Wash Complete',
  keys_returned: 'Keys Returned',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  booked: 'bg-blue-100 text-blue-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  keys_collected: 'bg-amber-100 text-amber-700',
  washing: 'bg-orange-100 text-orange-700',
  washed: 'bg-cyan-100 text-cyan-700',
  keys_returned: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
