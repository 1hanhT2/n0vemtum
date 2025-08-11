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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Eye, LogIn } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} isGuestMode={isGuestMode} />
      
      <div className="container mx-auto px-4 py-6">
        {isGuestMode && (
          <div className="mb-6 border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-sm text-blue-800 dark:text-blue-200">You're viewing the demo version. Sign in to save your progress and access all features.</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = "/api/login"}
                className="ml-4 flex-shrink-0"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isGuestMode ? "Welcome to the Demo!" : `Welcome back, ${(user as any)?.firstName || (user as any)?.email || 'User'}!`}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isGuestMode 
              ? "Explore the habit tracking features with sample data." 
              : "Keep building those habits and tracking your progress."
            }
          </p>
        </div>

        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        <div className="mt-6">
          {renderCurrentView()}
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