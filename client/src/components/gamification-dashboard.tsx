import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Crown, Star, Zap, Target, Flame, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { resolveBadgeIcon } from "@/lib/badgeIcons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GamificationDashboardProps {
  habits: Array<{
    id: number;
    name: string;
    emoji: string;
    level: number;
    experience: number;
    experienceToNext: number;
    masteryPoints: number;
    streak: number;
    longestStreak: number;
    completionRate: number;
    totalCompletions: number;
    tier: string;
    badges: string[];
  }>;
}

export function GamificationDashboard({ habits }: GamificationDashboardProps) {
  if (!habits || habits.length === 0) {
    return null;
  }

  // Calculate overall stats
  const totalLevel = habits.reduce((sum, habit) => sum + habit.level, 0);
  const totalMasteryPoints = habits.reduce((sum, habit) => sum + habit.masteryPoints, 0);
  const averageCompletionRate = Math.floor(
    habits.reduce((sum, habit) => sum + habit.completionRate, 0) / habits.length
  );
  const longestStreakOverall = Math.max(...habits.map(h => h.longestStreak), 0);
  const currentStreaks = habits.map(h => h.streak);
  const currentStreakOverall = Math.max(...currentStreaks, 0);
  const medianCurrentStreak = (() => {
    const sorted = [...currentStreaks].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : Math.floor((sorted[mid - 1] + sorted[mid]) / 2);
  })();
  const totalBadges = habits.reduce((sum, habit) => sum + habit.badges.length, 0);

  // Calculate tier distribution
  const tierCounts = habits.reduce((acc, habit) => {
    acc[habit.tier] = (acc[habit.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "text-amber-600 bg-amber-100 dark:bg-amber-900/20";
      case "silver": return "text-gray-500 bg-gray-100 dark:bg-gray-900/20";
      case "gold": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "platinum": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "diamond": return "text-purple-600 bg-purple-100 dark:bg-purple-900/20";
      default: return "text-gray-500 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Gamification Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="p-3 bg-card rounded-lg">
                <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <div className="text-lg font-bold">{totalLevel}</div>
                <div className="text-xs text-muted-foreground">Total Levels</div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="p-3 bg-card rounded-lg">
                <Zap className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <div className="text-lg font-bold">{totalMasteryPoints}</div>
                <div className="text-xs text-muted-foreground">Mastery Points</div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="p-3 bg-card rounded-lg">
                <Target className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <div className="text-lg font-bold">{averageCompletionRate}%</div>
                <div className="text-xs text-muted-foreground">Avg Success</div>
              </div>
          </div>
          
          <div className="text-center space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 bg-card rounded-lg cursor-default">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <div className="text-lg font-bold">{currentStreakOverall}</div>
                  <div className="text-xs text-muted-foreground">Current Streak</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="text-center">
                <div className="text-sm font-semibold">Best streak: {longestStreakOverall} days</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Median current: {medianCurrentStreak} days</div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-blue-500" />
              <span>Tier Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(tierCounts).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <Badge className={getTierColor(tier)}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / habits.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {habits
                .sort((a, b) => b.level - a.level || b.masteryPoints - a.masteryPoints)
                .slice(0, 3)
                .map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="text-lg">
                      <Medal
                        className={`h-5 w-5 ${
                          index === 0
                            ? "text-yellow-500"
                            : index === 1
                              ? "text-gray-400"
                              : "text-amber-700"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{habit.emoji}</span>
                        <span className="font-medium">{habit.name}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Level {habit.level} • {habit.masteryPoints} MP
                      </div>
                    </div>
                    <Badge className={getTierColor(habit.tier)}>
                      {habit.tier}
                    </Badge>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Gallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-green-500" />
            <span>Badge Collection ({totalBadges} total)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {habits.flatMap(habit => 
              habit.badges.map((badge, index) => (
                <motion.div
                  key={`${habit.id}-${badge}-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="text-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg"
                  title={`${habit.name}: ${badge.replace(/_/g, ' ')}`}
                >
                  <div className="flex justify-center mb-1">
                    {(() => {
                      const Icon = resolveBadgeIcon(badge);
                      return <Icon className="h-6 w-6 text-amber-500" />;
                    })()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                    {badge.replace(/_/g, ' ').slice(0, 8)}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
