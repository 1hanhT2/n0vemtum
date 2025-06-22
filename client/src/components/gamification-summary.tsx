import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Target } from "lucide-react";

interface GamificationSummaryProps {
  habits: Array<{
    id: number;
    name: string;
    emoji: string;
    level?: number;
    experience?: number;
    experienceToNext?: number;
    masteryPoints?: number;
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
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Gamification System</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Complete habits to unlock progression features, experience points, and achievements!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const totalLevel = gamifiedHabits.reduce((sum, habit) => sum + (habit.level || 0), 0);
  const totalMasteryPoints = gamifiedHabits.reduce((sum, habit) => sum + (habit.masteryPoints || 0), 0);
  const averageCompletionRate = Math.floor(
    gamifiedHabits.reduce((sum, habit) => sum + (habit.completionRate || 0), 0) / gamifiedHabits.length
  );
  const longestStreakOverall = Math.max(...gamifiedHabits.map(h => h.longestStreak || 0));

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Progress Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-1">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
              <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{totalLevel}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Levels</div>
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
              <Zap className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{totalMasteryPoints}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Mastery Points</div>
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
              <Target className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{averageCompletionRate}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Success</div>
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-bold">{longestStreakOverall}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Best Streak</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}