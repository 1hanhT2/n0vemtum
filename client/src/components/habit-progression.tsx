import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Flame,
} from "lucide-react";
import { motion } from "framer-motion";
import { resolveBadgeIcon } from "@/lib/badgeIcons";
import { DifficultyBadge } from "@/components/habit-difficulty-display";

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

const tierStyle: Record<string, string> = {
  bronze: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
  silver: "bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700/40 dark:text-gray-200 dark:border-gray-600",
  gold: "bg-yellow-100 text-yellow-700 border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700",
  platinum: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/30 dark:text-sky-200 dark:border-sky-700",
  diamond: "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-200 dark:border-violet-700",
};

function getLevelStyle(level: number): string {
  if (level <= 3) return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700";
  if (level <= 6) return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700";
  if (level <= 9) return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700";
  return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700";
}

export function HabitStatsRow({ habit }: { habit: HabitProgressionProps['habit'] }) {
  const level = habit.level || 1;
  const streak = habit.streak || 0;
  const tier = habit.tier || "bronze";
  const badges = habit.badges || [];
  const totalCompletions = habit.totalCompletions || 0;

  const hasActivity = streak > 0 || totalCompletions > 0 || badges.length > 0;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Badge className={`text-xs ${getLevelStyle(level)}`} data-testid={`badge-level-${habit.id}`}>
        Lv. {level}
      </Badge>
      <Badge className={`text-xs capitalize ${tierStyle[tier] || tierStyle.bronze}`} data-testid={`badge-tier-${habit.id}`}>
        {tier}
      </Badge>
      <DifficultyBadge difficultyRating={habit.difficultyRating} habitId={habit.id} />

      {hasActivity && (
        <>
          <span className="w-px h-3.5 bg-border mx-0.5" />

          {streak > 0 && (
            <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800" data-testid={`text-streak-${habit.id}`}>
              <Flame className="w-3 h-3 mr-0.5" />
              {streak}d
            </Badge>
          )}
          {totalCompletions > 0 && (
            <span className="text-xs text-muted-foreground font-mono" data-testid={`text-completions-${habit.id}`}>
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
        </>
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
