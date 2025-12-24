import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AccountSelectionModal } from '@/components/modals/AccountSelectionModal';
import { Button } from '@/components/ui/button';
import { Menu, User, LogOut } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Determine Page Title for Mobile Header
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Overview';
    if (path.includes('transactions')) return 'Transactions';
    if (path.includes('calendar')) return 'Calendar';
    if (path.includes('habits')) return 'Habits';
    if (path.includes('setup')) return 'Budget Setup';
    if (path.includes('settings') || path.includes('profile')) return 'Profile';
    return 'RupeeRiser';
  };

  return (
    <div className="flex h-screen w-full bg-background selection:bg-primary/20 overflow-hidden">
      
      <Sidebar 
        isMobileOpen={isSidebarOpen}
        setIsMobileOpen={setIsSidebarOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        toggleDesktopCollapse={() => setIsDesktopCollapsed(prev => !prev)}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full transition-all duration-300">
        
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border md:hidden shrink-0">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              {/* ✅ Dynamic Page Title instead of Logo */}
              <h1 className="font-bold text-lg text-foreground">{getPageTitle()}</h1>
            </div>

            {/* ✅ Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full focus-visible:ring-0">
                   <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuLabel>
                  <p className="font-bold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer rounded-lg">
                  <User className="w-4 h-4 mr-2" /> Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto scroll-smooth relative w-full p-0">
          <Outlet />
        </main>
      </div>
      
      <AccountSelectionModal />
    </div>
  );
};