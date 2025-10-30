import Link from 'next/link';
import { Flame, Instagram, Facebook, MessageCircle, Phone } from 'lucide-react';
import { colors } from '@/constants/colors';

export default function Footer({ handleSmoothScroll }) {
  return (
    <footer className="mt-20" style={{ backgroundColor: colors.bgSec, color: colors.textDark }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="text-xl tracking-tight" style={{ fontFamily: 'Pacifico', color: colors.textDark }}>Baltit Wok</span>
              <Flame className="h-4 w-4" style={{ color: colors.primary }} />
            </div>
            <p className="text-sm" style={{ color: colors.textMuted }}>Sizzling Asian fusion, burgers, and more. Takeaway & delivery in G-13/1 Islamabad.</p>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.bgPrimary }}>Quick Links</p>
            <div className="mt-3 flex flex-col space-y-2 text-sm">
              <Link href="#home" className="hover:text-[#FFB703]" style={{ color: colors.textMuted }} onClick={(e) => handleSmoothScroll(e, '#home')}>Home</Link>
              <Link href="#menu" className="hover:text-[#FFB703]" style={{ color: colors.textMuted }} onClick={(e) => handleSmoothScroll(e, '#menu')}>Menu</Link>
              <Link href="#deals" className="hover:text-[#FFB703]" style={{ color: colors.textMuted }} onClick={(e) => handleSmoothScroll(e, '#deals')}>Deals</Link>
              <Link href="#contact" className="hover:text-[#FFB703]" style={{ color: colors.textMuted }} onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: colors.bgPrimary }}>Follow Us</p>
            <div className="mt-3 flex items-center gap-3">
              <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:border-[#FFB703] hover:text-[#FFB703]" style={{ borderColor: colors.borderLight, color: colors.textMuted }}>
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:border-[#FFB703] hover:text-[#FFB703]" style={{ borderColor: colors.borderLight, color: colors.textMuted }}>
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://wa.me/923236300813" target="_blank" className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:border-[#06D6A0] hover:text-[#06D6A0]" style={{ borderColor: colors.borderLight, color: colors.textMuted }}>
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6" style={{ borderColor: colors.borderLight }}>
          <p className="text-xs" style={{ color: colors.textMuted }}>© 2025 Baltit Wok. All Rights Reserved.</p>
          <a href="tel:+923001234567" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: colors.primary }}>
            <Phone className="h-4 w-4" /> Call to Order or Visit Us Today!
          </a>
        </div>
      </div>
    </footer>
  );
}