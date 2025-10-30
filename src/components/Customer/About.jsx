import Image from 'next/image';
import { Hamburger, Soup, Bike, Package } from 'lucide-react';
import { colors, iconBackgrounds } from '@/constants/colors';

export default function About() {
  return (
    <section className="mx-auto mt-16 max-w-7xl px-6">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative">
          <Image
            src="https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=1200&auto=format&fit=crop"
            alt="Fresh wok stir-fry served hot"
            width={1200}
            height={420}
            className="h-[420px] w-full rounded-3xl object-cover shadow-sm"
            style={{ border: `1px solid ${colors.borderLight}`, backgroundColor: colors.bgSec }}
          />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: 'Poppins, ui-sans-serif', fontWeight: 600, color: colors.textDark }}>
            Our Story
          </h2>
          <p className="mt-4 text-[15px] leading-7" style={{ color: colors.textMuted }}>
            At Baltit Wok, we blend Asian street-food energy with local tastes. From fiery woks to juicy burgers, enjoy fast service, family-friendly vibes, and reliable home delivery—fresh, hot, and made to order.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="group rounded-xl border p-4 transition hover:shadow-sm" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgSec }}>
              <div className="relative inline-flex">
                <span className="absolute inset-0 -m-1 rounded-full" style={{ background: iconBackgrounds.primary }}></span>
                <Hamburger className="relative h-6 w-6" style={{ color: colors.primary }} />
              </div>
              <p className="mt-3 text-sm font-medium" style={{ color: colors.textDark }}>Fast Food</p>
            </div>
            <div className="group rounded-xl border p-4 transition hover:shadow-sm" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgSec }}>
              <div className="relative inline-flex">
                <span className="absolute inset-0 -m-1 rounded-full" style={{ background: iconBackgrounds.secondary }}></span>
                <Soup className="relative h-6 w-6" style={{ color: colors.secondary }} />
              </div>
              <p className="mt-3 text-sm font-medium" style={{ color: colors.textDark }}>Asian Fusion</p>
            </div>
            <div className="group rounded-xl border p-4 transition hover:shadow-sm" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgSec }}>
              <div className="relative inline-flex">
                <span className="absolute inset-0 -m-1 rounded-full" style={{ background: iconBackgrounds.accent }}></span>
                <Bike className="relative h-6 w-6" style={{ color: colors.accent }} />
              </div>
              <p className="mt-3 text-sm font-medium" style={{ color: colors.textDark }}>Fast Delivery</p>
            </div>
            <div className="group rounded-xl border p-4 transition hover:shadow-sm" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgSec }}>
              <div className="relative inline-flex">
                <span className="absolute inset-0 -m-1 rounded-full" style={{ background: iconBackgrounds.primary }}></span>
                <Package className="relative h-6 w-6" style={{ color: colors.primary }} />
              </div>
              <p className="mt-3 text-sm font-medium" style={{ color: colors.textDark }}>Takeaway Friendly</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}