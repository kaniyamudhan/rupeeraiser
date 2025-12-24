import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { TransactionList } from '@/components/transactions/TransactionList';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { Button } from '@/components/ui/button';
import { Receipt, Filter, Plus, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/types/finance';
import { useNavigate } from 'react-router-dom';

export default function Transactions() {
   const navigate = useNavigate(); 
  const { transactions } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  
  // Filter State
  const [dateFilter, setDateFilter] = useState('month'); // default to this month

  // Filter Logic
  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        
        if (dateFilter === 'today') {
            return txDate.toDateString() === now.toDateString();
        }
        if (dateFilter === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
            return txDate >= startOfWeek;
        }
        if (dateFilter === 'month') {
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'year') {
            return txDate.getFullYear() === now.getFullYear();
        }
        return true; // All
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredData = getFilteredTransactions();

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingTx(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-32 animate-fade-in px-4 pt-4">
      {/* ✅ BACK ARROW HEADER */}
      <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" 
          // onClick={() => navigate(-1)} 
          onClick={() => navigate('/dashboard')}
          className="rounded-full md:hidden">
              <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
               Transactions
          </h2>
      </div>
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                {/* <Receipt className="w-6 h-6 text-blue-600" /> Transaction */}
            </h2>
            <p className="text-muted-foreground text-sm">{filteredData.length} entries found</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[150px] bg-card border-border h-10 rounded-xl">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Filter className="w-4 h-4" />
                        <SelectValue />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
            </Select>
            
            {/* Desktop Only Add Button */}
            <Button 
                onClick={() => setIsModalOpen(true)} 
                className="hidden md:flex bg-blue-600 hover:bg-blue-700 rounded-xl gap-2"
            >
                <Plus className="w-4 h-4" /> Add New
            </Button>
        </div>
      </div>

      {filteredData.length > 0 ? (
        <TransactionList 
          transactions={filteredData} 
          onEdit={handleEdit} 
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60 bg-muted/20 rounded-[32px] border border-dashed border-border">
          <Receipt className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No transactions found</h3>
          <p className="text-sm text-muted-foreground">Try changing the filter or add a new one.</p>
        </div>
      )}

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={handleClose}
        transactionToEdit={editingTx} 
      />
    </div>
  );
};