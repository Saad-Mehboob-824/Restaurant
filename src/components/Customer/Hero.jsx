import Image from 'next/image';
import Link from 'next/link';
import { UtensilsCrossed, Phone } from 'lucide-react';
import { colors, buttons } from '@/constants/colors';

export default function Hero({ handleSmoothScroll }) {
  // Fallback colors in case import fails
  const fallbackColors = {
    primary: '#E63946',
    borderLight: 'rgba(0,0,0,0.06)',
    tintAccent: 'rgba(6, 214, 160, 0.1)',
    bgPrimary: '#FFFFFF',
  };

  const fallbackButtons = {
    primary: {
      text: '#FFFFFF',
    },
  };

  // Use imported colors/buttons or fallback
  const activeColors = colors || fallbackColors;
  const activeButtons = buttons || fallbackButtons;

  return (
    <section className="relative px-4 sm:px-6 lg:px-8">
      <div 
        className="relative w-full overflow-hidden rounded-3xl border" 
        style={{ 
          borderColor: activeColors.borderLight, 
          backgroundColor: activeColors.bgPrimary,
          height: 'clamp(400px, 50vh, 600px)',
          minHeight: '400px'
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=1600&auto=format&fit=crop"
          alt="Baltit Wok banner: burger, fries and wok rice"
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/55"></div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8 box-border">
          <div className="max-w-2xl text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight font-poppins">
              Welcome to Baltit Wok
            </h1>
            <p className="mt-3 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90">
              Serving sizzling Asian flavors in the heart of Islamabad!
            </p>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/menu"
                style={{ backgroundColor: activeColors.primary, color: activeButtons.primary.text }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm md:text-base lg:text-lg font-semibold shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                View Menu
              </Link>
              <a
                href="https://wa.me/923236300813?text=Hi%20Baltit%20Wok%2C%20I%27d%20like%20to%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 hover:border-white focus:outline-none focus-visible:ring-2"
                style={{ borderColor: activeColors.borderLight, backgroundColor: activeColors.tintAccent }}
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                Order Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}