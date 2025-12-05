import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Landing } from "@/pages/Landing";
import { Home } from "@/pages/Home";
import { ErrorBoundary } from '@/components/error-boundary';
import { useEffect } from "react";
import { applyTheme, getStoredDarkMode, getStoredTheme } from "@/lib/theme";

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <ErrorBoundary>
          <Landing />
        </ErrorBoundary>
      </Route>
      <Route path="/app">
        <ErrorBoundary>
          <AuthenticatedRoute>
            <Home />
          </AuthenticatedRoute>
        </ErrorBoundary>
      </Route>
      <Route path="/demo">
        <ErrorBoundary>
          <Home isGuestMode={true} />
        </ErrorBoundary>
      </Route>
      <Route>
        <ErrorBoundary>
          <Landing />
        </ErrorBoundary>
      </Route>
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const theme = getStoredTheme();
    const darkMode = getStoredDarkMode();
    applyTheme(theme, darkMode);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f8fbff] via-white to-[#edf2ff] text-foreground dark:from-[#0b1021] dark:via-[#0f172a] dark:to-[#0b1021]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-purple-300/40 blur-3xl dark:bg-purple-800/30" />
            <div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl dark:bg-blue-800/30" />
            <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl dark:bg-indigo-800/20" />
          </div>
          <div className="relative z-10">
            <Toaster />
            <Router />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;