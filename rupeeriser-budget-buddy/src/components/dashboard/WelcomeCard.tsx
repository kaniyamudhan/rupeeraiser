// import { useState } from 'react';
import { TrendingUp, Sparkles, Mic, Send, Loader2, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { endpoints } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';

export const WelcomeCard = () => {
  const { user, transactions, addTransaction, activeAccount } = useApp();
  
  // --- Quick Add Logic ---
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const monthlySpent = transactions
    .filter((tx) => tx.type === 'expense')
    .filter((tx) => new Date(tx.date).getMonth() === new Date().getMonth())
    .reduce((acc, tx) => acc + tx.amount, 0);

  const handleVoice = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Listening...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        toast.success("Captured!");
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      toast.error("Voice not supported.");
    }
  };

 const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await endpoints.parseAI(input);
      if (res.data) {
        
        // FIX: Ensure account is valid string
        const targetAccount = activeAccount !== 'all' ? activeAccount : (res.data.account || 'wallet');

        await addTransaction({
          amount: res.data.amount,
          category: res.data.category,
          note: res.data.note,
          date: res.data.date, // Backend sends YYYY-MM-DD
          type: res.data.type,
          account: targetAccount
        });
        // toast.success(`Added: ₹${res.data.amount} for ${res.data.note}`);
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-bold">Added: ₹{res.data.amount}</span>
            <span className="text-xs line-clamp-1 opacity-90">{res.data.note}</span>
          </div>
        );
        setInput('');
      }
    } catch (error) {
      console.error(error);
      toast.error("AI couldn't understand.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden gradient-primary rounded-3xl p-6 shadow-xl shadow-emerald-500/20 text-primary-foreground">
      <div className="relative z-10 space-y-6">
        
        {/* Top Row: Welcome & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Welcome back!</span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {user?.name || 'Hero'} 🚀
            </h1>
          </div>
          
          <div className="flex flex-col items-start md:items-end bg-white/10 rounded-2xl p-3 px-5 backdrop-blur-sm border border-white/10">
            <span className="text-xs font-medium opacity-80 uppercase tracking-wider">{currentMonth} Spent</span>
            <span className="text-3xl font-display font-bold">
              ₹{monthlySpent.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Integrated Quick Add Bar */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-2 flex items-center gap-2 border border-white/10 focus-within:bg-black/30 transition-all duration-300">
          <Button 
            size="icon"
            onClick={handleVoice}
            className={`rounded-xl h-10 w-10 shrink-0 bg-white/10 hover:bg-white/20 border-0 text-white ${isListening ? 'animate-pulse text-red-300' : ''}`}
          >
            <Mic className="w-5 h-5" />
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Type 'Biryani 250 tdy'..."
            className="border-none bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0 text-base h-10 px-2"
            disabled={loading}
          />

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="rounded-xl px-4 bg-white text-emerald-700 hover:bg-white/90 font-bold shadow-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none" />
      <TrendingUp className="absolute right-6 top-6 w-24 h-24 text-white/5 pointer-events-none" />
    </div>
  );
};