import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Award, Target } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GamificationSummaryProps {
  habits: Array<{
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
  }>;
}

export function GamificationSummary({ habits }: GamificationSummaryProps) {
  if (!habits || habits.length === 0) {
    return null;
  }

  // Filter habits with gamification data
  const gamifiedHabits = habits.filter(h => h.level !== undefined);
  
  if (gamifiedHabits.length === 0) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Gamification System</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Complete habits to unlock progression features and achievements!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const totalLevel = gamifiedHabits.reduce((sum, habit) => sum + (habit.level || 0), 0);
  const totalBadges = gamifiedHabits.reduce((sum, habit) => sum + (habit.badges?.length || 0), 0);
  const averageCompletionRate = Math.floor(
    gamifiedHabits.reduce((sum, habit) => sum + (habit.completionRate || 0), 0) / gamifiedHabits.length
  );
  const bestStreakOverall = Math.max(...gamifiedHabits.map(h => h.longestStreak || 0), 0);
  const currentStreaks = gamifiedHabits.map(h => h.streak || 0);
  const currentStreakOverall = Math.max(...currentStreaks, 0);
  const medianCurrentStreak = currentStreaks.length
    ? (() => {
        const sorted = [...currentStreaks].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0
          ? sorted[mid]
          : Math.floor((sorted[mid - 1] + sorted[mid]) / 2);
      })()
    : 0;

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Progress Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-1">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <div className="text-lg font-bold">{totalLevel}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Levels</div>
          </div>
          
          <div className="text-center space-y-1">
            <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-lg font-bold">{totalBadges}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Badges Earned</div>
          </div>
          
          <div className="text-center space-y-1">
            <Target className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-bold">{averageCompletionRate}%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Success</div>
          </div>
          
          <div className="text-center space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-default">
                  <Trophy className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{currentStreakOverall}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Current Streak</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="text-center">
                <div className="text-sm font-semibold">Best streak: {bestStreakOverall} days</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Median current: {medianCurrentStreak} days</div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
