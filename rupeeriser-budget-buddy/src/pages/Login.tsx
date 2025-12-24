import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { endpoints } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useApp(); // Context login
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (isSignUp) {
        // Use endpoints.signup (API Call)
        res = await endpoints.signup(formData);
        toast.success("Account created! Logging in...");
      } else {
        // Use endpoints.login (API Call)
        res = await endpoints.login({ 
          email: formData.email, 
          password: formData.password 
        });
      }

      const data = res.data;

      if (data.access_token) {
        const userName = data.user_name || (isSignUp ? formData.name : 'User');

        // Call Context Login to update state
        login(data.access_token, userName);

        toast.success(`Welcome back, ${userName}!`);
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.detail || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-display text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input 
                placeholder="Full Name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
              />
            )}
            <Input 
              type="email" 
              placeholder="Email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required 
            />
            
            <Button type="submit" className="w-full gradient-primary" disabled={loading}>
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;