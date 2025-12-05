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
      <div className="inline-flex bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/70 dark:border-gray-800 shadow-sm shadow-blue-100/40 dark:shadow-none rounded-xl p-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => onViewChange(item.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === item.value
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-200/70'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
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
