import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, History, Trophy, BarChart3 } from "lucide-react";

type View = 'today' | 'weekly' | 'history' | 'achievements' | 'analytics';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { value: 'today' as const, icon: CalendarDays, label: 'Today' },
    { value: 'weekly' as const, icon: TrendingUp, label: 'Weekly' },
    { value: 'history' as const, icon: History, label: 'History' },
    { value: 'achievements' as const, icon: Trophy, label: 'Achievements' },
    { value: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <nav className="flex justify-center gap-2 mb-6">
      <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => onViewChange(item.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                currentView === item.value
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
