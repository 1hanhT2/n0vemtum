import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import { resolveBadgeIcon } from "@/lib/badgeIcons";

interface HabitProgressionProps {
  habit: {
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
  };
  onLevelUp?: (habitId: number) => void;
}

export function HabitProgression({ habit, onLevelUp }: HabitProgressionProps) {
  const level = habit.level || 1;
  const experience = habit.experience || 0;
  const experienceToNext = habit.experienceToNext || 100;
  const streak = habit.streak || 0;
  const tier = habit.tier || "bronze";
  const badges = habit.badges || [];
  const totalCompletions = habit.totalCompletions || 0;

  const experiencePercentage = experienceToNext > 0 ? (experience / experienceToNext) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="text-xs" data-testid={`badge-level-${habit.id}`}>
          Lv. {level}
        </Badge>
        <Badge variant="outline" className="text-xs capitalize" data-testid={`badge-tier-${habit.id}`}>
          {tier}
        </Badge>
        {streak > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-streak-${habit.id}`}>
            <Flame className="w-3 h-3 text-orange-500" />
            {streak}d streak
          </span>
        )}
        {totalCompletions > 0 && (
          <span className="text-xs text-muted-foreground" data-testid={`text-completions-${habit.id}`}>
            {totalCompletions} done
          </span>
        )}
        {badges.length > 0 && (
          <div className="flex items-center gap-0.5">
            {badges.slice(0, 5).map((badge) => {
              const Icon = resolveBadgeIcon(badge);
              return (
                <span
                  key={badge}
                  title={badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                >
                  <Icon className="h-4 w-4 text-amber-500" />
                </span>
              );
            })}
            {badges.length > 5 && (
              <span className="text-xs text-muted-foreground ml-1">+{badges.length - 5}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Progress value={experiencePercentage} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground font-mono w-8 text-right">{Math.round(experiencePercentage)}%</span>
      </div>

      {experiencePercentage >= 100 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Button
            size="sm"
            onClick={() => onLevelUp?.(habit.id)}
            data-testid={`button-levelup-${habit.id}`}
          >
            <Trophy className="w-3 h-3 mr-1" />
            Level Up
          </Button>
        </motion.div>
      )}
    </div>
  );
}
