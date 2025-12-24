import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, trend, subtitle, className }: StatCardProps) => {
  return (
    <div className={cn('glass-card-hover rounded-2xl p-4 md:p-5', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'category-icon',
          trend === 'up' ? 'bg-success/20 text-success' :
          trend === 'down' ? 'bg-destructive/20 text-destructive' :
          'bg-primary/20 text-primary'
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={cn(
        'text-2xl md:text-3xl font-display font-bold',
        trend === 'up' ? 'stat-positive' : trend === 'down' ? 'stat-negative' : ''
      )}>
        {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};
