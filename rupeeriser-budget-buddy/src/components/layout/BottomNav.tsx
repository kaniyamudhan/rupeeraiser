import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Calendar,
  CheckSquare,
  User,
  Settings,
  Landmark,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/transactions', icon: Receipt, label: 'Txns' },
  { to: '/calendar', icon: Calendar, label: 'Cal' },
  { to: '/habits', icon: CheckSquare, label: 'Habits' },
  { to: '/setup', icon: Landmark, label: 'Budget' },
  { to: '/settings', icon: User, label: 'Profile' },
];

export const BottomNav = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border md:hidden">
        <div className="grid grid-cols-7 h-16 items-end px-2">

          {/* Left 3 */}
          {navItems.slice(0, 3).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 text-[10px]',
                  isActive
                    ? 'text-blue-600 font-medium'
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="w-6 h-6" />
              {item.label}
            </NavLink>
          ))}

          {/* Center + */}
          <div className="flex justify-center relative -top-6">
            <button
              onClick={() => setIsAddOpen(true)}
              className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center border-4 border-background active:scale-95"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>

          {/* Right 3 */}
          {navItems.slice(3).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 text-[10px]',
                  isActive
                    ? 'text-blue-600 font-medium'
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="w-6 h-6" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </>
  );
};
