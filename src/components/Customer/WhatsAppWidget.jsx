import { MessageCircle, X } from 'lucide-react';
import { colors } from '@/constants/colors';

export default function WhatsAppWidget({ isWaPanelOpen, toggleWaPanel, handleOutsideClick }) {
  return (
    <div id="waWidget" className="fixed bottom-25 right-5 z-[60] flex flex-col items-end">
      {/* WhatsApp Panel - Positioned absolutely above button */}
      <div 
        id="waPanel" 
        className={`absolute bottom-full mb-3 w-72 rounded-2xl border p-4 shadow-2xl transition-all duration-300 ${
          isWaPanelOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none invisible'
        }`} 
        style={{ 
          borderColor: colors.borderLight, 
          backgroundColor: colors.bgPrimary 
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span 
              className="inline-flex h-10 w-10 items-center justify-center rounded-full" 
              style={{ background: `${colors.primary}20` }}
            >
              <MessageCircle className="h-5 w-5" style={{ color: colors.primary }} />
            </span>
            <p className="text-sm font-semibold" style={{ color: colors.textDark }}>
              Chat with Baltit Wok
            </p>
          </div>
          <button 
            id="waClose" 
            aria-label="Close chat" 
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-white/10" 
            style={{ 
              borderColor: colors.borderLight,
              color: colors.textDark
            }} 
            onClick={toggleWaPanel}
          >
            <X className="h-4 w-4" style={{ color: colors.textDark }} />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          <a 
            href="https://wa.me/923236300813?text=Hi%20Baltit%20Wok%21%20I%27d%20like%20to%20order." 
            target="_blank" 
            rel="noopener noreferrer"
            className="block rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]" 
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.bgPrimary,
              color: colors.textDark
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
            Hi! I'd like to order.
          </a>
          <a 
            href="https://wa.me/923236300813?text=Can%20you%20share%20the%20menu%20please%3F" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]" 
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.bgPrimary,
              color: colors.textDark
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
            Send me the menu.
          </a>
          <a 
            href="https://wa.me/923236300813?text=Can%20you%20send%20your%20location%3F" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]" 
            style={{ 
              borderColor: colors.borderLight,
              backgroundColor: colors.bgPrimary,
              color: colors.textDark
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
            Where are you located?
          </a>
        </div>
      </div>
      
      {/* WhatsApp Button - Fixed position, doesn't move */}
      <button 
        id="waBtn" 
        aria-label="Open WhatsApp chat" 
        className="relative inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70" 
        style={{ 
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          boxShadow: '0 4px 14px 0 rgba(37, 211, 102, 0.4)'
        }} 
        onClick={toggleWaPanel}
      >
        <span className="absolute -top-1 -right-1 inline-flex h-3.5 w-3.5 animate-ping rounded-full bg-white/80"></span>
        <MessageCircle className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}