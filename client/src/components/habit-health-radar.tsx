import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Activity, TrendingUp } from "lucide-react";

interface HabitHealthRadarProps {
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

export function HabitHealthRadar({ habits }: HabitHealthRadarProps) {
  // Calculate health metrics from habit data
  const calculateHealthMetrics = () => {
    if (!habits || habits.length === 0) {
      return [];
    }

    // Calculate average values across all habits
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => (h.completionRate || 0) > 0);
    
    const avgCompletionRate = activeHabits.length > 0 
      ? activeHabits.reduce((sum, h) => sum + (h.completionRate || 0), 0) / activeHabits.length 
      : 0;
    
    const avgStreak = activeHabits.length > 0
      ? activeHabits.reduce((sum, h) => sum + (h.streak || 0), 0) / activeHabits.length
      : 0;
    
    const avgLevel = activeHabits.length > 0
      ? activeHabits.reduce((sum, h) => sum + (h.level || 1), 0) / activeHabits.length
      : 1;
    
    const avgDifficulty = activeHabits.length > 0
      ? activeHabits.reduce((sum, h) => sum + (h.difficultyRating || 3), 0) / activeHabits.length
      : 0;
    
    const totalBadges = habits.reduce((sum, h) => sum + (h.badges?.length || 0), 0);
    
    // Calculate consistency (based on streak vs total completions ratio)
    const avgConsistency = activeHabits.length > 0
      ? activeHabits.reduce((sum, h) => {
          const completions = h.totalCompletions || 0;
          const streak = h.streak || 0;
          return sum + (completions > 0 ? (streak / Math.max(completions, 1)) * 100 : 0);
        }, 0) / activeHabits.length
      : 0;

    // Scale values to 0-100 for radar chart
    return [
      {
        metric: 'Completion Rate',
        value: Math.min(avgCompletionRate, 100),
        fullMark: 100
      },
      {
        metric: 'Current Streaks',
        value: Math.min(avgStreak * 10, 100), // Scale streaks (10 days = 100%)
        fullMark: 100
      },
      {
        metric: 'Habit Levels',
        value: Math.min(avgLevel * 20, 100), // Scale levels (5 levels = 100%)
        fullMark: 100
      },
      {
        metric: 'Difficulty Rating',
        value: Math.min((avgDifficulty / 5) * 100, 100),
        fullMark: 100
      },
      {
        metric: 'Achievement Badges',
        value: Math.min(totalBadges * 25, 100), // Scale badges (4 badges = 100%)
        fullMark: 100
      },
      {
        metric: 'Consistency',
        value: Math.min(avgConsistency, 100),
        fullMark: 100
      }
    ];
  };

  const healthData = calculateHealthMetrics();

  // Calculate overall health score
  const overallScore = healthData.length > 0 
    ? Math.round(healthData.reduce((sum, item) => sum + item.value, 0) / healthData.length)
    : 0;

  // Determine health status
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 60) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (score >= 40) return { status: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'Needs Attention', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const healthStatus = getHealthStatus(overallScore);

  if (!habits || habits.length === 0) {
    return (
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Habit Health Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No habit data available</p>
            <p className="text-sm">Complete some habits to see your health overview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Habit Health Overview</span>
          </div>
          <div className={`px-3 py-1 rounded-md ${healthStatus.bgColor} ${healthStatus.color} text-sm font-medium`}>
            {overallScore}% - {healthStatus.status}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Radar Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={healthData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-300"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                  className="text-gray-400 dark:text-gray-500"
                />
                <Radar
                  name="Health Score"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Health Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Key Metrics</span>
              </h4>
              <div className="space-y-2 text-sm">
                {healthData.map((item) => (
                  <div key={item.metric} className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{item.metric}</span>
                    <span className={`font-medium ${
                      item.value >= 70 ? 'text-green-600' : 
                      item.value >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(item.value)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-white">Recommendations</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {overallScore < 40 && (
                  <p>• Focus on building consistency with easier habits first</p>
                )}
                {(healthData.find(d => d.metric === 'Current Streaks')?.value ?? 0) < 30 && (
                  <p>• Work on maintaining daily streaks for better momentum</p>
                )}
                {(healthData.find(d => d.metric === 'Completion Rate')?.value ?? 0) < 50 && (
                  <p>• Consider reducing habit difficulty or frequency</p>
                )}
                {(healthData.find(d => d.metric === 'Consistency')?.value ?? 0) < 40 && (
                  <p>• Try habit stacking or environmental cues for consistency</p>
                )}
                {overallScore >= 80 && (
                  <p>• Excellent progress! Consider adding new challenging habits</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
