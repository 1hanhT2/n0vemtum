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

export function HabitStatsRow({ habit }: { habit: HabitProgressionProps['habit'] }) {
  const level = habit.level || 1;
  const streak = habit.streak || 0;
  const tier = habit.tier || "bronze";
  const badges = habit.badges || [];
  const totalCompletions = habit.totalCompletions || 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant="outline" className="text-xs" data-testid={`badge-level-${habit.id}`}>
        Lv. {level}
      </Badge>
      <Badge variant="outline" className="text-xs capitalize" data-testid={`badge-tier-${habit.id}`}>
        {tier}
      </Badge>
      {streak > 0 && (
        <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-streak-${habit.id}`}>
          <Flame className="w-3 h-3 text-orange-500" />
          {streak}d
        </span>
      )}
      {totalCompletions > 0 && (
        <span className="text-xs text-muted-foreground" data-testid={`text-completions-${habit.id}`}>
          {totalCompletions} done
        </span>
      )}
      {badges.length > 0 && (
        <div className="flex items-center gap-0.5">
          {badges.slice(0, 4).map((badge) => {
            const Icon = resolveBadgeIcon(badge);
            return (
              <span
                key={badge}
                title={badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              >
                <Icon className="h-3.5 w-3.5 text-amber-500" />
              </span>
            );
          })}
          {badges.length > 4 && (
            <span className="text-xs text-muted-foreground ml-0.5">+{badges.length - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function HabitProgressBar({ habit }: { habit: HabitProgressionProps['habit'] }) {
  const experience = habit.experience || 0;
  const experienceToNext = habit.experienceToNext || 100;
  const experiencePercentage = experienceToNext > 0 ? (experience / experienceToNext) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <Progress value={Math.min(experiencePercentage, 100)} className="h-1.5 flex-1" />
      <span className="text-xs text-muted-foreground font-mono w-10 text-right">{Math.round(experiencePercentage)}%</span>
    </div>
  );
}

export function LevelUpButton({ habit, onLevelUp }: HabitProgressionProps) {
  const experience = habit.experience || 0;
  const experienceToNext = habit.experienceToNext || 100;
  const experiencePercentage = experienceToNext > 0 ? (experience / experienceToNext) * 100 : 0;

  if (experiencePercentage < 100) return null;

  return (
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
  );
}

export function HabitProgression({ habit, onLevelUp }: HabitProgressionProps) {
  return (
    <div className="space-y-2">
      <HabitStatsRow habit={habit} />
      <HabitProgressBar habit={habit} />
      <LevelUpButton habit={habit} onLevelUp={onLevelUp} />
    </div>
  );
}
