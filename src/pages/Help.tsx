import { useState } from 'react';
import { ChevronDown, CircleHelp, Headset, MessageCircle } from 'lucide-react';
import type { User } from '@/types';

const HELP_ITEMS = [
  {
    question: 'How do I book a wash?',
    answer: 'Open Bookings and choose Book a Wash. Select a vehicle, wash package, parking location, date and available time slot to confirm your booking.',
  },
  {
    question: 'Where can I check my booking status?',
    answer: 'Open Bookings to see your current and previous bookings, assigned worker and progress through the wash and key handover steps.',
  },
  {
    question: 'How do I change my vehicle or contact details?',
    answer: 'Open Account, choose Edit Profile to update your contact information, or use the Vehicles section to manage registered vehicles.',
  },
];

export default function HelpPage({ user }: { user: User }) {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const supportGuidance = user.role === 'employee'
    ? 'For a booking or parking-location issue, contact your building’s ParkShine coordinator and share your booking ID.'
    : 'For a job assignment, booking, or key handover issue, contact your ParkShine administrator and share the booking ID.';

  return (
    <div className="min-h-screen bg-navy pb-20">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <Headset className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Help & Support</h1>
            <p className="mt-1 text-sm text-white/50">Quick answers for your ParkShine account.</p>
          </div>
        </div>

        <section className="mb-5 rounded-2xl border border-white/10 bg-navy-light p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <CircleHelp className="h-5 w-5 text-brand" /> Frequently asked questions
          </h2>
          <div className="divide-y divide-white/10">
            {HELP_ITEMS.map((item, index) => (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                  aria-expanded={openQuestion === index}
                  className="flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-white"
                >
                  {item.question}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-white/45 transition-transform ${openQuestion === index ? 'rotate-180' : ''}`} />
                </button>
                {openQuestion === index && <p className="pb-4 pr-6 text-sm leading-relaxed text-white/55">{item.answer}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-brand/20 bg-brand/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <h2 className="font-semibold text-white">Need more help?</h2>
              <p className="mt-1 text-sm leading-relaxed text-white/55">
                {supportGuidance} You are signed in as {user.name}.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
