import { Car, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">ParkShine</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Premium office car-wash booking platform. Book, wash, shine — all from your desk.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>Quick Wash — ₹199</li>
              <li>Premium Wash — ₹349</li>
              <li>Signature Detailing — ₹699</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@parkshine.in</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm">
            Designed & Developed by <span className="text-brand font-semibold">Yovial Technologies</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
