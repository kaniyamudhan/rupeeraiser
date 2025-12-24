// import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatModal } from './ChatModal';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export const ChatOrb = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          // Adjusted position: Higher on mobile (bottom-24) to avoid Nav/QuickAdd overlap
          // Normal on desktop (bottom-8)
          'fixed z-50 w-14 h-14 rounded-full gradient-primary shadow-lg shadow-emerald-500/40 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/50',
          'bottom-24 right-4 md:bottom-8 md:right-8', // Responsive positioning
          isOpen && 'scale-0 opacity-0'
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>

      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};