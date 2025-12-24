import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { endpoints } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const { chatMessages, setChatMessages, transactions, budget } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping, isOpen]);

  // --- 🧠 SMART CONTEXT GENERATOR ---
  const getFinancialContext = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter current month data
    const monthlyTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = monthlyTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Category breakdown
    const cats: Record<string, number> = {};
    monthlyTx.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    
    const topCats = Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `- ${k}: ₹${v}`)
      .join('\n');

    return `
      CURRENT DATE: ${now.toDateString()}
      
      MONTHLY SUMMARY (${now.toLocaleString('default', { month: 'long' })}):
      - Income: ₹${totalIncome}
      - Expenses: ₹${totalExpense}
      - Balance: ₹${balance}
      - Salary Budget: ₹${budget.salary}
      
      SPENDING BY CATEGORY:
      ${topCats || "No spending yet"}
      
      RECENT TRANSACTIONS:
      ${transactions.slice(0, 5).map(t => `${t.date}: ${t.note} (₹${t.amount})`).join('\n')}
    `;
  };

  const handleClearChat = () => {
    setChatMessages([]);
    toast.success("Chat history cleared");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const contextData = getFinancialContext();
      const res = await endpoints.chatAI(input, contextData);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: res.data.response,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setChatMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the server. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm animate-scale-in flex flex-col h-full md:h-[600px] md:w-[400px] md:fixed md:right-6 md:bottom-24 md:rounded-2xl md:border md:border-border md:shadow-2xl">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card/50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">FinSync AI</h2>
            <div className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" onClick={handleClearChat} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-muted/5" ref={scrollRef}>
        <div className="space-y-4">
          {chatMessages.length === 0 && (
             <div className="text-center text-muted-foreground text-sm py-12 px-4 space-y-3">
               <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Bot className="w-8 h-8 text-primary" />
               </div>
               <p className="font-medium text-foreground">How can I help you?</p>
               <p className="text-xs opacity-70">"How much did I spend on Food?"</p>
               <p className="text-xs opacity-70">"What is my balance this month?"</p>
             </div>
          )}
          
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-3 animate-slide-up',
                msg.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-border',
                  msg.role === 'user' ? 'bg-primary text-white' : 'bg-card'
                )}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              <div
                className={cn(
                  'rounded-2xl px-4 py-3 max-w-[85%] text-sm shadow-sm leading-relaxed',
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-sm' 
                    : 'bg-card border border-border rounded-tl-sm'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
             <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center"><Bot className="w-4 h-4 text-primary"/></div>
               <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-1 rounded-tl-sm">
                 <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"/>
                 <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100"/>
                 <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200"/>
               </div>
             </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card/80 backdrop-blur-md rounded-b-2xl">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances..."
            className="input-glass rounded-full px-4 border-muted-foreground/20"
            disabled={isTyping}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isTyping || !input.trim()}
            className="rounded-full w-10 h-10 gradient-primary shrink-0 shadow-lg"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};