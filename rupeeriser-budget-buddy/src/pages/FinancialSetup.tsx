import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Landmark, Plus, Trash2, ArrowLeft, History, Calculator, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function FinancialSetup() {
  const { budget, updateBudgetSettings, transactions } = useApp();
  const navigate = useNavigate();
  
  const [salaryInput, setSalaryInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Mandatory Expenses State
  interface MandatoryExpense { id: string; name: string; amount: number; }
  const [mandatoryList, setMandatoryList] = useState<MandatoryExpense[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  
  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [prevBalance, setPrevBalance] = useState(0);

  useEffect(() => {
    // 1. Calculate Previous Month Balance
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear();
    });
    const income = prevMonthTx.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
    const expense = prevMonthTx.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
    setPrevBalance(income - expense);

    // 2. Load Config
    if (budget) {
        setSalaryInput(budget.salary.toString());
        if (budget.config) {
            try {
                const parsed = JSON.parse(budget.config);
                const currentMonthKey = `${now.getFullYear()}_${now.getMonth()}`;
                
                // Load list if key matches, else load previous list as template
                setMandatoryList(parsed.mandatoryList || []);
            } catch(e) {}
        }
    }
  }, [budget, transactions]);

  const saveToDb = async (updatedList: MandatoryExpense[]) => {
      setIsSaving(true);
      const totalMandatory = updatedList.reduce((acc, item) => acc + item.amount, 0);
      const fixedCostsPayload = { rent: 0, travel: 0, phone: 0, subscriptions: totalMandatory };
      
      const now = new Date();
      const configJson = JSON.stringify({ 
          mandatoryList: updatedList,
          monthKey: `${now.getFullYear()}_${now.getMonth()}` 
      });

      try {
        await updateBudgetSettings(Number(salaryInput), fixedCostsPayload, configJson);
        toast.success("Setup Saved");
      } catch(e) { toast.error("Sync failed"); } 
      finally { setIsSaving(false); }
  };

  const addItem = () => {
      if(!newItemName || !newItemAmount) return;
      const newItem = { id: Date.now().toString(), name: newItemName, amount: parseFloat(newItemAmount) };
      const newList = [...mandatoryList, newItem];
      setMandatoryList(newList);
      setNewItemName(''); setNewItemAmount('');
      saveToDb(newList);
  };

  // ✅ Trigger Confirmation
  const requestDelete = (id: string) => {
      setDeleteId(id);
  };

  // ✅ Execute Delete
  const confirmDelete = () => {
      if(!deleteId) return;
      const newList = mandatoryList.filter(i => i.id !== deleteId);
      setMandatoryList(newList);
      saveToDb(newList);
      setDeleteId(null);
  };

  const totalMandatory = mandatoryList.reduce((acc, item) => acc + item.amount, 0);
  const projectedRemaining = Number(salaryInput) - totalMandatory;

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-fade-in px-4 pt-4">
      
      <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" 
            //   onClick={() => navigate('/settings')} 
            onClick={() => navigate('/dashboard')}
              className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button>
              <h1 className="text-2xl font-bold font-display text-foreground">Financial Setup</h1>
          </div>
          <span className="text-sm font-medium bg-muted px-3 py-1 rounded-full text-muted-foreground">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-[24px] p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-300"><History className="w-6 h-6" /></div>
            <div>
                <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Previous Month Flow</p>
                <h3 className={`text-xl font-bold ${prevBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{prevBalance >= 0 ? '+' : ''}₹{prevBalance.toLocaleString()}</h3>
            </div>
          </div>
      </div>

      <div className="glass-card rounded-3xl p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Landmark className="w-6 h-6" /></div>
              <div><h3 className="font-bold text-xl text-foreground">Monthly Allocation</h3><p className="text-sm text-muted-foreground">Define Income & Fixed Costs.</p></div>
          </div>

          <div className="bg-secondary/30 p-6 rounded-[24px] border border-transparent focus-within:border-blue-500/30 transition-all">
              <Label className="text-blue-600 font-bold mb-2 block">Monthly Income</Label>
              <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-muted-foreground">₹</span>
                  {/* ✅ FIXED: Added text-foreground to ensure visibility in dark mode */}
                  <Input 
                    type="number" 
                    value={salaryInput} 
                    onChange={e => setSalaryInput(e.target.value)} 
                    onBlur={() => saveToDb(mandatoryList)} 
                    className="bg-transparent border-none shadow-none text-3xl font-bold h-12 p-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground" 
                    placeholder="0"
                  />
              </div>
          </div>

          <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                  <Label className="font-bold text-lg text-foreground">Fixed Mandatory Expenses</Label>
                  <span className="text-sm text-muted-foreground font-mono">Total: ₹{totalMandatory.toLocaleString()}</span>
              </div>
              
              {mandatoryList.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-card p-4 rounded-[20px] border border-border shadow-sm">
                      <div className="flex-1">
                          <p className="font-bold text-foreground">{item.name}</p>
                      </div>
                      <p className="font-mono font-bold text-foreground">₹{item.amount.toLocaleString()}</p>
                      {/* ✅ Call requestDelete instead of removeItem directly */}
                      <button onClick={() => requestDelete(item.id)} className="text-muted-foreground hover:text-red-500 p-2 transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
              ))}

              <div className="flex gap-3 mt-4">
                  <Input placeholder="Expense Name (e.g. Rent)" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="input-glass flex-[2] h-12"/>
                  <Input type="number" placeholder="Amount" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)} className="input-glass flex-1 h-12"/>
                  <Button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 h-12 w-12 rounded-xl text-white"><Plus className="w-6 h-6"/></Button>
              </div>
          </div>

          {/* Projection Summary */}
          {/* <div className="mt-6 p-4 rounded-2xl bg-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground"><Calculator className="w-4 h-4"/> <span>Projected Remaining:</span></div>
              <span className={`font-bold text-lg ${projectedRemaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  ₹{projectedRemaining.toLocaleString()}
              </span>
          </div> */}
      </div>

      {/* ✅ DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-card rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this mandatory expense? This will affect your budget calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}