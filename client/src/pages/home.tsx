import { useState } from 'react';
import { Header } from "@/components/header";
import { Navigation } from "@/components/navigation";
import { TodayView } from "@/components/today-view";
import { WeeklyView } from "@/components/weekly-view";
import { HistoryView } from "@/components/history-view";
import { AchievementsPanel } from "@/components/achievements-panel";
import { AnalyticsView } from "@/components/analytics-view";
import { AchievementToast } from "@/components/achievement-toast";
import { SettingsModal } from "@/components/settings-modal";

type View = 'today' | 'weekly' | 'history' | 'achievements' | 'analytics';

export default function Home() {
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
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>

      <AchievementToast />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
