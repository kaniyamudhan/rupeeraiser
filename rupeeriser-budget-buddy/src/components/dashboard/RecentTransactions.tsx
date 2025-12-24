import { useNavigate } from 'react-router-dom';
import { ArrowRight, UtensilsCrossed, Car, ShoppingBag, Heart, Tv, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, React.ElementType> = {
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Health: Heart,
  Entertainment: Tv,
  Other: Wallet,
};

const categoryColors: Record<string, string> = {
  Food: 'bg-orange-500/20 text-orange-500',
  Transport: 'bg-blue-500/20 text-blue-500',
  Shopping: 'bg-pink-500/20 text-pink-500',
  Health: 'bg-green-500/20 text-green-500',
  Entertainment: 'bg-purple-500/20 text-purple-500',
  Other: 'bg-gray-500/20 text-gray-500',
};

export const RecentTransactions = () => {
  const { transactions } = useApp();
  const navigate = useNavigate();

  const recentTxs = transactions.slice(0, 3);

  return (
    <div className="glass-card-hover rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">Recent Transactions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/transactions')}
          className="text-primary hover:text-primary"
        >
          See all <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {recentTxs.map((tx) => {
          const Icon = categoryIcons[tx.category] || Wallet;
          const colorClass = categoryColors[tx.category] || categoryColors.Other;

          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={cn('category-icon', colorClass)}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{tx.note}</p>
                <p className="text-xs text-muted-foreground">{tx.category}</p>
              </div>
              
              <div className="text-right">
                <p className={cn(
                  'font-semibold',
                  tx.type === 'income' ? 'stat-positive' : 'stat-negative'
                )}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{tx.account}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
