import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitHealthRadar } from "@/components/habit-health-radar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Target, Award, Flame, BarChart3, Calendar } from "lucide-react";

interface HabitHealthDashboardProps {
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
    difficultyRating?: number;
  }>;
}

export function HabitHealthDashboard({ habits }: HabitHealthDashboardProps) {
  // Calculate detailed analytics
  const analytics = {
    totalHabits: habits.length,
    activeHabits: habits.filter(h => (h.completionRate || 0) > 0).length,
    averageLevel: habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + (h.level || 1), 0) / habits.length) : 0,
    totalBadges: habits.reduce((sum, h) => sum + (h.badges?.length || 0), 0),
    longestStreak: Math.max(...habits.map(h => h.longestStreak || 0), 0),
    averageCompletionRate: habits.length > 0 
      ? Math.round(habits.reduce((sum, h) => sum + (h.completionRate || 0), 0) / habits.length)
      : 0
  };

  // Get top performing habits
  const topHabits = [...habits]
    .sort((a, b) => (b.completionRate || 0) - (a.completionRate || 0))
    .slice(0, 5);

  // Get habits that need attention
  const strugglingHabits = [...habits]
    .filter(h => (h.completionRate || 0) > 0 && (h.completionRate || 0) < 50)
    .sort((a, b) => (a.completionRate || 0) - (b.completionRate || 0))
    .slice(0, 3);

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'diamond': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'platinum': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'silver': return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Radar */}
      <HabitHealthRadar habits={habits} />

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.activeHabits}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Active Habits</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageLevel}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Level</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-2">
                  <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.longestStreak}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Best Streak</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-2">
                  <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalBadges}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Badges</div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Habit Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Average Completion Rate</span>
                  <span className="font-medium">{analytics.averageCompletionRate}%</span>
                </div>
                <Progress value={analytics.averageCompletionRate} className="h-3" />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Based on {analytics.activeHabits} active habits
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Top Performing Habits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-600" />
                <span>Top Performing Habits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topHabits.length > 0 ? topHabits.map((habit, index) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full text-sm font-bold">
                        #{index + 1}
                      </div>
                      <span className="text-lg">{habit.emoji}</span>
                      <div>
                        <div className="font-medium">{habit.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Level {habit.level || 1} • {habit.streak || 0} day streak
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{habit.completionRate || 0}%</div>
                      <Badge variant="secondary" className={getTierColor(habit.tier || 'bronze')}>
                        {habit.tier || 'Bronze'}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No habit data available yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Habits Needing Attention */}
          {strugglingHabits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <span>Habits Needing Attention</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {strugglingHabits.map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{habit.emoji}</span>
                        <div>
                          <div className="font-medium">{habit.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {habit.totalCompletions || 0} completions • {habit.streak || 0} day streak
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-600">{habit.completionRate || 0}%</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Needs focus</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Habit Insights & Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">System Analysis</h4>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    <li>• You have {analytics.totalHabits} habits tracked with {analytics.activeHabits} showing activity</li>
                    <li>• Your average completion rate is {analytics.averageCompletionRate}%</li>
                    <li>• You've earned {analytics.totalBadges} achievement badges</li>
                    <li>• Your longest streak reached {analytics.longestStreak} days</li>
                  </ul>
                </div>

                {analytics.averageCompletionRate < 50 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Improvement Opportunities</h4>
                    <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                      <li>• Consider starting with fewer, easier habits to build momentum</li>
                      <li>• Try habit stacking - link new habits to existing routines</li>
                      <li>• Set up environmental cues to remind you of your habits</li>
                    </ul>
                  </div>
                )}

                {analytics.averageCompletionRate >= 70 && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Great Progress!</h4>
                    <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                      <li>• Your consistency is excellent - keep up the great work!</li>
                      <li>• Consider adding more challenging habits to your routine</li>
                      <li>• You're ready to focus on habit optimization and refinement</li>
                    </ul>
                  </div>
                )}

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Next Steps</h4>
                  <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                    <li>• Review your habit health radar weekly to track progress</li>
                    <li>• Focus on maintaining streaks rather than perfection</li>
                    <li>• Celebrate small wins and earned badges</li>
                    <li>• Adjust habit difficulty based on your completion rates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
