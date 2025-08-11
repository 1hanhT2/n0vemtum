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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} isGuestMode={isGuestMode} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {isGuestMode && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Demo Mode Active</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to save your progress and unlock all features</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {isGuestMode ? "Demo Dashboard" : `Welcome back, ${(user as any)?.firstName || (user as any)?.email || 'User'}`}
            </h1>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isGuestMode 
              ? "Explore the full habit tracking experience with sample data" 
              : "Your habits are looking great today. Keep up the momentum!"
            }
          </p>
        </div>

        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        
        <div className="mt-8">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
            {renderCurrentView()}
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