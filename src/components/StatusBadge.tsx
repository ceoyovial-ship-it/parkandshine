import type { BookingStatus } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
