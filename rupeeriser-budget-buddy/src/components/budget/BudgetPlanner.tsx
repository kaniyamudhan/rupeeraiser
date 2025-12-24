import { useState } from 'react';
import { Brain, Sparkles, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  amount: number; // Unified name
}

interface AIPlan {
  id: string;
  date: Date;
  summary: string;
  breakdown: {
    category: string;
    allocated: number;
    suggestion: string;
  }[];
  tips: string[];
  alternatives: string[];
}

export const BudgetPlanner = () => {
  const { budget, setBudget } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);
  const [plans, setPlans] = useState<AIPlan[]>([]);

  const totalFixed = Object.values(budget.fixedCosts).reduce((a, b) => a + b, 0);
  // const totalGoals = budget.goals.reduce((a, g) => a+ g.totalMonthly, 0);
  const totalGoals = budget.goals.reduce((a, g) => a + (g.amount || 0), 0); 
  const remaining = budget.salary - totalFixed - totalGoals;
  

  const generatePlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newPlan: AIPlan = {
      id: Date.now().toString(),
      date: new Date(),
      summary: `Bhai, ₹${budget.salary.toLocaleString()} se ₹${totalFixed.toLocaleString()} fixed aur ₹${totalGoals.toLocaleString()} goals ke baad ₹${remaining.toLocaleString()} bacha. Let's make it work! 💪`,
      breakdown: [
        { category: 'Food & Dining', allocated: Math.round(remaining * 0.35), suggestion: 'Limit food delivery to 2x/week' },
        { category: 'Transport', allocated: Math.round(remaining * 0.15), suggestion: 'Metro > Auto when possible' },
        { category: 'Entertainment', allocated: Math.round(remaining * 0.10), suggestion: 'Use free trials, share Netflix' },
        { category: 'Shopping', allocated: Math.round(remaining * 0.15), suggestion: 'Wait 24hrs before buying' },
        { category: 'Savings', allocated: Math.round(remaining * 0.25), suggestion: 'Auto-transfer on salary day' },
      ],
      tips: [
        '🍳 Eggs are your best friend - 6 eggs = 36g protein at ₹42',
        '🥜 Peanut butter + banana = cheap pre-workout',
        '🍲 Mess food 5 days, order only weekends',
        '🚇 Monthly metro pass saves ₹400+',
      ],
      alternatives: [
        'Whey protein (₹2500/month) → Eggs + Paneer (₹1200/month)',
        'Swiggy daily (₹300/day) → Cook/Mess (₹100/day)',
        'Gym (₹2000) → Calisthenics at park (Free)',
        'Netflix + Prime (₹400) → Share with friends (₹100)',
      ],
    };

    setAiPlan(newPlan);
    setPlans((prev) => [newPlan, ...prev]);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Income & Fixed Costs */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Monthly Setup
        </h2>

        <div className="space-y-4">
          <div>
            <Label>Monthly Salary</Label>
            <Input
              type="number"
              value={budget.salary}
              onChange={(e) => setBudget({ ...budget, salary: parseInt(e.target.value) || 0 })}
              className="input-glass rounded-xl mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Rent</Label>
              <Input
                type="number"
                value={budget.fixedCosts.rent}
                onChange={(e) => setBudget({
                  ...budget,
                  fixedCosts: { ...budget.fixedCosts, rent: parseInt(e.target.value) || 0 }
                })}
                className="input-glass rounded-xl mt-1"
              />
            </div>
            <div>
              <Label>Travel</Label>
              <Input
                type="number"
                value={budget.fixedCosts.travel}
                onChange={(e) => setBudget({
                  ...budget,
                  fixedCosts: { ...budget.fixedCosts, travel: parseInt(e.target.value) || 0 }
                })}
                className="input-glass rounded-xl mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="number"
                value={budget.fixedCosts.phone}
                onChange={(e) => setBudget({
                  ...budget,
                  fixedCosts: { ...budget.fixedCosts, phone: parseInt(e.target.value) || 0 }
                })}
                className="input-glass rounded-xl mt-1"
              />
            </div>
            <div>
              <Label>Subscriptions</Label>
              <Input
                type="number"
                value={budget.fixedCosts.subscriptions}
                onChange={(e) => setBudget({
                  ...budget,
                  fixedCosts: { ...budget.fixedCosts, subscriptions: parseInt(e.target.value) || 0 }
                })}
                className="input-glass rounded-xl mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Goals
        </h2>

        <div className="space-y-3">
          {budget.goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div>
                <p className="font-medium">{goal.name}</p>
                <p className="text-xs text-muted-foreground">
                  ₹{goal.amountPerUnit}/{goal.frequency}
                </p>
              </div>
              <span className="font-semibold">₹{goal.totalMonthly}/mo</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="font-display text-xl font-bold stat-positive">₹{budget.salary.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fixed + Goals</p>
            <p className="font-display text-xl font-bold stat-negative">₹{(totalFixed + totalGoals).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className={cn(
              'font-display text-xl font-bold',
              remaining > 0 ? 'stat-positive' : 'stat-negative'
            )}>
              ₹{remaining.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generatePlan}
        disabled={isGenerating}
        className="w-full rounded-xl py-6 text-lg gradient-primary"
      >
        {isGenerating ? (
          <>
            <Brain className="w-5 h-5 mr-2 animate-pulse" />
            AI is thinking...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mr-2" />
            Generate My Plan
          </>
        )}
      </Button>

      {/* AI Plan */}
      {aiPlan && (
        <div className="glass-card rounded-2xl p-5 animate-slide-up space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold">AI Budget Plan</h3>
              <p className="text-xs text-muted-foreground">
                Generated {aiPlan.date.toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="text-sm">{aiPlan.summary}</p>

          {/* Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">💰 Budget Breakdown</h4>
            {aiPlan.breakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{item.category}</p>
                  <p className="text-xs text-muted-foreground">{item.suggestion}</p>
                </div>
                <span className="font-semibold">₹{item.allocated.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Pro Tips
            </h4>
            {aiPlan.tips.map((tip, i) => (
              <p key={i} className="text-sm pl-6">{tip}</p>
            ))}
          </div>

          {/* Alternatives */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Budget Swaps
            </h4>
            {aiPlan.alternatives.map((alt, i) => (
              <p key={i} className="text-sm pl-6">{alt}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
