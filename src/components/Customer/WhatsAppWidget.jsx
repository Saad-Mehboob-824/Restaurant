import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppWidget({ isWaPanelOpen, toggleWaPanel, handleOutsideClick }) {
  return (
    <div id="waWidget" className="fixed bottom-25 right-5 z-[60]">
      <div id="waPanel" className={`mb-3 w-72 rounded-2xl border bg-white p-3 shadow-xl ${isWaPanelOpen ? '' : 'hidden'}`} style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ background: '#E7FFF7' }}>
              <MessageCircle className="h-4 w-4 text-[#06D6A0]" />
            </span>
            <p className="text-sm font-semibold">Chat with Baltit Wok</p>
          </div>
          <button id="waClose" aria-label="Close chat" className="inline-flex h-7 w-7 items-center justify-center rounded-full border hover:border-[#E63946] hover:text-[#E63946]" style={{ borderColor: 'rgba(0,0,0,0.08)' }} onClick={toggleWaPanel}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 space-y-2">
          <a href="https://wa.me/923236300813?text=Hi%20Baltit%20Wok%21%20I%27d%20like%20to%20order." target="_blank" className="block rounded-lg border px-3 py-2 text-sm hover:border-[#06D6A0] hover:text-[#06D6A0]" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>Hi! I'd like to order.</a>
          <a href="https://wa.me/923236300813?text=Can%20you%20share%20the%20menu%20please%3F" target="_blank" className="block rounded-lg border px-3 py-2 text-sm hover:border-[#06D6A0] hover:text-[#06D6A0]" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>Send me the menu.</a>
          <a href="https://wa.me/923236300813?text=Can%20you%20send%20your%20location%3F" target="_blank" className="block rounded-lg border px-3 py-2 text-sm hover:border-[#06D6A0] hover:text-[#06D6A0]" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>Where are you located?</a>
        </div>
      </div>
      <button id="waBtn" aria-label="Open WhatsApp chat" className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70" style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }} onClick={toggleWaPanel}>
        <span className="absolute -top-1 -right-1 inline-flex h-3.5 w-3.5 animate-ping rounded-full bg-white/80"></span>
        <MessageCircle className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}