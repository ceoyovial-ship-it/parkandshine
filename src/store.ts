import type { Booking, BookingStatus, User, Worker, TimeSlot, AppNotification, Vehicle, WalletAccount } from './types';
import { TIME_SLOTS, OFFICES } from './types';

const KEYS = {
  bookings: 'parkshine_bookings',
  workers: 'parkshine_workers',
  users: 'parkshine_users',
  currentUser: 'parkshine_current_user',
  slots: 'parkshine_slots',
  prices: 'parkshine_prices',
  notifications: 'parkshine_notifications',
  wallets: 'parkshine_demo_wallets',
  initialized: 'parkshine_init',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event('parkshine_update'));
}

// --- Demo data initialization ---
export function initDemoData() {
  if (read(KEYS.initialized, false)) return;

  const workers: Worker[] = [
    { id: 'w1', name: 'Ramesh Kumar', phone: '98765 43210', rating: 4.8, jobsDone: 142, active: true },
    { id: 'w2', name: 'Suresh Patel', phone: '98765 43211', rating: 4.6, jobsDone: 98, active: true },
    { id: 'w3', name: 'Mahendra Singh', phone: '98765 43212', rating: 4.9, jobsDone: 210, active: true },
    { id: 'w4', name: 'Vikram Reddy', phone: '98765 43213', rating: 4.5, jobsDone: 67, active: true },
  ];

  const users: User[] = [
    { id: 'u1', name: 'Arjun Sharma', role: 'employee', email: 'arjun.sharma@techpark.in', phone: '99887 76655', office: 'Tower A — Tech Park', vehicles: [{ id: 'v1', number: 'KA01 AB 1234', model: 'Hyundai Creta' }] },
    { id: 'u2', name: 'Priya Nair', role: 'employee', email: 'priya.nair@businessbay.in', phone: '99887 76656', office: 'Tower B — Business Bay', vehicles: [{ id: 'v2', number: 'KA02 MN 5678', model: 'Maruti Suzuki Brezza' }] },
    { id: 'u3', name: 'Rohit Verma', role: 'employee', email: 'rohit.verma@cybergateway.in', phone: '99887 76657', office: 'Tower C — Cyber Gateway', vehicles: [{ id: 'v3', number: 'KA03 XY 9999', model: 'Toyota Innova Crysta' }] },
    { id: 'w1', name: 'Ramesh Kumar', role: 'worker', email: 'ramesh@parkshine.in', phone: '98765 43210' },
    { id: 'w2', name: 'Suresh Patel', role: 'worker', email: 'suresh@parkshine.in', phone: '98765 43211' },
    { id: 'w3', name: 'Mahendra Singh', role: 'worker', email: 'mahendra@parkshine.in', phone: '98765 43212' },
    { id: 'w4', name: 'Vikram Reddy', role: 'worker', email: 'vikram@parkshine.in', phone: '98765 43213' },
    { id: 's1', name: 'Ganesh Iyer', role: 'security', email: 'ganesh@parkshine.in', phone: '98765 11111', office: 'Main Gate — Tower A' },
    { id: 'a1', name: 'Kavya Reddy', role: 'admin', email: 'kavya@parkshine.in', phone: '98765 00000' },
  ];

  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const demoBookings: Booking[] = [
    {
      id: 'BK001',
      carNumber: 'KA01 AB 1234',
      carModel: 'Hyundai Creta',
      employeeName: 'Arjun Sharma',
      employeeId: 'u1',
      office: 'Tower A — Tech Park',
      parkingFloor: 'B2',
      parkingBay: 'A-12',
      packageId: 'premium',
      packageName: 'Premium Wash',
      price: 349,
      timeSlot: '10:00 AM',
      date: today,
      workerId: 'w1',
      workerName: 'Ramesh Kumar',
      status: 'assigned',
      paymentRef: 'PAY_DEMO_001',
      createdAt: new Date(now.getTime() - 3600000).toISOString(),
      timeline: [
        { status: 'booked', label: 'Booking confirmed', time: new Date(now.getTime() - 3600000).toISOString() },
        { status: 'assigned', label: 'Ramesh Kumar assigned', time: new Date(now.getTime() - 3000000).toISOString() },
      ],
    },
    {
      id: 'BK002',
      carNumber: 'KA02 MN 5678',
      carModel: 'Maruti Suzuki Brezza',
      employeeName: 'Priya Nair',
      employeeId: 'u2',
      office: 'Tower B — Business Bay',
      parkingFloor: 'B1',
      parkingBay: 'C-07',
      packageId: 'quick',
      packageName: 'Quick Wash',
      price: 199,
      timeSlot: '11:00 AM',
      date: today,
      workerId: 'w2',
      workerName: 'Suresh Patel',
      status: 'keys_collected',
      paymentRef: 'PAY_DEMO_002',
      createdAt: new Date(now.getTime() - 7200000).toISOString(),
      keyCollectionTime: new Date(now.getTime() - 1800000).toISOString(),
      timeline: [
        { status: 'booked', label: 'Booking confirmed', time: new Date(now.getTime() - 7200000).toISOString() },
        { status: 'assigned', label: 'Suresh Patel assigned', time: new Date(now.getTime() - 6000000).toISOString() },
        { status: 'keys_collected', label: 'Keys collected by worker', time: new Date(now.getTime() - 1800000).toISOString() },
      ],
    },
    {
      id: 'BK003',
      carNumber: 'KA03 XY 9999',
      carModel: 'Toyota Innova Crysta',
      employeeName: 'Rohit Verma',
      employeeId: 'u3',
      office: 'Tower C — Cyber Gateway',
      parkingFloor: 'B3',
      parkingBay: 'D-03',
      packageId: 'signature',
      packageName: 'Signature Detailing',
      price: 699,
      timeSlot: '09:00 AM',
      date: today,
      workerId: 'w3',
      workerName: 'Mahendra Singh',
      status: 'washing',
      paymentRef: 'PAY_DEMO_003',
      createdAt: new Date(now.getTime() - 10800000).toISOString(),
      keyCollectionTime: new Date(now.getTime() - 9000000).toISOString(),
      washStartTime: new Date(now.getTime() - 3600000).toISOString(),
      timeline: [
        { status: 'booked', label: 'Booking confirmed', time: new Date(now.getTime() - 10800000).toISOString() },
        { status: 'assigned', label: 'Mahendra Singh assigned', time: new Date(now.getTime() - 9000000).toISOString() },
        { status: 'keys_collected', label: 'Keys collected by worker', time: new Date(now.getTime() - 9000000).toISOString() },
        { status: 'washing', label: 'Wash started', time: new Date(now.getTime() - 3600000).toISOString() },
      ],
    },
    {
      id: 'BK004',
      carNumber: 'KA01 CD 4321',
      carModel: 'Honda City',
      employeeName: 'Arjun Sharma',
      employeeId: 'u1',
      office: 'Tower A — Tech Park',
      parkingFloor: 'B2',
      parkingBay: 'A-15',
      packageId: 'premium',
      packageName: 'Premium Wash',
      price: 349,
      timeSlot: '09:00 AM',
      date: new Date(now.getTime() - 86400000).toISOString().split('T')[0],
      workerId: 'w1',
      workerName: 'Ramesh Kumar',
      status: 'completed',
      paymentRef: 'PAY_DEMO_004',
      createdAt: new Date(now.getTime() - 90000000).toISOString(),
      keyCollectionTime: new Date(now.getTime() - 82800000).toISOString(),
      washStartTime: new Date(now.getTime() - 81000000).toISOString(),
      washCompleteTime: new Date(now.getTime() - 78600000).toISOString(),
      keyReturnTime: new Date(now.getTime() - 78000000).toISOString(),
      timeline: [
        { status: 'booked', label: 'Booking confirmed', time: new Date(now.getTime() - 90000000).toISOString() },
        { status: 'assigned', label: 'Ramesh Kumar assigned', time: new Date(now.getTime() - 82800000).toISOString() },
        { status: 'keys_collected', label: 'Keys collected', time: new Date(now.getTime() - 82800000).toISOString() },
        { status: 'washing', label: 'Wash started', time: new Date(now.getTime() - 81000000).toISOString() },
        { status: 'washed', label: 'Wash completed', time: new Date(now.getTime() - 78600000).toISOString() },
        { status: 'keys_returned', label: 'Keys returned', time: new Date(now.getTime() - 78000000).toISOString() },
        { status: 'completed', label: 'Service completed', time: new Date(now.getTime() - 77400000).toISOString() },
      ],
    },
  ];

  write(KEYS.workers, workers);
  write(KEYS.users, users);
  write(KEYS.bookings, demoBookings);
  write(KEYS.slots, TIME_SLOTS.map((s, i) => ({ ...s, booked: i < 3 ? 1 : 0 })));
  write(KEYS.prices, { quick: 199, premium: 349, signature: 699 });

  const demoNotifications: AppNotification[] = [
    { id: 'n1', userId: 'u1', title: 'Worker Assigned', message: 'Ramesh Kumar has been assigned to your booking BK001.', time: new Date(now.getTime() - 3000000).toISOString(), read: false },
    { id: 'n2', userId: 'u1', title: 'Booking Completed', message: 'Your booking BK004 has been completed. Enjoy your clean car!', time: new Date(now.getTime() - 77400000).toISOString(), read: true },
    { id: 'n3', userId: 'u2', title: 'Keys Collected', message: 'Suresh Patel has collected your car keys for BK002.', time: new Date(now.getTime() - 1800000).toISOString(), read: false },
  ];
  write(KEYS.notifications, demoNotifications);

  write(KEYS.initialized, true);
}

// --- Bookings ---
export function getBookings(): Booking[] {
  return read<Booking[]>(KEYS.bookings, []);
}

const WORKFLOW_DEMO_SEED = 'parkshine-workflow-demo-v1';

function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadWorkflowDemoBookings(): { created: string[]; skipped: string[] } {
  const admin = getCurrentUser();
  if (!import.meta.env.DEV || !admin || admin.role !== 'admin') {
    throw new Error('Demo bookings can only be loaded by an admin in development mode.');
  }

  const packages = [
    { id: 'premium', name: 'Premium Wash', price: 349 },
    { id: 'quick', name: 'Quick Wash', price: 199 },
    { id: 'signature', name: 'Signature Detailing', price: 699 },
  ] as const;
  const sampleCustomers = [
    {
      id: 'demo-customer-rahul',
      name: 'Rahul Verma',
      email: 'rahul.verma.demo@parkshine.local',
      phone: '90000 00005',
      vehicleId: 'demo-vehicle-rahul',
      vehicleNumber: 'TS09 AB 1234',
      vehicleModel: 'Hyundai i20',
    },
    {
      id: 'demo-customer-sneha',
      name: 'Sneha Reddy',
      email: 'sneha.reddy.demo@parkshine.local',
      phone: '90000 00006',
      vehicleId: 'demo-vehicle-sneha',
      vehicleNumber: 'TS08 CD 5678',
      vehicleModel: 'Tata Nexon',
    },
    {
      id: 'demo-customer-vikram',
      name: 'Vikram Singh',
      email: 'vikram.singh.demo@parkshine.local',
      phone: '90000 00007',
      vehicleId: 'demo-vehicle-vikram',
      vehicleNumber: 'TS10 EF 9012',
      vehicleModel: 'Kia Seltos',
    },
  ] as const;
  const samples = [
    { bookingId: 'BK005', customerIndex: 0, packageIndex: 0, office: 'Tower A', floor: 'B2', bay: 'A-15', dayOffset: 1, timeSlot: '09:00 AM' },
    { bookingId: 'BK006', customerIndex: 1, packageIndex: 1, office: 'Tower B', floor: 'B1', bay: 'C-05', dayOffset: 2, timeSlot: '10:00 AM' },
    { bookingId: 'BK007', customerIndex: 2, packageIndex: 2, office: 'Tower A', floor: 'B3', bay: 'D-08', dayOffset: 3, timeSlot: '11:00 AM' },
  ] as const;
  const configuredSlots = getSlots();
  const bookings = getBookings();
  const users = getUsers();
  const created: string[] = [];
  const skipped: string[] = [];
  const notifications: AppNotification[] = [];
  const now = new Date();

  for (const sample of samples) {
    if (bookings.some((booking) => booking.id === sample.bookingId)) {
      skipped.push(sample.bookingId);
      continue;
    }

    const slot = configuredSlots.find((candidate) => candidate.time === sample.timeSlot && candidate.capacity > 0);
    if (!slot) throw new Error(`No available configured time slot for ${sample.bookingId} (${sample.timeSlot}).`);

    const customer = sampleCustomers[sample.customerIndex];
    const existingCustomer = users.find((candidate) =>
      candidate.id === customer.id || candidate.email.toLowerCase() === customer.email.toLowerCase()
    );
    if (existingCustomer && (
      existingCustomer.id !== customer.id ||
      existingCustomer.name !== customer.name ||
      existingCustomer.role !== 'employee'
    )) {
      skipped.push(sample.bookingId);
      continue;
    }
    if (!existingCustomer) {
      users.push({
        id: customer.id,
        name: customer.name,
        role: 'employee',
        email: customer.email,
        phone: customer.phone,
        office: sample.office,
        vehicles: [{ id: customer.vehicleId, number: customer.vehicleNumber, model: customer.vehicleModel }],
        demoSeedKey: WORKFLOW_DEMO_SEED,
      });
    }

    const washPackage = packages[sample.packageIndex];
    const serviceDate = new Date(now);
    serviceDate.setDate(serviceDate.getDate() + sample.dayOffset);
    const timestamp = now.toISOString();
    const booking: Booking = {
      id: sample.bookingId,
      carNumber: customer.vehicleNumber,
      carModel: customer.vehicleModel,
      employeeName: customer.name,
      employeeId: existingCustomer?.id ?? customer.id,
      office: sample.office,
      parkingFloor: sample.floor,
      parkingBay: sample.bay,
      packageId: washPackage.id,
      packageName: washPackage.name,
      price: washPackage.price,
      timeSlot: sample.timeSlot,
      date: localDateString(serviceDate),
      status: 'booked',
      paymentRef: `PAY_DEMO_${sample.bookingId}`,
      createdAt: timestamp,
      timeline: [{ status: 'booked', label: 'Booking confirmed', time: timestamp }],
      demoSeedKey: WORKFLOW_DEMO_SEED,
    };
    bookings.unshift(booking);
    notifications.push({
      id: `demo-booking-confirmed-${sample.bookingId}`,
      userId: booking.employeeId,
      bookingId: booking.id,
      title: 'Booking Confirmed',
      message: `Your ${booking.packageName} for ${booking.carNumber} is confirmed. Booking ID: ${booking.id}.`,
      time: timestamp,
      read: false,
    });
    created.push(sample.bookingId);
  }

  if (created.length > 0) {
    write(KEYS.users, users);
    write(KEYS.bookings, bookings);
    addUniqueNotifications(notifications);
  }
  return { created, skipped };
}

export function resetWorkflowDemoBookings(): string[] {
  const admin = getCurrentUser();
  if (!import.meta.env.DEV || !admin || admin.role !== 'admin') {
    throw new Error('Demo bookings can only be reset by an admin in development mode.');
  }

  const currentBookings = getBookings();
  const seededIds = new Set(
    currentBookings
      .filter((booking) => booking.demoSeedKey === WORKFLOW_DEMO_SEED)
      .map((booking) => booking.id)
  );
  if (seededIds.size === 0) return [];

  const retainedBookings = currentBookings.filter((booking) => !seededIds.has(booking.id));
  write(KEYS.bookings, retainedBookings);
  const removableDemoCustomerIds = getUsers()
    .filter((user) => user.demoSeedKey === WORKFLOW_DEMO_SEED)
    .filter((user) => !retainedBookings.some((booking) => booking.employeeId === user.id))
    .map((user) => user.id);
  if (removableDemoCustomerIds.length > 0) {
    const removableIds = new Set(removableDemoCustomerIds);
    write(KEYS.users, getUsers().filter((user) => !removableIds.has(user.id)));
  }
  const currentNotifications = read<AppNotification[]>(KEYS.notifications, []);
  write(KEYS.notifications, currentNotifications.filter((notification) => !notification.bookingId || !seededIds.has(notification.bookingId)));
  return [...seededIds];
}

export function saveBooking(booking: Booking) {
  const all = getBookings();
  const idx = all.findIndex((b) => b.id === booking.id);
  if (idx >= 0) all[idx] = booking;
  else all.unshift(booking);
  write(KEYS.bookings, all);
}

export function updateBookingStatus(id: string, status: BookingStatus, extra?: Partial<Booking>) {
  if (status === 'completed') {
    throw new Error('Complete worker jobs using completeWorkerBooking.');
  }
  const all = getBookings();
  const b = all.find((x) => x.id === id);
  if (!b) return;
  const currentUser = getCurrentUser();
  if (status === 'washing' || status === 'washed') {
    if (!currentUser || currentUser.role !== 'worker' || b.workerId !== currentUser.id) {
      throw new Error('Only the assigned worker can update this wash.');
    }
    const validTransition = (status === 'washing' && b.status === 'keys_collected') ||
      (status === 'washed' && b.status === 'washing');
    if (!validTransition) throw new Error('This booking cannot move to that wash status.');
  }
  if (status === 'keys_collected' || status === 'keys_returned') {
    const validTransition = status === 'keys_collected'
      ? currentUser?.role === 'security' && b.status === 'assigned'
      : b.status === 'washed' && (
        currentUser?.role === 'security' ||
        (currentUser?.role === 'worker' && b.workerId === currentUser.id)
      );
    if (!validTransition) throw new Error('This booking cannot move to that key status.');
  }
  b.status = status;
  if (extra) Object.assign(b, extra);
  const labelMap: Record<BookingStatus, string> = {
    booked: 'Booking confirmed',
    assigned: `Worker assigned`,
    keys_collected: 'Keys collected by worker',
    washing: 'Wash started',
    washed: 'Wash completed',
    keys_returned: 'Keys returned to security',
    completed: 'Service completed',
    cancelled: 'Booking cancelled',
  };
  b.timeline.push({ status, label: labelMap[status], time: new Date().toISOString() });
  if (status === 'keys_collected') b.keyCollectionTime = new Date().toISOString();
  if (status === 'washing') b.washStartTime = new Date().toISOString();
  if (status === 'washed') b.washCompleteTime = new Date().toISOString();
  if (status === 'keys_returned') b.keyReturnTime = new Date().toISOString();
  write(KEYS.bookings, all);
}

export function completeWorkerBooking(bookingId: string): Booking {
  const worker = getCurrentUser();
  if (!worker || worker.role !== 'worker') {
    throw new Error('Only an authenticated worker can complete a job.');
  }

  const bookings = getBookings();
  const booking = bookings.find((candidate) => candidate.id === bookingId);
  if (!booking) throw new Error('Booking not found.');
  if (booking.workerId !== worker.id) {
    throw new Error('You can only complete jobs assigned to you.');
  }
  if (booking.status === 'completed') {
    throw new Error('This booking has already been completed.');
  }
  if (booking.status !== 'keys_returned') {
    throw new Error('Return the keys to security before completing this job.');
  }

  const completedAt = new Date().toISOString();
  booking.status = 'completed';
  booking.completedAt = completedAt;
  booking.timeline.push({ status: 'completed', label: 'Service completed', time: completedAt });
  write(KEYS.bookings, bookings);

  addUniqueNotifications([
    {
      id: `wash-completed-owner-${booking.id}`,
      userId: booking.employeeId,
      bookingId: booking.id,
      title: 'Car Wash Completed',
      message: `Your ${booking.packageName} for ${booking.carNumber} (booking ${booking.id}) has been completed successfully. Your vehicle is ready for collection.`,
      time: completedAt,
      read: false,
    },
    ...getUsers()
      .filter((candidate) => candidate.role === 'admin')
      .map((admin) => ({
        id: `wash-completed-admin-${booking.id}-${admin.id}`,
        userId: admin.id,
        bookingId: booking.id,
        title: 'Car Wash Completed',
        message: `Worker ${worker.name} has completed booking ${booking.id} for vehicle ${booking.carNumber}.`,
        time: completedAt,
        read: false,
      })),
  ]);

  return booking;
}

export function assignWorker(bookingId: string, workerId: string): Booking {
  const admin = getCurrentUser();
  if (!admin || admin.role !== 'admin') {
    throw new Error('Only an authenticated admin can assign workers.');
  }

  const all = getBookings();
  const b = all.find((x) => x.id === bookingId);
  if (!b) throw new Error('Booking not found.');
  if (b.status !== 'booked' || b.workerId) {
    throw new Error('This booking is no longer eligible for assignment.');
  }

  const worker = getWorkers().find((candidate) => candidate.id === workerId);
  if (!worker || !worker.active) {
    throw new Error('Select an active worker.');
  }
  const workerUser = getUsers().find((candidate) => candidate.id === worker.id && candidate.role === 'worker');
  if (!workerUser) {
    throw new Error('The selected worker does not have a worker account.');
  }

  const assignedAt = new Date().toISOString();
  b.workerId = worker.id;
  b.workerName = worker.name;
  b.assignedAt = assignedAt;
  b.assignedByAdminId = admin.id;
  b.status = 'assigned';
  b.timeline.push({ status: 'assigned', label: `${worker.name} assigned`, time: assignedAt });
  write(KEYS.bookings, all);

  addUniqueNotifications([{
    id: `booking-assigned-${b.id}-${worker.id}`,
    userId: worker.id,
    bookingId: b.id,
    title: 'New Car Wash Assigned',
    message: `Booking ${b.id} has been assigned to you. Customer: ${b.employeeName}. Vehicle: ${b.carNumber} (${b.carModel}). Package: ${b.packageName}. Location: ${b.office}, ${b.parkingFloor}, ${b.parkingBay}. Scheduled time: ${b.date} at ${b.timeSlot}. Assigned by ${admin.name}.`,
    time: assignedAt,
    read: false,
  }]);
  return b;
}

function addUniqueNotifications(additions: AppNotification[]) {
  const notifications = read<AppNotification[]>(KEYS.notifications, []);
  const existingIds = new Set(notifications.map((notification) => notification.id));
  const newNotifications = additions.filter((notification) => !existingIds.has(notification.id));
  if (newNotifications.length > 0) write(KEYS.notifications, [...newNotifications, ...notifications]);
}

export function deleteBooking(id: string) {
  const all = getBookings().filter((b) => b.id !== id);
  write(KEYS.bookings, all);
}

export function generateBookingId(): string {
  const all = getBookings();
  const max = all.reduce((m, b) => {
    const n = parseInt(b.id.replace('BK', ''));
    return Math.max(m, n);
  }, 0);
  return `BK${String(max + 1).padStart(3, '0')}`;
}

export function generatePaymentRef(): string {
  return `PAY_${Math.random().toString(36).substring(2, 8).toUpperCase()}_${Date.now().toString().slice(-4)}`;
}

// --- Workers ---
export function getWorkers(): Worker[] {
  return read<Worker[]>(KEYS.workers, []);
}

export function saveWorker(worker: Worker) {
  const all = getWorkers();
  const idx = all.findIndex((w) => w.id === worker.id);
  if (idx >= 0) all[idx] = worker;
  else all.push(worker);
  write(KEYS.workers, all);

  const users = getUsers();
  const workerUserIndex = users.findIndex((user) => user.id === worker.id);
  const workerUser: User = {
    ...(workerUserIndex >= 0 ? users[workerUserIndex] : {}),
    id: worker.id,
    name: worker.name,
    role: 'worker',
    email: workerUserIndex >= 0 ? users[workerUserIndex].email : `worker-${worker.id}@parkshine.local`,
    phone: worker.phone,
  };
  if (workerUserIndex >= 0) users[workerUserIndex] = workerUser;
  else users.push(workerUser);
  write(KEYS.users, users);
}

export function deleteWorker(id: string) {
  write(KEYS.workers, getWorkers().filter((w) => w.id !== id));
}

// --- Users ---
export function getUsers(): User[] {
  const storedUsers = read<Array<User & { password?: string }>>(KEYS.users, []);
  const users = storedUsers.map((storedUser) => {
    const user = { ...storedUser };
    delete user.password;
    return user;
  });
  if (storedUsers.some((user) => typeof user.password === 'string')) write(KEYS.users, users);
  return users;
}

export function saveUsers(users: User[]) {
  write(KEYS.users, users);
}

export function registerUser(name: string, email: string, phone: string): User {
  const users = getUsers();
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists');
  }
  const id = `u${Date.now()}`;
  const user: User = { id, name, role: 'employee', email, phone, office: OFFICES[0] };
  users.push(user);
  write(KEYS.users, users);
  return user;
}

export function updateUser(updated: User) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx >= 0) users[idx] = updated; else users.push(updated);
  write(KEYS.users, users);
  const cur = getCurrentUser();
  if (cur && cur.id === updated.id) write(KEYS.currentUser, updated);
}

export function getNotifications(userId: string): AppNotification[] {
  return read<AppNotification[]>(KEYS.notifications, []).filter((n) => n.userId === userId);
}

export function addNotification(n: AppNotification) {
  const all = read<AppNotification[]>(KEYS.notifications, []);
  all.unshift(n);
  write(KEYS.notifications, all);
}

export function markNotificationRead(id: string) {
  const all = read<AppNotification[]>(KEYS.notifications, []);
  const n = all.find((x) => x.id === id);
  if (n) { n.read = true; write(KEYS.notifications, all); }
}

function createDemoWallet(userId: string): WalletAccount {
  const now = Date.now();
  const daysAgo = (days: number) => new Date(now - days * 86400000).toISOString();
  return {
    userId,
    balance: 250,
    points: 320,
    lifetimePoints: 680,
    redeemedRewardIds: [],
    transactions: [
      {
        id: `${userId}-promo`,
        date: daysAgo(7),
        description: 'Welcome promotional credit',
        amount: '+₹250',
        type: 'Promotional credit',
        status: 'Demo',
      },
      {
        id: `${userId}-wash-points`,
        date: daysAgo(5),
        description: 'Reward points from a completed Signature Detailing',
        amount: '+600 pts',
        type: 'Reward credit',
        status: 'Demo',
      },
      {
        id: `${userId}-quick-points`,
        date: daysAgo(4),
        description: 'Reward points from a completed wash',
        amount: '+80 pts',
        type: 'Reward credit',
        status: 'Demo',
      },
      {
        id: `${userId}-sample-redeem`,
        date: daysAgo(2),
        description: 'Sample discount coupon · points used',
        amount: '-360 pts',
        type: 'Points redemption',
        status: 'Demo',
      },
    ],
  };
}

export function getWalletAccount(userId: string): WalletAccount {
  const wallets = read<Record<string, WalletAccount>>(KEYS.wallets, {});
  return wallets[userId] || createDemoWallet(userId);
}

export function ensureDemoWallet(userId: string) {
  const wallets = read<Record<string, WalletAccount>>(KEYS.wallets, {});
  if (!wallets[userId]) write(KEYS.wallets, { ...wallets, [userId]: createDemoWallet(userId) });
}

export function redeemDemoReward(userId: string, rewardId: string): WalletAccount {
  const rewards: Record<string, { points: number; walletCredit?: number; description: string }> = {
    'wash-discount': { points: 200, description: '₹50 wash discount coupon' },
    'wallet-credit': { points: 400, walletCredit: 100, description: '₹100 demo wallet credit' },
  };
  const reward = rewards[rewardId];
  if (!reward) throw new Error('This reward is not available.');

  const wallets = read<Record<string, WalletAccount>>(KEYS.wallets, {});
  const wallet = wallets[userId] || createDemoWallet(userId);
  if (wallet.redeemedRewardIds.includes(rewardId)) throw new Error('This reward has already been redeemed.');
  if (wallet.points < reward.points) throw new Error('You do not have enough points to redeem this reward.');

  const now = new Date().toISOString();
  const transactions = [
    {
      id: `${userId}-${rewardId}-${Date.now()}-points`,
      date: now,
      description: `${reward.description} · points used`,
      amount: `-${reward.points} pts`,
      type: 'Points redemption' as const,
      status: 'Demo' as const,
    },
    ...(reward.walletCredit ? [{
      id: `${userId}-${rewardId}-${Date.now()}-credit`,
      date: now,
      description: reward.description,
      amount: `+₹${reward.walletCredit}`,
      type: 'Reward redemption' as const,
      status: 'Demo' as const,
    }] : [{
      id: `${userId}-${rewardId}-${Date.now()}-coupon`,
      date: now,
      description: reward.description,
      amount: 'Coupon',
      type: 'Reward redemption' as const,
      status: 'Demo' as const,
    }]),
  ];
  const updated: WalletAccount = {
    ...wallet,
    points: wallet.points - reward.points,
    balance: wallet.balance + (reward.walletCredit || 0),
    redeemedRewardIds: [...wallet.redeemedRewardIds, rewardId],
    transactions: [...transactions, ...wallet.transactions],
  };
  write(KEYS.wallets, { ...wallets, [userId]: updated });
  return updated;
}

export function addVehicle(userId: string, vehicle: Vehicle) {
  const users = getUsers();
  const u = users.find((x) => x.id === userId);
  if (!u) return;
  u.vehicles = [...(u.vehicles || []), vehicle];
  write(KEYS.users, users);
  const cur = getCurrentUser();
  if (cur && cur.id === userId) write(KEYS.currentUser, u);
}

export function removeVehicle(userId: string, vehicleId: string) {
  const users = getUsers();
  const u = users.find((x) => x.id === userId);
  if (!u) return;
  u.vehicles = (u.vehicles || []).filter((v) => v.id !== vehicleId);
  write(KEYS.users, users);
  const cur = getCurrentUser();
  if (cur && cur.id === userId) write(KEYS.currentUser, u);
}

// --- Auth ---
export function getCurrentUser(): User | null {
  const storedUser = read<(User & { password?: string }) | null>(KEYS.currentUser, null);
  if (!storedUser) return null;
  const { password, ...user } = storedUser;
  if (typeof password === 'string') write(KEYS.currentUser, user);
  return user;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    write(KEYS.currentUser, user);
  }
  else {
    localStorage.removeItem(KEYS.currentUser);
    window.dispatchEvent(new Event('parkshine_update'));
  }
  window.dispatchEvent(new Event('parkshine_auth_update'));
}

// --- Slots ---
export function getSlots(): TimeSlot[] {
  return read<TimeSlot[]>(KEYS.slots, TIME_SLOTS);
}

export function saveSlots(slots: TimeSlot[]) {
  write(KEYS.slots, slots);
}

// --- Prices ---
export function getPrices(): Record<string, number> {
  return read<Record<string, number>>(KEYS.prices, { quick: 199, premium: 349, signature: 699 });
}

export function savePrices(prices: Record<string, number>) {
  write(KEYS.prices, prices);
}

// --- Reset ---
export function resetDemoData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  initDemoData();
  window.dispatchEvent(new Event('parkshine_update'));
}
