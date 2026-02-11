import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { type NavigationView } from "@/components/navigation";
import { Header } from "@/components/header";
import { TodayView } from "@/components/today-view";
import { WeeklyView } from "@/components/weekly-view";
import { HistoryView } from "@/components/history-view";
import { AchievementsPanel } from "@/components/achievements-panel";
import { AnalyticsView } from "@/components/analytics-view";
import { SettingsModal } from "@/components/settings-modal";
import { PlayerStatus } from "@/components/system/PlayerStatus";
import { AssistantView } from "@/components/assistant-view";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Eye, LogIn, Sparkles } from "lucide-react";

type View = NavigationView;

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
      case 'assistant':
        return <AssistantView isGuestMode={isGuestMode} />;
      default:
        return <TodayView isGuestMode={isGuestMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      <Header
        onSettingsClick={() => setIsSettingsOpen(true)}
        isGuestMode={isGuestMode}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-24 pb-8">
        {isGuestMode && (
          <div className="mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Eye className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Demo Mode Active</p>
                    <p className="text-sm text-muted-foreground">Sign in to save your progress and unlock all features</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-demo-sign-in"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile Status Window */}
        <div className="lg:hidden mb-8">
          <PlayerStatus />
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
             {renderCurrentView()}
          </div>

          {/* Side Panel - System Stats */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-6 lg:mt-8">
             <PlayerStatus />
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
