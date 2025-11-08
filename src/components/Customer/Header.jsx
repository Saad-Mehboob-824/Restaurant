"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, UtensilsCrossed, Home, MapPin, Phone, Gift, MessageCircle } from 'lucide-react';
import { colors } from '@/constants/colors';
import { useRestaurant } from '@/hooks/useRestaurant';

export default function Header({ handleSmoothScroll }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { restaurant, loading } = useRestaurant();

  useEffect(() => {
    setMounted(true);
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

  return (
    <header 
      id="siteHeader" 
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'drop-shadow-lg backdrop-blur-xl' : 'backdrop-blur-sm'}`}
      style={{ 
        backgroundColor: isScrolled ? `${colors.bgSec}ee` : `${colors.bgPrimary}dd`, 
        color: colors.textDark,
        borderBottom: `1px solid ${isScrolled ? colors.border : colors.borderLight}`
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav 
          id="navBar" 
          className="flex items-center justify-between rounded-b-2xl px-4 sm:px-6 py-2.5 transition-all duration-300" 
          style={{ 
            background: 'transparent'
          }}
        >
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2.5 transition-transform hover:scale-105"
          >
            {restaurant?.logo ? (
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg ring-2 ring-white/10 group-hover:ring-white/20 transition-all duration-300">
                <Image
                  src={restaurant.logo}
                  alt={restaurant.name || 'Restaurant Logo'}
                  fill
                  className="object-contain p-1.5"
                  onError={(e) => {
                    const img = e.target
                    img.style.display = 'none'
                    const fallback = img.parentElement.querySelector('.logo-fallback')
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
                <span className="logo-fallback hidden absolute inset-0 relative inline-flex items-center justify-center">
                  <UtensilsCrossed className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: colors.primary }} />
                </span>
              </div>
            ) : (
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-white/10 group-hover:ring-white/20 transition-all duration-300"
                   style={{ background: `linear-gradient(135deg, ${colors.primary}22, ${colors.secondary}22)` }}>
                <UtensilsCrossed className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" style={{ color: colors.primary }} />
              </div>
            )}
            {restaurant?.name && (
              <span className="hidden sm:block text-base sm:text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {restaurant.name}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Link 
              href="#home" 
              className="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-white/5 group" 
              style={{ color: colors.textDark }} 
              onClick={(e) => handleSmoothScroll(e, '#home')}
              onMouseEnter={(e) => { e.target.style.color = colors.primary; }}
              onMouseLeave={(e) => { e.target.style.color = colors.textDark; }}
            >
              <span className="relative z-10">Home</span>
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Link>
            <Link 
              href="/menu" 
              className="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-white/5 group" 
              style={{ color: colors.textDark }} 
              onMouseEnter={(e) => { e.target.style.color = colors.primary; }}
              onMouseLeave={(e) => { e.target.style.color = colors.textDark; }}
            >
              <span className="relative z-10">Menu</span>
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Link>
            <Link 
              href="/#deals" 
              className="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-white/5 group" 
              style={{ color: colors.textDark }} 
              onMouseEnter={(e) => { e.target.style.color = colors.primary; }}
              onMouseLeave={(e) => { e.target.style.color = colors.textDark; }}
              onClick={(e) => handleSmoothScroll(e, '#deals')}
            >
              <span className="relative z-10">Deals</span>
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Link>
            <Link 
              href="/#location" 
              className="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-white/5 group" 
              style={{ color: colors.textDark }} 
              onMouseEnter={(e) => { e.target.style.color = colors.primary; }}
              onMouseLeave={(e) => { e.target.style.color = colors.textDark; }}
              onClick={(e) => handleSmoothScroll(e, '#location')}
            >
              <span className="relative z-10">Location</span>
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Link>
            <Link 
              href="/#contact" 
              className="relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-white/5 group" 
              style={{ color: colors.textDark }} 
              onMouseEnter={(e) => { e.target.style.color = colors.primary; }}
              onMouseLeave={(e) => { e.target.style.color = colors.textDark; }}
              onClick={(e) => handleSmoothScroll(e, '#contact')}
            >
              <span className="relative z-10">Contact</span>
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </Link>
            <Link 
              href="/menu" 
              className="ml-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black" 
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                letterSpacing: '-0.01em',
                boxShadow: `0 4px 14px 0 ${colors.primary}40`
              }}
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span>View Menu</span>
            </Link>
          </div>

          <button 
            id="mobileMenuBtn" 
            aria-label="Open Menu" 
            className="md:hidden inline-flex items-center justify-center rounded-xl border-2 px-3 py-2 transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" 
            style={{ 
              color: colors.textDark, 
              borderColor: colors.border,
              backgroundColor: isMobileMenuOpen ? `${colors.primary}20` : 'transparent'
            }} 
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 transition-transform duration-300 rotate-90" style={{ color: colors.primary }} />
            ) : (
              <Menu className="h-5 w-5 transition-transform duration-300" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar - Rendered via Portal outside header */}
      {mounted && createPortal(
        <>
          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="md:hidden fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={toggleMobileMenu}
              style={{ top: '0' }}
            />
          )}

          {/* Mobile Sidebar Drawer */}
          <div 
            id="mobileDrawer" 
            className={`md:hidden fixed inset-y-0 right-0 z-[9999] w-80 max-w-[85vw] transform transition-transform duration-300 ease-out ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ top: '0', backgroundColor: colors.bgPrimary, pointerEvents: isMobileMenuOpen ? 'auto' : 'none' }}
          >
            <div 
              className="h-full flex flex-col rounded-tl-3xl border-l border-t shadow-2xl overflow-hidden" 
              style={{ 
                borderColor: colors.borderLight,
                backgroundColor: colors.bgPrimary
              }}
            >
              {/* Sidebar Header */}
              <div className="px-6 py-5 border-b" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgPrimary }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold" style={{ color: colors.textDark }}>
                    Menu
                  </h2>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Close Menu"
                    style={{ color: colors.textDark }}
                  >
                    <X className="h-5 w-5" style={{ color: colors.textDark }} />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2" style={{ backgroundColor: colors.bgPrimary }}>
                <Link 
                  href="/" 
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] group border" 
                  style={{ 
                    color: colors.textDark,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.bgPrimary
                  }} 
                  onClick={(e) => { toggleMobileMenu(); handleSmoothScroll(e, '#home'); }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`; 
                    e.currentTarget.style.color = colors.primary;
                    e.currentTarget.style.borderColor = colors.primary;
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = colors.bgPrimary; 
                    e.currentTarget.style.color = colors.textDark;
                    e.currentTarget.style.borderColor = colors.borderLight;
                  }}
                >
                  <Home className="h-5 w-5 transition-transform group-hover:scale-110" style={{ color: 'inherit' }} />
                  <span>Home</span>
                </Link>
                
                <Link 
                  href="/menu" 
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] group border" 
                  style={{ 
                    color: colors.textDark,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.bgPrimary
                  }} 
                  onClick={toggleMobileMenu}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`; 
                    e.currentTarget.style.color = colors.primary;
                    e.currentTarget.style.borderColor = colors.primary;
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = colors.bgPrimary; 
                    e.currentTarget.style.color = colors.textDark;
                    e.currentTarget.style.borderColor = colors.borderLight;
                  }}
                >
                  <UtensilsCrossed className="h-5 w-5 transition-transform group-hover:scale-110" style={{ color: 'inherit' }} />
                  <span>Menu</span>
                </Link>
                
                <Link 
                  href="#deals" 
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] group border" 
                  style={{ 
                    color: colors.textDark,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.bgPrimary
                  }} 
                  onClick={(e) => { toggleMobileMenu(); handleSmoothScroll(e, '#deals'); }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`; 
                    e.currentTarget.style.color = colors.primary;
                    e.currentTarget.style.borderColor = colors.primary;
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = colors.bgPrimary; 
                    e.currentTarget.style.color = colors.textDark;
                    e.currentTarget.style.borderColor = colors.borderLight;
                  }}
                >
                  <Gift className="h-5 w-5 transition-transform group-hover:scale-110" style={{ color: 'inherit' }} />
                  <span>Deals</span>
                </Link>
                
                <Link 
                  href="#location" 
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] group border" 
                  style={{ 
                    color: colors.textDark,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.bgPrimary
                  }} 
                  onClick={(e) => { toggleMobileMenu(); handleSmoothScroll(e, '#location'); }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`; 
                    e.currentTarget.style.color = colors.primary;
                    e.currentTarget.style.borderColor = colors.primary;
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = colors.bgPrimary; 
                    e.currentTarget.style.color = colors.textDark;
                    e.currentTarget.style.borderColor = colors.borderLight;
                  }}
                >
                  <MapPin className="h-5 w-5 transition-transform group-hover:scale-110" style={{ color: 'inherit' }} />
                  <span>Location</span>
                </Link>
                
                <Link 
                  href="#contact" 
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] group border" 
                  style={{ 
                    color: colors.textDark,
                    borderColor: colors.borderLight,
                    backgroundColor: colors.bgPrimary
                  }} 
                  onClick={(e) => { toggleMobileMenu(); handleSmoothScroll(e, '#contact'); }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`; 
                    e.currentTarget.style.color = colors.primary;
                    e.currentTarget.style.borderColor = colors.primary;
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = colors.bgPrimary; 
                    e.currentTarget.style.color = colors.textDark;
                    e.currentTarget.style.borderColor = colors.borderLight;
                  }}
                >
                  <Phone className="h-5 w-5 transition-transform group-hover:scale-110" style={{ color: 'inherit' }} />
                  <span>Contact</span>
                </Link>
              </nav>

              {/* Sidebar Footer Actions */}
              <div className="px-4 pb-6 pt-4 space-y-3 border-t" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgPrimary }}>
                <Link 
                  href="/menu" 
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95" 
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    boxShadow: `0 4px 14px 0 ${colors.primary}40`
                  }}
                  onClick={toggleMobileMenu}
                >
                  <UtensilsCrossed className="h-5 w-5" />
                  <span>View Menu</span>
                </Link>
                
                <a 
                  href="https://wa.me/923236300813?text=Hi%20Baltit%20Wok%2C%20I%27d%20like%20to%20order." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95" 
                  style={{ 
                    borderColor: colors.borderLight, 
                    color: colors.textDark,
                    backgroundColor: colors.bgPrimary
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.borderColor = colors.primary; 
                    e.currentTarget.style.color = colors.primary;
                    e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                  }} 
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.borderColor = colors.borderLight; 
                    e.currentTarget.style.color = colors.textDark;
                    e.currentTarget.style.backgroundColor = colors.bgPrimary;
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Order Now</span>
                </a>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
}