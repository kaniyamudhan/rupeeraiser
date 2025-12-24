import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView = () => {
  const { transactions } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Get data for a specific day
  const getDayData = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const txs = transactions.filter((tx) => tx.date === dateStr);
    const expense = txs.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);
    const income = txs.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    return { dateStr, expense, income };
  };

  const selectedTx = transactions.filter(tx => tx.date === selectedDate);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      
      {/* Calendar Grid */}
      <div className="bg-card border border-border shadow-sm rounded-[32px] p-6 flex-1 h-fit">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><CalIcon className="w-6 h-6"/></div>
             <div>
                <h2 className="font-bold text-lg text-foreground">{currentDate.toLocaleString('default', { month: 'long' })}</h2>
                <p className="text-sm text-muted-foreground">{year}</p>
             </div>
          </div>
          <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-[11px] font-bold text-muted-foreground uppercase py-2">{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: startingDay }, (_, i) => <div key={`empty-${i}`} />)}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const { dateStr, expense, income } = getDayData(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  'aspect-square md:aspect-auto md:h-20 flex flex-col items-center justify-start pt-2 rounded-xl transition-all duration-200 relative border border-transparent',
                  isSelected ? 'bg-blue-600 text-white shadow-md z-10' : 'hover:bg-secondary/50 hover:border-border text-foreground',
                  isToday && !isSelected && 'border-blue-200 bg-blue-50/50'
                )}
              >
                <span className={cn("text-xs font-bold", isToday && !isSelected && "text-blue-600")}>{day}</span>
                
                {/* Rich Indicators (Amounts) */}
                <div className="flex flex-col gap-0.5 mt-1 w-full px-0.5">
                    {income > 0 && (
                        <span className={cn("text-[9px] truncate w-full text-center rounded-[4px] px-1", isSelected ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700")}>
                            +{income >= 1000 ? `${(income/1000).toFixed(1)}k` : income}
                        </span>
                    )}
                    {expense > 0 && (
                        <span className={cn("text-[9px] truncate w-full text-center rounded-[4px] px-1", isSelected ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700")}>
                            -{expense >= 1000 ? `${(expense/1000).toFixed(1)}k` : expense}
                        </span>
                    )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Side Panel (Desktop) / Bottom (Mobile) */}
      <div className="lg:w-80 shrink-0">
          <div className="bg-card border border-border shadow-sm rounded-[32px] p-6 h-full min-h-[300px]">
              <h3 className="font-bold text-lg mb-4 text-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric'})}
              </h3>
              
              <div className="space-y-3 overflow-y-auto max-h-[400px]">
                  {selectedTx.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No transactions.</p>}
                  
                  {selectedTx.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-xl border border-border/50">
                        <div>
                            <p className="font-bold text-sm">{tx.note || tx.category}</p>
                            <p className="text-xs text-muted-foreground">{tx.account}</p>
                        </div>
                        <span className={cn("font-bold text-sm", tx.type==='income' ? 'text-emerald-600' : 'text-rose-600')}>
                            {tx.type==='income' ? '+' : '-'} {tx.amount}
                        </span>
                    </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};