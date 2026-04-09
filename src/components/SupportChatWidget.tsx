import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AIChat from './AIChat';
import { Button } from '@/components/ui/button';

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const openChat = () => setIsOpen(true);
    window.addEventListener('openMamacareChat', openChat);
    return () => window.removeEventListener('openMamacareChat', openChat);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[360px] max-w-full h-[540px] rounded-3xl border border-mamacare-champagne bg-white shadow-[0_30px_80px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-mamacare-coral to-pink-500 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-semibold">MamaCare 24/7 AI Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors"
              aria-label="Close support chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-[calc(100%-64px)] bg-slate-50">
            <AIChat />
          </div>
        </div>
      )}

      <Button
        className="bg-mamacare-coral hover:bg-mamacare-coral-dark text-white rounded-full shadow-xl flex items-center gap-2 px-4 py-3"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">MamaCare 24/7 AI Support</span>
      </Button>
    </div>
  );
}
