import { useCallback } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import type { User } from '@/types';
import { getNotifications, markNotificationRead } from '@/store';
import { useStoreData } from '@/hooks/useStoreData';

export default function NotificationsPage({ user }: { user: User }) {
  const fetchNotifications = useCallback(() => getNotifications(user.id), [user.id]);
  const [notifications] = useStoreData(fetchNotifications);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="min-h-screen bg-navy pb-20">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-white/50">
              {unreadCount ? `${unreadCount} unread` : 'You are all caught up'}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <Bell className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-navy-light px-5 py-12 text-center">
              <Bell className="mx-auto mb-3 h-9 w-9 text-white/25" />
              <p className="font-medium text-white">No notifications yet</p>
              <p className="mt-1 text-sm text-white/45">Updates about your ParkShine activity will appear here.</p>
            </div>
          ) : notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-2xl border p-4 sm:p-5 ${notification.read ? 'border-white/10 bg-navy-light' : 'border-brand/30 bg-brand/5'}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notification.read ? 'bg-white/5 text-white/50' : 'bg-brand/15 text-brand'}`}>
                  {notification.read ? <Clock className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-white">{notification.title}</h2>
                    {!notification.read && <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand">NEW</span>}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-white/65">{notification.message}</p>
                  <p className="mt-2 text-xs text-white/35">{new Date(notification.time).toLocaleString('en-IN')}</p>
                </div>
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(notification.id)}
                    className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-xl text-brand transition hover:bg-brand/10"
                    aria-label={`Mark ${notification.title} as read`}
                    title="Mark as read"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
