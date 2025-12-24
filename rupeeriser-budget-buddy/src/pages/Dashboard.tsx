import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Wallet2,
  ShoppingBag,
  Utensils,
  Car,
  Heart,
  Tv,
  Bell,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { transactions, budget, user } = useApp();
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);

  /* ---------------- CONFIG (MANDATORY LIST) ---------------- */
  let mandatoryList: any[] = [];

  if (budget.config) {
    try {
      const parsed = JSON.parse(budget.config);
      mandatoryList = parsed.mandatoryList || [];
    } catch {}
  }

  const totalMandatory = mandatoryList.reduce(
    (sum: number, item: any) => sum + (item.amount || 0),
    0
  );

  /* ---------------- CALCULATIONS ---------------- */
  const currentMonth = new Date().getMonth();

  const monthlyTx = useMemo(
    () =>
      transactions.filter(
        (t) => new Date(t.date).getMonth() === currentMonth
      ),
    [transactions, currentMonth]
  );

  const totalExpense = monthlyTx
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  const totalIncome = monthlyTx
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const salary = budget.salary || 0;

  // ✅ FINAL CORRECT LOGIC
  const pendingMoney =
    salary + totalIncome - totalExpense - totalMandatory;

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });

  /* ---------------- ICON MAP ---------------- */
  const getIcon = (cat: string) => {
    const map: any = {
      Food: Utensils,
      Transport: Car,
      Shopping: ShoppingBag,
      Health: Heart,
      Entertainment: Tv,
    };
    return map[cat] || Wallet;
  };

  /* ---------------- SORTED TRANSACTIONS ---------------- */
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  /* ---------------- GRAPH DATA ---------------- */
  const getGraphData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dailyExp = transactions
        .filter(
          (t) =>
            new Date(t.date).toISOString().split('T')[0] ===
              dateStr && t.type === 'expense'
        )
        .reduce((s, t) => s + t.amount, 0);

      data.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        spend: dailyExp,
      });
    }
    return data;
  };

  return (
    <div className="relative max-w-7xl mx-auto px-6 pt-6 pb-40 animate-fade-in">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h2 className="text-xl font-bold">{user?.name}</h2>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full border">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="space-y-8">
          <div className="bg-blue-600 text-white rounded-[32px] p-8 shadow-xl">
            <p className="text-blue-100 text-sm mb-1">
              Available Balance
            </p>
            <h1 className="text-4xl font-bold mb-6">
              {formatCurrency(pendingMoney)}
            </h1>
            <span className="text-xs bg-white/20 px-3 py-1.5 rounded-full">
              Safe to Spend (After Mandatory)
            </span>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setIsAddOpen(true)}
              className="flex-1 h-14 rounded-2xl bg-foreground text-background gap-2"
            >
              <Plus className="w-5 h-5" />
              Savings / Add
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/settings')}
              className="flex-1 h-14 rounded-2xl"
            >
              <Wallet2 className="w-5 h-5 mr-2" />
              Config
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-5 rounded-[24px] border">
              <ArrowDownLeft className="w-6 h-6 text-emerald-600 mb-2" />
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="font-bold text-emerald-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>

            <div className="bg-card p-5 rounded-[24px] border">
              <ArrowUpRight className="w-6 h-6 text-rose-600 mb-2" />
              <p className="text-xs text-muted-foreground">Expense</p>
              <p className="font-bold">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card p-6 rounded-[32px] border">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Spending Trend
              </h3>
              <span className="text-xs text-muted-foreground">
                Last 7 Days
              </span>
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getGraphData()}>
                  <defs>
                    <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#spend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">Latest Entries</h3>
              <Button
                variant="ghost"
                onClick={() => navigate('/transactions')}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {sortedTransactions.slice(0, 5).map((tx) => {
                const Icon = getIcon(tx.category);
                return (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center p-4 bg-card rounded-xl border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.note || tx.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.date} • {tx.account}
                        </p>
                      </div>
                    </div>
                    <p
                      className={
                        tx.type === 'income'
                          ? 'text-emerald-600 font-bold'
                          : 'font-bold'
                      }
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING ADD BUTTON */}
      <button
        onClick={() => setIsAddOpen(true)}
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
          'w-16 h-16 rounded-full bg-blue-600 text-white',
          'flex items-center justify-center',
          'shadow-[0_12px_32px_rgba(37,99,235,0.6)]',
          'hover:scale-105 active:scale-95 transition-all',
          'after:absolute after:inset-0 after:rounded-full',
          'after:animate-ping after:bg-blue-600/30 after:-z-10'
        )}
      >
        <Plus className="w-8 h-8" />
      </button>

      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
    </div>
  );
}
