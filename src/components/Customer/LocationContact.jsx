import { MapPin, Phone, Clock, Bike, Navigation } from 'lucide-react';
import { colors, iconBackgrounds } from '@/constants/colors';

export default function LocationContact() {
  return (
    <section id="location" className="mx-auto mt-20 max-w-7xl px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgPrimary }}>
          <iframe
            title="Baltit Wok Location"
            src="https://maps.google.com/maps?q=33.644683,72.9593064(Baltit%20Wok)&t=&z=17&ie=UTF8&iwloc=&output=embed"
            className="h-[360px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div id="contact" className="rounded-2xl border p-6" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgSec }}>
          <h2 className="text-3xl tracking-tight" style={{ fontFamily: 'Poppins', fontWeight: 600, color: colors.textDark }}>Get In Touch</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ background: iconBackgrounds.primary }}>
                <MapPin className="h-4 w-4" style={{ color: colors.primary }} />
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.textDark }}>Address</p>
                <p className="text-sm" style={{ color: colors.textMuted }}>Near Punjab Cash & Carry, G-13/1 Islamabad</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ background: iconBackgrounds.accent }}>
                <Phone className="h-4 w-4" style={{ color: colors.accent }} />
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.textDark }}>Phone</p>
                <a href="tel:+923001234567" className="text-sm hover:text-[#06D6A0]" style={{ color: colors.textMuted }}>+92 300 123 4567</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ background: iconBackgrounds.secondary }}>
                <Clock className="h-4 w-4" style={{ color: colors.secondary }} />
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.textDark }}>Timings</p>
                <p className="text-sm" style={{ color: colors.textMuted }}>12 PM – 11 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full" style={{ background: iconBackgrounds.primary }}>
                <Bike className="h-4 w-4" style={{ color: colors.primary }} />
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.textDark }}>Delivery</p>
                <p className="text-sm" style={{ color: colors.textMuted }}>Takeaway & Home Delivery available</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="https://maps.google.com/?q=G-13/1%20Islamabad%20Punjab%20Cash%20%26%20Carry"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[#E63946] hover:text-[#E63946]"
              style={{ borderColor: colors.border, backgroundColor: colors.bgPrimary, color: colors.textDark }}
            >
              <Navigation className="h-4 w-4" /> Get Directions
            </a>
            <a
              href="tel:+923001234567"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <Phone className="h-4 w-4" /> Call to Order
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}