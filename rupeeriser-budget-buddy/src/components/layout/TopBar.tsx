// components/layout/TopBar.tsx
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { IndianRupee, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 md:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-display text-lg font-bold gradient-text">💸💵💶 RupeeRiser</h1>
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/profile')}
          className="h-9 w-9 rounded-full"
        >
           <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
           </div>
        </Button>
      </div>
    </header>
  );
};