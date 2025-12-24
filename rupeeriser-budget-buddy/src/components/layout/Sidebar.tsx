import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Receipt, Calendar, 
  CheckSquare, User, ChevronRight, ChevronLeft, LogOut, Brain, Landmark, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/transactions', icon: Receipt, label: 'Transactions' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/habits', icon: CheckSquare, label: 'Habits' },
  { to: '/setup', icon: Landmark, label: 'Budget Setup' },
  { to: '/settings', icon: User, label: 'Profile' },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isDesktopCollapsed: boolean;
  toggleDesktopCollapse: () => void;
}

export const Sidebar = ({ 
  isMobileOpen, 
  setIsMobileOpen, 
  isDesktopCollapsed, 
  toggleDesktopCollapse 
}: SidebarProps) => {
  const { logout } = useApp();

  const MobileOverlay = () => (
    <div 
      className={cn(
        "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
        isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={() => setIsMobileOpen(false)}
    />
  );

  return (
    <>
      <MobileOverlay />
      
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 flex flex-col h-full",
          // Removed overflow-hidden from main container to prevent tooltip clipping, 
          // but handling internal overflow in nav
          "md:translate-x-0", 
          isMobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full md:translate-x-0",
          !isMobileOpen && (isDesktopCollapsed ? "md:w-20" : "md:w-64"),
          "md:static md:h-screen"
        )}
      >
        {/* Header */}
        <div className="h-20 flex items-center px-6 border-b border-border/40 shrink-0">
          {(!isDesktopCollapsed || isMobileOpen) ? (
            <div className="flex items-center gap-3 animate-fade-in w-full justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 truncate">
                  RupeeRiser
                </span>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
               <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Desktop Toggle Button */}
        <button 
          onClick={toggleDesktopCollapse}
          className="hidden md:flex absolute -right-3 top-24 bg-card border border-border p-1.5 rounded-full shadow-md hover:text-primary hover:scale-110 transition-all z-50 group"
        >
          {isDesktopCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-300 group relative',
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                  // Ensure center alignment when collapsed
                  (isDesktopCollapsed && !isMobileOpen) && "justify-center px-0"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-all", isActive ? "scale-110" : "group-hover:scale-110")} />
                  
                  {(!isDesktopCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                  
                  {/* Tooltip on Desktop Collapse */}
                  {(isDesktopCollapsed && !isMobileOpen) && (
                    <div className="absolute left-14 hidden group-hover:block z-50">
                        <span className="bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-xs font-medium shadow-xl border border-border whitespace-nowrap ml-2">
                        {item.label}
                        </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/40 shrink-0">
          <Button 
            variant="ghost" 
            onClick={logout}
            className={cn(
              "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start transition-all",
              (isDesktopCollapsed && !isMobileOpen) && "justify-center px-0"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(!isDesktopCollapsed || isMobileOpen) && <span className="ml-3 font-medium truncate">Sign Out</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};