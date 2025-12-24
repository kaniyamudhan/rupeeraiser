import { useApp } from '@/contexts/AppContext';
import { Brain, TrendingUp, AlertCircle, PieChart, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function BudgetAI() {
  const { budget, transactions } = useApp();
  const now = new Date();

  // Monthly Calculations
  const monthlyExpense = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const budgetLimit = budget.salary || 0;
  const percentage = budgetLimit > 0 ? (monthlyExpense / budgetLimit) * 100 : 0;
  
  const getStatus = () => {
      if(percentage < 50) return { label: "Healthy", color: "text-emerald-500", bar: "bg-emerald-500" };
      if(percentage < 80) return { label: "Moderate", color: "text-blue-500", bar: "bg-blue-500" };
      if(percentage < 100) return { label: "Caution", color: "text-orange-500", bar: "bg-orange-500" };
      return { label: "Critical", color: "text-rose-500", bar: "bg-rose-500" };
  };

  const status = getStatus();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Brain className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Analysis</h1>
          <p className="text-muted-foreground">Automated insights for {now.toLocaleString('default', { month: 'long' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* 1. Budget Health */}
         <div className="glass-card rounded-2xl p-6 space-y-5 border-t-4 border-t-primary">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="font-bold text-lg">Budget Health</h3>
                  <p className="text-sm text-muted-foreground">Spending vs Salary</p>
               </div>
               <div className={`px-3 py-1 rounded-full bg-muted font-bold ${status.color}`}>
                   {status.label}
               </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span>₹{monthlyExpense.toLocaleString()} Spent</span>
                    <span className="text-muted-foreground">Limit: ₹{budgetLimit.toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${status.bar}`} 
                        style={{ width: `${Math.min(percentage, 100)}%` }} 
                    />
                </div>
            </div>

            <div className="flex gap-3 text-sm p-3 bg-muted/40 rounded-xl border border-border">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p className="text-muted-foreground">
                    {percentage < 100 
                        ? `You have ₹${(budgetLimit - monthlyExpense).toLocaleString()} remaining this month.` 
                        : "You have exceeded your monthly salary budget."}
                </p>
            </div>
         </div>

         {/* 2. Fixed Commitments */}
         <div className="glass-card rounded-2xl p-6 space-y-5">
             <div className="flex items-center gap-2">
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <AlertCircle className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-lg">Fixed Commitments</h3>
             </div>
             
             <div className="space-y-3">
                 <div className="flex justify-between items-center p-3 bg-card border border-border rounded-xl">
                     <span className="font-medium">Rent / Housing</span> 
                     <span className="font-bold">₹{budget.fixedCosts.rent.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-card border border-border rounded-xl">
                     <span className="font-medium">Subscriptions</span> 
                     <span className="font-bold">₹{budget.fixedCosts.subscriptions.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-card border border-border rounded-xl">
                     <span className="font-medium">Travel Commute</span> 
                     <span className="font-bold">₹{budget.fixedCosts.travel.toLocaleString()}</span>
                 </div>
             </div>
         </div>
      </div>
      
      {/* 3. AI Helper Tip */}
      <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 flex gap-4 items-start">
          <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20 shrink-0">
             <TrendingUp className="w-5 h-5" />
          </div>
          <div>
              <h4 className="font-bold text-lg mb-1">Smart Tracking Tip</h4>
              <p className="text-muted-foreground leading-relaxed">
                  Use the <strong>Quick Add</strong> bar on the dashboard or the floating <strong>Chatbot</strong> to add transactions instantly. 
                  The AI automatically categorizes them, ensuring this analysis remains accurate without manual effort.
              </p>
          </div>
      </div>
    </div>
  );
}