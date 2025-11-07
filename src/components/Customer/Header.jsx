"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, Menu, X, UtensilsCrossed } from 'lucide-react';
import { colors, iconBackgrounds } from '@/constants/colors';
import { useRestaurant } from '@/hooks/useRestaurant';

export default function Header({ handleSmoothScroll }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { restaurant, loading } = useRestaurant();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkHover = (e, isHover) => {
    e.target.style.color = isHover ? colors.primary : colors.textDark;
  };

  const handleBorderHover = (e, isHover) => {
    e.target.style.borderColor = isHover ? colors.primary : colors.border;
  };

  const handleAccentBorderHover = (e, isHover) => {
    e.target.style.borderColor = isHover ? colors.accent : colors.border;
    e.target.style.color = isHover ? colors.accent : colors.textDark;
  };

  return (
    <header 
      id="siteHeader" 
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'drop-shadow-sm' : ''}`}
      style={{ backgroundColor: colors.bgPrimary, color: colors.textDark }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav 
          id="navBar" 
          className="flex items-center justify-between rounded-b-xl px-3 py-3 backdrop-blur-md transition-all duration-300" 
          style={{ 
            background: isScrolled ? colors.bgSec : colors.bgPrimary, 
            border: `1px solid ${isScrolled ? colors.border : colors.borderLight}` 
          }}
        >
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2.5"
          >
            {restaurant?.logo ? (
              <div className="relative w-20 sm:h-12 sm:w-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={restaurant.logo}
                  alt={restaurant.name || 'Restaurant Logo'}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    const img = e.target
                    img.style.display = 'none'
                    const fallback = img.parentElement.querySelector('.logo-fallback')
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
                <span className="logo-fallback hidden absolute inset-0 relative inline-flex items-center">
                  <span 
                    className="absolute -left-2 -top-2 h-7 w-7 rounded-full" 
                    style={{ background: iconBackgrounds.red }}
                  />
                </span>
              </div>
            ) : (
              <span className="relative inline-flex items-center">
                <span 
                  className="absolute -left-2 -top-2 h-7 w-7 rounded-full" 
                  style={{ background: iconBackgrounds.red }}
                />
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link 
              href="#home" 
              className="text-sm font-medium transition-colors hover:underline" 
              style={{ color: colors.textDark }} 
              onClick={(e) => handleSmoothScroll(e, '#home')}
            >
              Home
            </Link>
            <Link 
              href="/menu" 
              className="text-sm font-medium transition-colors hover:underline" 
              style={{ color: colors.textDark }} 
              onMouseEnter={(e) => handleLinkHover(e, true)} 
              onMouseLeave={(e) => handleLinkHover(e, false)}
            >
              Menu
            </Link>
            <Link 
              href="/#deals" 
              className="text-sm font-medium transition-colors hover:underline" 
              style={{ color: colors.textDark }} 
              onMouseEnter={(e) => handleLinkHover(e, true)} 
              onMouseLeave={(e) => handleLinkHover(e, false)} 
              onClick={(e) => handleSmoothScroll(e, '#deals')}
            >
              Deals
            </Link>
            <Link 
              href="/#location" 
              className="text-sm font-medium transition-colors hover:underline" 
              style={{ color: colors.textDark }} 
              onMouseEnter={(e) => handleLinkHover(e, true)} 
              onMouseLeave={(e) => handleLinkHover(e, false)} 
              onClick={(e) => handleSmoothScroll(e, '#location')}
            >
              Location
            </Link>
            <Link 
              href="/#contact" 
              className="text-sm font-medium transition-colors hover:underline" 
              style={{ color: colors.textDark }} 
              onMouseEnter={(e) => handleLinkHover(e, true)} 
              onMouseLeave={(e) => handleLinkHover(e, false)} 
              onClick={(e) => handleSmoothScroll(e, '#contact')}
            >
              Contact
            </Link>
            <Link 
              href="/menu" 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" 
              style={{ backgroundColor: colors.primary, letterSpacing: '-0.01em' }}
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span>View Menu</span>
            </Link>
          </div>

          <button 
            id="mobileMenuBtn" 
            aria-label="Open Menu" 
            className="md:hidden inline-flex items-center justify-center rounded-lg border px-2.5 py-2 transition hover:bg-white/70 focus:outline-none focus-visible:ring-2" 
            style={{ color: colors.textDark, borderColor: colors.border }} 
            onMouseEnter={(e) => handleBorderHover(e, true)} 
            onMouseLeave={(e) => handleBorderHover(e, false)} 
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <div 
          id="mobileDrawer" 
          className={`md:hidden pointer-events-none fixed inset-x-0 top-16 z-40 mx-4 origin-top scale-95 opacity-0 transition-all ${isMobileMenuOpen ? 'pointer-events-auto opacity-100 scale-100' : ''}`}
        >
          <div 
            className="rounded-xl border bg-white/90 p-4 backdrop-blur-md shadow-lg" 
            style={{ borderColor: colors.border }}
          >
            <div className="flex flex-col divide-y" style={{ borderColor: colors.borderLight }}>
              <Link 
                href="/" 
                className="py-3 text-sm font-medium" 
                style={{ color: colors.textDark }} 
                onMouseEnter={(e) => handleLinkHover(e, true)} 
                onMouseLeave={(e) => handleLinkHover(e, false)} 
                onClick={(e) => { toggleMobileMenu(); handleSmoothScroll(e, '#home'); }}
              >
                Home
              </Link>
              <Link 
                href="/menu" 
                className="py-3 text-sm font-medium" 
                style={{ color: colors.textDark }} 
                onMouseEnter={(e) => handleLinkHover(e, true)} 
                onMouseLeave={(e) => handleLinkHover(e, false)} 
                onClick={toggleMobileMenu}
              >
                Menu
              </Link>
              <Link 
                href="#deals" 
                className="py-3 text-sm font-medium" 
                style={{ color: colors.textDark }} 
                onMouseEnter={(e) => handleLinkHover(e, true)} 
                onMouseLeave={(e) => handleLinkHover(e, false)} 
                onClick={(e) => { toggleMobileMenu(); handleSmoothScroll(e, '#deals'); }}
              >
                Deals
              </Link>
              <Link 
                href="#location" 
                className="py-3 text-sm font-medium" 
                style={{ color: colors.textDark }} 
                onMouseEnter={(e) => handleLinkHover(e, true)} 
                onMouseLeave={(e) => handleLinkHover(e, false)} 
                onClick={(e) => { toggleMobileMenu(); handleSmoothScroll(e, '#location'); }}
              >
                Location
              </Link>
              <Link 
                href="#contact" 
                className="py-3 text-sm font-medium" 
                style={{ color: colors.textDark }} 
                onMouseEnter={(e) => handleLinkHover(e, true)} 
                onMouseLeave={(e) => handleLinkHover(e, false)} 
                onClick={(e) => { toggleMobileMenu(); handleSmoothScroll(e, '#contact'); }}
              >
                Contact
              </Link>
            </div>
            <div className="mt-4 flex gap-3">
              <Link 
                href="/menu" 
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90" 
                style={{ backgroundColor: colors.primary }} 
                onClick={toggleMobileMenu}
              >
                View Menu 🍽️
              </Link>
              <a 
                href="https://wa.me/923236300813?text=Hi%20Baltit%20Wok%2C%20I%27d%20like%20to%20order." 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold" 
                style={{ borderColor: colors.border, color: colors.textDark }} 
                onMouseEnter={(e) => handleAccentBorderHover(e, true)} 
                onMouseLeave={(e) => handleAccentBorderHover(e, false)}
              >
                Order Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}