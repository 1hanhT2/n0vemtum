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

type View = 'today' | 'weekly' | 'history' | 'achievements' | 'analytics';

export function Home() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'today':
        return <TodayView />;
      case 'weekly':
        return <WeeklyView />;
      case 'history':
        return <HistoryView />;
      case 'achievements':
        return <AchievementsPanel />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Keep building those habits and tracking your progress.
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
      />
    </div>
  );
}