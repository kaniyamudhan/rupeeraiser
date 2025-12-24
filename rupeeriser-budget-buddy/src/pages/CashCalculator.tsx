// pages/CashCalculator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const denominations = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

const CashCalculator = () => {
  const { activeAccount } = useApp();
  const [counts, setCounts] = useState<Record<number, number>>({});
  const total = denominations.reduce((sum, den) => sum + (counts[den] || 0) * den, 0);

  const handleChange = (den: number, value: string) => {
    setCounts(prev => ({ ...prev, [den]: parseInt(value) || 0 }));
  };

  const handleSave = () => {
    // Logic to save to active account or transactions
    toast.success(`₹${total} added to ${activeAccount}`);
  };

  return (
    <div 
      className="max-w-4xl mx-auto space-y-6 p-6 glass-card rounded-2xl"
      style={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}
    >
      <h1 className="text-2xl font-bold">Cash Tally Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {denominations.map(den => (
            <div key={den} className="flex items-center gap-4">
              <Label className="w-20">₹{den} x</Label>
              <Input 
                type="number" 
                value={counts[den] || ''} 
                onChange={e => handleChange(den, e.target.value)} 
                className="input-glass rounded-xl"
                min={0}
              />
              <span>= ₹{ (counts[den] || 0) * den }</span>
            </div>
          ))}
        </div>
        
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Total: ₹{total}</h2>
          <Button onClick={handleSave} className="w-full gradient-primary rounded-xl">Save to Account</Button>
        </div>
      </div>
    </div>
  );
};

export default CashCalculator;