import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, History, Trophy, BarChart3, MessageSquareText } from "lucide-react";

type View = 'today' | 'weekly' | 'history' | 'achievements' | 'analytics' | 'assistant';

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
    { value: 'assistant' as const, icon: MessageSquareText, label: 'Assistant' },
  ];

  return (
    <nav className="flex justify-center gap-2 mb-6">
      <div className="inline-flex bg-card border border-border rounded-full p-1 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => onViewChange(item.value)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                currentView === item.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
