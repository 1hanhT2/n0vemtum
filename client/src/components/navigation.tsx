import { CalendarDays, TrendingUp, History, Trophy, BarChart3, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavigationView = 'today' | 'weekly' | 'history' | 'achievements' | 'analytics' | 'assistant';

export const navigationItems = [
  { value: "today" as const, icon: CalendarDays, label: "Today" },
  { value: "weekly" as const, icon: TrendingUp, label: "Weekly" },
  { value: "history" as const, icon: History, label: "History" },
  { value: "achievements" as const, icon: Trophy, label: "Achievements" },
  { value: "analytics" as const, icon: BarChart3, label: "Analytics" },
  { value: "assistant" as const, icon: MessageSquareText, label: "Assistant" },
];

interface NavigationProps {
  currentView: NavigationView;
  onViewChange: (view: NavigationView) => void;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
}

export function Navigation({ currentView, onViewChange, className, listClassName, itemClassName }: NavigationProps) {
  return (
    <nav className={cn("w-full", className)}>
      <div className="app-nav-scroll">
        <div
          className={cn(
            "app-nav-track",
            listClassName,
          )}
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                data-testid={`nav-${item.value}`}
                onClick={() => onViewChange(item.value)}
                className={cn(
                  "app-nav-item",
                  currentView === item.value
                    ? "app-nav-item-active"
                    : "app-nav-item-idle",
                  itemClassName,
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
