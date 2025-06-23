import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAchievements } from "@/hooks/use-achievements";
import { useStreaks } from "@/hooks/use-streaks";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { getMockAchievements, getMockStreaks } from "@/lib/mockData";

interface AchievementsPanelProps {
  isGuestMode?: boolean;
}

export function AchievementsPanel({ isGuestMode = false }: AchievementsPanelProps) {
  const { data: achievements, isLoading: achievementsLoading } = isGuestMode 
    ? { data: getMockAchievements(), isLoading: false }
    : useAchievements();
  const { data: streaks, isLoading: streaksLoading } = isGuestMode
    ? { data: getMockStreaks(), isLoading: false }
    : useStreaks();

  if (achievementsLoading || streaksLoading) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">🏆 Achievements & Streaks</h2>
        <p className="text-gray-600 dark:text-gray-300">Track your progress and unlock badges as you build healthy habits</p>
        
        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Unlocked</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
              {lockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">To Unlock</div>
          </div>
        </div>
      </div>

      {/* Current Streaks */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <span className="mr-2">🔥</span>
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

        <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <span className="mr-2">🏅</span>
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

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <Card className="rounded-2xl shadow-lg">
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
                  className="text-center p-4 rounded-xl bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800"
                >
                  <div className="text-4xl mb-2">{achievement.badge}</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {achievement.description}
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
      <Card className="rounded-2xl shadow-lg">
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
                className="text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-75"
              >
                <div className="text-4xl mb-2 grayscale">{achievement.badge}</div>
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                  {achievement.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  {achievement.description}
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
    </motion.div>
  );
}