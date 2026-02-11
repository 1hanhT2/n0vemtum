import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievements } from "@/hooks/use-achievements";
import { useHabits } from "@/hooks/use-habits";
import { useStreaks } from "@/hooks/use-streaks";
import { useRanks } from "@/hooks/use-ranks";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getMockAchievements, getMockHabits, getMockRankInfo, getMockStreaks } from "@/lib/mockData";
import { Crown, Flame, Medal, Star, Trophy } from "lucide-react";
import { resolveBadgeIcon } from "@/lib/badgeIcons";
import { rankDefinitions } from "@shared/ranks";

interface AchievementsPanelProps {
  isGuestMode?: boolean;
}

const achievementXp: Record<string, number> = {
  "First Steps": 50,
  "Spark Starter": 60,
  "Week Warrior": 100,
  "Momentum Master": 140,
  "Peak Performer": 180,
  "Unstoppable Force": 220,
  "Legend": 320,
  "Mythic Rhythm": 450,
  "Perfect Day": 180,
  "Near Perfect": 140,
  "Flow State": 160,
  "Solid Progress": 110,
  "Reflection Master": 90,
  "Self-Aware": 130,
  "Wisdom Keeper": 170,
  "Getting Into It": 80,
  "Dedicated": 120,
  "Half Century": 160,
  "Century Club": 220,
  "Habit Master": 300,
  "Life Changer": 380,
  "Note Taker": 90,
  "Habit Creator": 110,
};

const nonRepeatableAchievements = new Set<string>(["First Steps", "Spark Starter"]);

const getXpLabel = (name: string) => {
  const base = achievementXp[name] ?? 100;
  if (nonRepeatableAchievements.has(name)) {
    return `${base} XP (one-time)`;
  }
  return `${base} XP (${Math.floor(base * 0.5)} XP on repeat)`;
};

export function AchievementsPanel({ isGuestMode = false }: AchievementsPanelProps) {
  const { data: achievements, isLoading: achievementsLoading } = isGuestMode 
    ? { data: getMockAchievements(), isLoading: false }
    : useAchievements();
  const { data: habits, isLoading: habitsLoading } = isGuestMode
    ? { data: getMockHabits(), isLoading: false }
    : useHabits();
  const { data: streaks, isLoading: streaksLoading } = isGuestMode
    ? { data: getMockStreaks(), isLoading: false }
    : useStreaks();
  const { data: rankInfo, isLoading: ranksLoading } = isGuestMode
    ? { data: getMockRankInfo(), isLoading: false }
    : useRanks();

  if (achievementsLoading || habitsLoading || streaksLoading || ranksLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const dailyStreak = streaks?.find(s => s.type === 'daily_completion');
  const unlockedAchievements = achievements?.filter(a => a.isUnlocked) || [];
  const lockedAchievements = achievements?.filter(a => !a.isUnlocked) || [];
  const ranks = rankInfo?.ranks || rankDefinitions;
  const currentRank = rankInfo?.currentRank || ranks[0];
  const nextRank = rankInfo?.nextRank;
  const rankProgress = rankInfo?.progressToNext ?? 0;
  const currentLevel = rankInfo?.level ?? 1;
  const levelsToNext = nextRank ? Math.max(0, nextRank.minLevel - currentLevel) : 0;

  const tierOrder: Record<string, number> = {
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4,
    diamond: 5,
  };

  const normalizeTier = (tier?: string) => (tier || "bronze").toLowerCase();
  const formatTierLabel = (tier?: string) => {
    const normalized = normalizeTier(tier);
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const sortedHabits = [...(habits || [])].sort((a, b) => {
    const aTier = tierOrder[normalizeTier(a.tier)] ?? 0;
    const bTier = tierOrder[normalizeTier(b.tier)] ?? 0;
    if (aTier !== bTier) return bTier - aTier;
    const aLevel = a.level ?? 0;
    const bLevel = b.level ?? 0;
    if (aLevel !== bLevel) return bLevel - aLevel;
    return (a.name || "").localeCompare(b.name || "");
  });

  const renderDifficultyStars = (rating?: number) => {
    const normalized = Math.min(5, Math.max(0, Math.round(rating ?? 0)));
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, idx) => {
          const filled = idx < normalized;
          return (
            <Star
              key={`${normalized}-${idx}`}
              className={filled ? "h-3 w-3 text-amber-500" : "h-3 w-3 text-muted-foreground/40"}
              fill={filled ? "currentColor" : "none"}
            />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Achievements & Streaks</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Track your progress and unlock badges as you build healthy habits</p>
        
        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-md border border-amber-200 dark:border-amber-800/40 bg-card">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Unlocked</div>
          </div>
          <div className="text-center p-3 rounded-md border border-border bg-card">
            <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
              {lockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">To Unlock</div>
          </div>
        </div>
      </div>

      {/* Current Streaks */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-md border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Flame className="mr-2 h-5 w-5 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {dailyStreak?.currentStreak || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Days in a row</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Medal className="mr-2 h-5 w-5 text-purple-500" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {dailyStreak?.longestStreak || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Personal best</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Ladder */}
      {ranks.length > 0 && (
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              System Ranks
            </CardTitle>
            <p className="text-sm text-muted-foreground">Direct from the Status Window so your rank ladder is easy to reference.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentRank && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono uppercase tracking-wide">
                  <span className="text-foreground/80">Current: {currentRank.name}</span>
                  <span>
                    {nextRank ? `Next: Lv ${nextRank.minLevel} ${nextRank.name}` : "Max rank reached"}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                    style={{ width: `${Math.round(rankProgress * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Level {currentLevel}
                  {nextRank ? ` · ${levelsToNext} levels to ${nextRank.name}` : " · Legendary status unlocked"}
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              {ranks.map((rank) => {
                const isCurrent = rank.name === currentRank?.name;
                const isNext = rank.name === nextRank?.name;
                return (
                  <div
                    key={rank.name}
                    className={`p-3 rounded-lg border transition-colors ${
                      isCurrent
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/10"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isCurrent ? "bg-amber-500" : "bg-muted-foreground/50"}`} />
                        <span className="font-semibold text-foreground">{rank.name}</span>
                      </div>
                      <Badge variant={isCurrent ? "default" : "secondary"} className="text-[11px]">
                        {isCurrent ? "Current" : `Lv ${rank.minLevel}+`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {rank.description}
                    </p>
                    {isNext && !isCurrent && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-300 mt-1">You're headed here next.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              Unlocked Achievements ({unlockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {unlockedAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center p-4 rounded-md bg-card border border-amber-200 dark:border-amber-700/40"
                >
                  <div className="flex justify-center mb-2">
                    {(() => {
                      const Icon = resolveBadgeIcon(achievement.badge);
                      return <Icon className="h-7 w-7 text-amber-500" />;
                    })()}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {achievement.description}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                    {getXpLabel(achievement.name)}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Unlocked
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Achievements */}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            Available Achievements ({lockedAchievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lockedAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center p-4 rounded-md bg-card border border-border opacity-75"
              >
                <div className="flex justify-center mb-2 grayscale">
                  {(() => {
                    const Icon = resolveBadgeIcon(achievement.badge);
                    return <Icon className="h-7 w-7 text-gray-500 dark:text-gray-400" />;
                  })()}
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                  {achievement.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  {achievement.description}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  {getXpLabel(achievement.name)}
                </p>
                <Badge variant="outline" className="text-xs">
                  {achievement.type === 'streak' && `${achievement.requirement} days`}
                  {achievement.type === 'completion' && `${achievement.requirement}% completion`}
                  {achievement.type === 'milestone' && `${achievement.requirement} total days`}
                  {achievement.type === 'consistency' && `${achievement.requirement} reviews`}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            Task Ranks
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Each task can reach 5 tiers: Bronze, Silver, Gold, Platinum, Diamond.
          </p>
        </CardHeader>
        <CardContent>
          {sortedHabits.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {sortedHabits.map((habit) => {
                const tierLabel = `${formatTierLabel(habit.tier)} ${habit.level ?? 1}`;
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {habit.emoji} {habit.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{tierLabel}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Difficulty</span>
                      {renderDifficultyStars(habit.difficultyRating)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
