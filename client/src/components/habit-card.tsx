import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useThrottle } from '@/hooks/use-debounce';
import { Flame, Check } from "lucide-react";
import { resolveTierIcon } from "@/lib/badgeIcons";

interface Habit {
  id: number;
  name: string;
  emoji: string;
  level?: number;
  experience?: number;
  experienceToNext?: number;
  streak?: number;
  longestStreak?: number;
  completionRate?: number;
  totalCompletions?: number;
  tier?: string;
  badges?: string[];
  difficultyRating?: number;
}

interface HabitCardProps {
  habit: Habit;
  date: string;
  isCompleted?: boolean;
  onToggle?: (habitId: number, completed: boolean) => void;
}

export function HabitCard({ habit, date, isCompleted = false, onToggle }: HabitCardProps) {
  const [checked, setChecked] = useState(isCompleted);

  const handleToggleInternal = (value: boolean) => {
    setChecked(value);
    onToggle?.(habit.id, value);
  };

  const handleToggle = useThrottle(handleToggleInternal, 500);

  const experiencePercentage = habit.experience !== undefined && habit.experienceToNext
    ? Math.min(100, (habit.experience / habit.experienceToNext) * 100)
    : 0;

  const TierIcon = resolveTierIcon(habit.tier);

  return (
    <div className="w-full"
    >
      <Card className={`p-4 transition-colors duration-200 ${
        checked 
          ? 'border-primary/50 bg-primary/5 dark:bg-primary/10' 
          : 'hover-elevate'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggle(!checked)}
            data-testid={`button-toggle-habit-${habit.id}`}
            className={`w-10 h-10 rounded-md border-2 transition-colors duration-200 flex items-center justify-center flex-shrink-0 ${
              checked
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {checked && <Check className="w-5 h-5" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">
                {habit.name}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              {habit.tier && (
                <Badge variant="outline" className="text-xs capitalize">
                  <TierIcon className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">{habit.tier}</span>
                </Badge>
              )}
              {habit.level && (
                <Badge variant="outline" className="text-xs">
                  Lv.{habit.level}
                </Badge>
              )}
              {habit.streak && habit.streak > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  {habit.streak}d
                </Badge>
              )}
              {habit.experience !== undefined && habit.experienceToNext && (
                <span className="text-xs text-muted-foreground font-mono ml-auto">
                  {Math.round(experiencePercentage)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
