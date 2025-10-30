import Image from 'next/image';
import { colors } from '@/constants/colors';

export default function Testimonials() {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-6">
      <div className="rounded-3xl border p-6 sm:p-10" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgSec }}>
        <h2 className="text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: 'Poppins', fontWeight: 600, color: colors.textDark }}>What Our Customers Say</h2>
        <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          <div className="min-w-[280px] snap-start rounded-2xl border p-5" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgPrimary }}>
            <div className="flex items-center gap-3">
              <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Customer" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.textDark }}>Ayesha K.</p>
                <p className="text-xs" style={{ color: colors.textMuted }}>Islamabad</p>
              </div>
            </div>
            <p className="mt-3 text-sm" style={{ color: colors.textDark }}>🔥 Hot and fresh! The wok rice was perfect. Will order again.</p>
            <p className="mt-2 text-base">🌟🌟🌟🌟🌟</p>
          </div>
          <div className="min-w-[280px] snap-start rounded-2xl border p-5" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgPrimary }}>
            <div className="flex items-center gap-3">
              <Image src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop" alt="Customer" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.textDark }}>Hamza R.</p>
                <p className="text-xs" style={{ color: colors.textMuted }}>G-13/1</p>
              </div>
            </div>
            <p className="mt-3 text-sm" style={{ color: colors.textDark }}>Great burgers and super quick delivery. Family loved it.</p>
            <p className="mt-2 text-base">🌟🌟🌟🌟🌟</p>
          </div>
          <div className="min-w-[280px] snap-start rounded-2xl border p-5" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgPrimary }}>
            <div className="flex items-center gap-3">
              <Image src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop" alt="Customer" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.textDark }}>Amna S.</p>
                <p className="text-xs" style={{ color: colors.textMuted }}>H-13</p>
              </div>
            </div>
            <p className="mt-3 text-sm" style={{ color: colors.textDark }}>Loved the Asian fusion flavors. Highly recommended!</p>
            <p className="mt-2 text-base">🌟🌟🌟🌟🌟</p>
          </div>
          <div className="min-w-[280px] snap-start rounded-2xl border p-5" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgPrimary }}>
            <div className="flex items-center gap-3">
              <Image src="https://images.unsplash.com/photo-1541534401786-2077eed87a72?q=80&w=200&auto=format&fit=crop" alt="Customer" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.textDark }}>Daniyal M.</p>
                <p className="text-xs" style={{ color: colors.textMuted }}>G-14</p>
              </div>
            </div>
            <p className="mt-3 text-sm" style={{ color: colors.textDark }}>Affordable deals and generous portions. Value for money!</p>
            <p className="mt-2 text-base">🌟🌟🌟🌟🌟</p>
          </div>
        </div>
      </div>
    </section>
  );
}