import { useState } from 'react';
import { Send, Zap, Mic, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { endpoints } from '@/lib/api';
import { toast } from 'sonner';

/* ------------------------------------------
   🔥 SMART TANGGLISH + ENGLISH DETECTOR
------------------------------------------- */
const detectTransactionType = (text: string): 'income' | 'expense' => {
  const incomeKeywords = [
    'salary', 'profit', 'credit', 'gain', 'received', 'income',
    'refund', 'cashback', 'bonus', 'won', 'rent received',
    'commission', 'incentive', 'payout', 'return', 'interest',
    'salary vandhudhu', 'kaasu vandhudhu', 'amount vandhudhu',
    'credit achu', 'kaasu varudhu', 'profit achu',
    'refund vandhudhu', 'cashback vandhudhu',
    'sal', 'cb', 'bon', 'inc',
    'got money', 'got salary', 'money received', 'credited'
  ];

  const expenseKeywords = [
    'spent', 'expense', 'debit', 'paid', 'pay', 'loss',
    'shopping', 'bill', 'recharge', 'food', 'movie',
    'fuel', 'rent paid', 'emi', 'amazon', 'zomato',
    'swiggy', 'uber', 'ola', 'gym', 'medical', 'hospital',
    'fee', 'fine', 'repair', 'service', 'purchase',
    'katten', 'katnen', 'kaasu pochu', 'selavu',
    'expense achu', 'amount pochu', 'bill katten',
    'recharge katten', 'sapadu', 'teakadai', 'hotel la',
    'petrol potten', 'diesel potten',
    'emi', 'fd', 'rd', 'chit',
    'i paid', 'i spent', 'money went', 'lost money'
  ];

  const lower = text.toLowerCase();

  if (incomeKeywords.some(word => lower.includes(word))) return 'income';
  if (expenseKeywords.some(word => lower.includes(word))) return 'expense';

  return 'expense';
};

export const QuickAddBar = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const { addTransaction, activeAccount } = useApp();

  /* 🎤 Voice Input */
  const handleVoice = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('Listening... Speak now');
      };

      const voiceTimeout = setTimeout(() => {
        if (isListening) {
          recognition.stop();
          setIsListening(false);
          toast.warning('Listening timed out. Please try again.');
        }
      }, 15000);

      recognition.onresult = (event: any) => {
        clearTimeout(voiceTimeout);
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        toast.success('Voice captured!');
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Could not hear you. Try again.');
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      toast.error('Voice not supported in this browser.');
    }
  };

  /* ⚡ AI Submit */
  const handleSubmit = async (textOverride?: string) => {
    const textToProcess = textOverride || input;
    if (!textToProcess.trim()) return;

    setLoading(true);
    try {
      const res = await endpoints.parseAI(textToProcess);

      if (res.data) {
        const autoType = detectTransactionType(textToProcess);

        await addTransaction({
          amount: res.data.amount,
          category: res.data.category,
          note: res.data.note,
          date: res.data.date,
          type: autoType,
          account:
            activeAccount !== 'all'
              ? activeAccount
              : res.data.account || 'wallet',
        });

        toast.success(
          `${autoType === 'income' ? 'Income Added' : 'Expense Added'}: ₹${res.data.amount}`
        );

        setInput('');
      }
    } catch (error) {
      toast.error("AI couldn't understand.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 shadow-lg border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium gradient-text">
            AI Quick Add
          </span>
        </div>

        {activeAccount !== 'all' && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Adding to: {activeAccount}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={isListening ? 'destructive' : 'outline'}
          size="icon"
          onClick={handleVoice}
          className="rounded-xl shrink-0"
        >
          <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
        </Button>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder='Try "salary vandhudhu 25k" or "swiggy 140"'
          className="input-glass rounded-xl flex-1"
          disabled={loading}
        />

        <Button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="rounded-xl px-4 gradient-primary text-white shadow-md"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

// import { useState } from 'react';
// import { Send, Zap, Mic, Loader2 } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { useApp } from '@/contexts/AppContext';
// import { endpoints } from '@/lib/api';
// import { toast } from 'sonner';

// export const QuickAddBar = () => {
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const { addTransaction, activeAccount } = useApp();

//   const handleVoice = () => {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//       const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
//       const recognition = new SpeechRecognition();
//       recognition.lang = 'en-IN';
//       recognition.continuous = false;

//       recognition.onstart = () => {
//         setIsListening(true);
//         toast.info("Listening... Speak now");
//       };
      
//       const voiceTimeout = setTimeout(() => {
//         if (isListening) {
//           recognition.stop();
//           setIsListening(false);
//           toast.warning("Listening timed out. Please try again.");
//         }
//       }, 15000);

//       recognition.onresult = (event: any) => {
//         clearTimeout(voiceTimeout);
//         const transcript = event.results[0][0].transcript;
//         setInput(transcript);
//         toast.success("Voice captured!");
//         setIsListening(false);
//       };

//       recognition.onerror = () => {
//         setIsListening(false);
//         toast.error("Could not hear you. Try again.");
//       };

//       recognition.onend = () => setIsListening(false);
//       recognition.start();
//     } else {
//       toast.error("Voice not supported in this browser.");
//     }
//   };

//   const handleSubmit = async (textOverride?: string) => {
//     const textToProcess = textOverride || input;
//     if (!textToProcess.trim()) return;

//     setLoading(true);
//     try {
//       const res = await endpoints.parseAI(textToProcess);
      
//       if (res.data) {
//         await addTransaction({
//           amount: res.data.amount,
//           category: res.data.category,
//           note: res.data.note,
//           date: res.data.date,
//           type: res.data.type,
//           // Use default account logic if AI doesn't return one, or activeAccount if not 'all'
//           account: activeAccount !== 'all' ? activeAccount : (res.data.account || 'wallet')
//         });
//         toast.success(`Added: ₹${res.data.amount} for ${res.data.note}`);
//         setInput('');
//       }
//     } catch (error) {
//       toast.error("AI couldn't understand.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="glass-card rounded-2xl p-4 shadow-lg border-primary/20">
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2">
//           <Zap className="w-4 h-4 text-primary animate-pulse" />
//           <span className="text-sm font-medium gradient-text">AI Quick Add</span>
//         </div>
//         {activeAccount !== 'all' && (
//           <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
//             Adding to: {activeAccount}
//           </span>
//         )}
//       </div>
      
//       <div className="flex gap-2">
//         <Button 
//           variant={isListening ? "destructive" : "outline"} 
//           size="icon" 
//           onClick={handleVoice}
//           className="rounded-xl shrink-0"
//         >
//           <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
//         </Button>

//         <Input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
//           placeholder='Try "Gym 1k day after tmrw"'
//           className="input-glass rounded-xl flex-1"
//           disabled={loading}
//         />
        
//         <Button 
//           onClick={() => handleSubmit()} 
//           disabled={loading}
//           className="rounded-xl px-4 gradient-primary text-white shadow-md"
//         >
//           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
//         </Button>
//       </div>
//     </div>
//   );
// };