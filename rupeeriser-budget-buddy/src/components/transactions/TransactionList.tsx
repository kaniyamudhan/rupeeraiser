import { Trash2, Edit2, UtensilsCrossed, Car, ShoppingBag, Heart, Tv, Wallet, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const categoryIcons: Record<string, React.ElementType> = {
  Food: UtensilsCrossed, Transport: Car, Shopping: ShoppingBag, Health: Heart, Entertainment: Tv, Income: DollarSign, Other: Wallet,
};

const categoryColors: Record<string, string> = {
  Food: 'bg-orange-500/20 text-orange-500', Transport: 'bg-blue-500/20 text-blue-500', Shopping: 'bg-pink-500/20 text-pink-500',
  Health: 'bg-green-500/20 text-green-500', Entertainment: 'bg-purple-500/20 text-purple-500', Income: 'bg-emerald-500/20 text-emerald-500',
  Other: 'bg-gray-500/20 text-gray-500',
};

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (tx: Transaction) => void;
}

export const TransactionList = ({ transactions, onEdit }: TransactionListProps) => {
  const { deleteTransaction } = useApp();

  const groupedByDate = transactions.reduce((acc, tx) => {
    const date = tx.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-8 md:space-y-6"> {/* Increased main spacing */}
      {Object.entries(groupedByDate).map(([date, txs]) => {
        const dayTotal = txs.reduce((acc, tx) => acc + (tx.type === 'expense' ? tx.amount : 0), 0);
        
        return (
          <div key={date} className="animate-slide-up">
            <div className="flex items-center justify-between mb-4 md:mb-3 px-1">
              <h3 className="font-medium text-muted-foreground">{formatDate(date)}</h3>
              <span className="text-sm text-muted-foreground">Total: ₹{dayTotal.toLocaleString('en-IN')}</span>
            </div>

            {/* ✅ UPDATED SPACING FOR MOBILE */}
            <div className="space-y-4 md:space-y-2"> 
              {txs.map((tx) => {
                const Icon = categoryIcons[tx.category] || Wallet;
                const colorClass = categoryColors[tx.category] || categoryColors.Other;

                return (
                  <div key={tx.id} className="glass-card rounded-xl p-4 flex items-center gap-4 group">
                    <div className={cn('category-icon shrink-0 h-12 w-12', colorClass)}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-base">{tx.note}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span className="capitalize px-2 py-0.5 rounded-full bg-muted">{tx.account}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={cn(
                        'font-display font-semibold text-lg',
                        tx.type === 'income' ? 'stat-positive' : 'stat-negative'
                      )}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEdit?.(tx)}><Edit2 className="w-4 h-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete "{tx.note}" (₹{tx.amount}).</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTransaction(tx.id)} className="rounded-xl bg-destructive">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};