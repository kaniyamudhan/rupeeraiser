import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme-provider";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import CalendarPage from "./pages/CalendarPage";
import Settings from "./pages/Settings";
import FinancialSetup from "./pages/FinancialSetup";
import Profile from "./pages/Profile";
import Habits from "./pages/Habits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-background text-primary animate-pulse">Loading FinSync...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/setup" element={<FinancialSetup />} /> 
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/habits" element={<Habits />} />
      </Route>

      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          {/* ✅ CUSTOM BLUE/WHITE POPUP STYLE */}
          <Sonner 
            duration={2000} 
            closeButton={true}
            position="top-center"
            className="mt-4"
            toastOptions={{
              classNames: {
                success: 'bg-blue-600 text-white border-blue-700 shadow-lg',
                error: 'bg-red-600 text-white border-red-700 shadow-lg',
                info: 'bg-gray-800 text-white border-gray-900',
                closeButton: 'bg-white/20 text-white hover:bg-white/30',
              },
            }}
          />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;