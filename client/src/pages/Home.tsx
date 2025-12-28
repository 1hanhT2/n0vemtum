import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/navigation";
import { Header } from "@/components/header";
import { TodayView } from "@/components/today-view";
import { WeeklyView } from "@/components/weekly-view";
import { HistoryView } from "@/components/history-view";
import { AchievementsPanel } from "@/components/achievements-panel";
import { AnalyticsView } from "@/components/analytics-view";
import { SettingsModal } from "@/components/settings-modal";
import { PlayerStatus } from "@/components/system/PlayerStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Eye, LogIn, Sparkles } from "lucide-react";

type View = 'today' | 'weekly' | 'history' | 'achievements' | 'analytics';

interface HomeProps {
  isGuestMode?: boolean;
}

export function Home({ isGuestMode = false }: HomeProps) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'today':
        return <TodayView isGuestMode={isGuestMode} />;
      case 'weekly':
        return <WeeklyView isGuestMode={isGuestMode} />;
      case 'history':
        return <HistoryView isGuestMode={isGuestMode} />;
      case 'achievements':
        return <AchievementsPanel isGuestMode={isGuestMode} />;
      case 'analytics':
        return <AnalyticsView isGuestMode={isGuestMode} />;
      default:
        return <TodayView isGuestMode={isGuestMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-teal-light selection:text-teal-dark">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} isGuestMode={isGuestMode} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {isGuestMode && (
          <div className="mb-8">
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-light rounded-md flex items-center justify-center">
                    <Eye className="h-5 w-5 text-teal-dark" />
                  </div>
                  <div>
                    <p className="text-sm font-serif font-medium text-foreground">Demo Mode Active</p>
                    <p className="text-sm text-muted-foreground">Sign in to save your progress and unlock all features</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-teal text-white hover:bg-teal-dark transition-colors font-medium rounded-md"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              {isGuestMode ? "Demo Dashboard" : `Welcome back, ${(user as any)?.firstName || (user as any)?.email || 'Hunter'}`}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground font-light">
            {isGuestMode 
              ? "Explore the full habit tracking experience with sample data" 
              : "The system awaits your growth. Keep up the momentum."
            }
          </p>
        </div>

        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-transparent">
               {renderCurrentView()}
             </div>
          </div>

          {/* Side Panel - System Stats */}
          <div className="hidden lg:block space-y-6">
             <PlayerStatus />

             {/* Placeholder for future Quest Log */}
             <div className="p-6 rounded-xl border border-dashed border-border bg-card/50 text-center">
                <p className="text-sm text-muted-foreground font-mono">Daily Quest: Coming Soon</p>
             </div>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isGuestMode={isGuestMode}
      />
    </div>
  );
}