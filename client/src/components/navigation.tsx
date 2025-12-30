import { CalendarDays, TrendingUp, History, Trophy, BarChart3, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavigationView = 'today' | 'weekly' | 'history' | 'achievements' | 'analytics' | 'assistant';

interface NavigationProps {
  currentView: NavigationView;
  onViewChange: (view: NavigationView) => void;
  className?: string;
  listClassName?: string;
}

export function Navigation({ currentView, onViewChange, className, listClassName }: NavigationProps) {
  const navItems = [
    { value: 'today' as const, icon: CalendarDays, label: 'Today' },
    { value: 'weekly' as const, icon: TrendingUp, label: 'Weekly' },
    { value: 'history' as const, icon: History, label: 'History' },
    { value: 'achievements' as const, icon: Trophy, label: 'Achievements' },
    { value: 'analytics' as const, icon: BarChart3, label: 'Analytics' },
    { value: 'assistant' as const, icon: MessageSquareText, label: 'Assistant' },
  ];

  return (
    <nav className={cn("w-full", className)}>
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div
          className={cn(
            "flex w-max items-center bg-card border border-border rounded-full p-1 shadow-sm mx-auto sm:mx-0",
            listClassName,
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                onClick={() => onViewChange(item.value)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full font-medium text-sm transition-all duration-200 px-3 sm:px-4 lg:px-5 py-2",
                  currentView === item.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
