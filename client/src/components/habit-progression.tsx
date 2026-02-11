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
  bronze: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  silver: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700",
  gold: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  platinum: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  diamond: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
};

export function HabitStatsRow({ habit }: { habit: HabitProgressionProps['habit'] }) {
  const level = habit.level || 1;
  const streak = habit.streak || 0;
  const tier = habit.tier || "bronze";
  const badges = habit.badges || [];
  const totalCompletions = habit.totalCompletions || 0;

  const hasActivity = streak > 0 || totalCompletions > 0 || badges.length > 0;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Badge className="text-xs bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-blue-300 dark:border-primary/30" data-testid={`badge-level-${habit.id}`}>
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
