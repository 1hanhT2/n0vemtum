import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHabits } from "@/hooks/use-habits";
import { useDailyEntries } from "@/hooks/use-daily-entries";
import { useWeeklyReview, useCreateWeeklyReview, useUpdateWeeklyReview } from "@/hooks/use-weekly-reviews";
import { useWeeklyInsights } from "@/hooks/use-ai";
import { getWeekDates, getWeekStartDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function WeeklyView() {
  const { toast } = useToast();
  const weekDates = getWeekDates();
  const weekStartDate = getWeekStartDate();
  
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: dailyEntries, isLoading: entriesLoading } = useDailyEntries(
    weekDates[0], 
    weekDates[6]
  );
  const { data: weeklyReview } = useWeeklyReview(weekStartDate);
  const createWeeklyReview = useCreateWeeklyReview();
  const updateWeeklyReview = useUpdateWeeklyReview();
  const weeklyInsightsMutation = useWeeklyInsights(weekDates[0], weekDates[6]);

  const [accomplishment, setAccomplishment] = useState('');
  const [breakdown, setBreakdown] = useState('');
  const [adjustment, setAdjustment] = useState('');
  const [aiInsights, setAiInsights] = useState<any>(null);

  // Load existing weekly review data
  useEffect(() => {
    if (weeklyReview) {
      setAccomplishment(weeklyReview.accomplishment || '');
      setBreakdown(weeklyReview.breakdown || '');
      setAdjustment(weeklyReview.adjustment || '');
    }
  }, [weeklyReview]);

  // Generate AI insights when data is available
  useEffect(() => {
    if (dailyEntries && habits && dailyEntries.length > 0) {
      weeklyInsightsMutation.mutate(undefined, {
        onSuccess: (data) => {
          setAiInsights(data);
        },
      });
    }
  }, [dailyEntries, habits]);

  // Calculate weekly statistics
  const weeklyStats = {
    totalDays: dailyEntries?.length || 0,
    completedDays: dailyEntries?.filter(entry => entry.completedAt).length || 0,
    avgScore: 0,
    totalHabits: 0,
    completedHabits: 0,
    completionRate: 0,
  };

  if (dailyEntries && habits) {
    let totalScore = 0;
    let scoreDays = 0;

    dailyEntries.forEach(entry => {
      const habitData = entry.habitCompletions as Record<string, boolean>;
      
      // Calculate average score
      if (entry.punctualityScore && entry.adherenceScore) {
        totalScore += (entry.punctualityScore + entry.adherenceScore) / 2;
        scoreDays++;
      }

      // Count all habits for this day
      habits.forEach(habit => {
        weeklyStats.totalHabits++;
        if (habitData[habit.id.toString()]) {
          weeklyStats.completedHabits++;
        }
      });
    });

    weeklyStats.avgScore = scoreDays > 0 ? totalScore / scoreDays : 0;
    weeklyStats.completionRate = weeklyStats.totalHabits > 0 
      ? (weeklyStats.completedHabits / weeklyStats.totalHabits) * 100 
      : 0;
  }

  // Prepare chart data
  const dailyScoresData = weekDates.map((date, index) => {
    const entry = dailyEntries?.find(e => e.date === date);
    const avgScore = entry 
      ? (entry.punctualityScore + entry.adherenceScore) / 2 
      : 0;
    
    return {
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
      score: avgScore,
    };
  });

  const habitCompletionData = [
    { name: 'Completed', value: weeklyStats.completedHabits, color: '#10B981' },
    { name: 'Missed', value: weeklyStats.totalHabits - weeklyStats.completedHabits, color: '#EF4444' },
  ];

  const handleSaveReview = async () => {
    const reviewData = {
      weekStartDate,
      accomplishment,
      breakdown,
      adjustment,
    };

    try {
      if (weeklyReview) {
        await updateWeeklyReview.mutateAsync({ weekStartDate, ...reviewData });
      } else {
        await createWeeklyReview.mutateAsync(reviewData);
      }
      
      toast({
        title: "Review saved successfully!",
        description: "Your weekly reflection has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error saving review",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (habitsLoading || entriesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">📊 Weekly Review</h2>
        <p className="text-gray-600 dark:text-gray-300">Reflect on your progress and plan ahead</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-lg text-center bg-card dark:bg-gray-900 border-border dark:border-gray-700 transition-all duration-200 hover:dark:bg-gray-800 hover:shadow-xl">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-2xl sm:text-3xl mb-2">📅</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {weeklyStats.completedDays}/7
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <span className="sm:hidden">Days</span>
              <span className="hidden sm:inline">Days Completed</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-lg text-center bg-card dark:bg-gray-900 border-border dark:border-gray-700 transition-all duration-200 hover:dark:bg-gray-800 hover:shadow-xl">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-2xl sm:text-3xl mb-2">✅</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {weeklyStats.completionRate.toFixed(0)}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <span className="sm:hidden">Rate</span>
              <span className="hidden sm:inline">Habit Completion</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-lg text-center bg-card dark:bg-gray-900 border-border dark:border-gray-700 transition-all duration-200 hover:dark:bg-gray-800 hover:shadow-xl">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-2xl sm:text-3xl mb-2">⭐</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {weeklyStats.avgScore.toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <span className="sm:hidden">Score</span>
              <span className="hidden sm:inline">Average Score</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Daily Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyScoresData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366F1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Habit Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={habitCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {habitCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">Missed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Weekly Insights */}
      {aiInsights && (
        <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
              AI Weekly Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Patterns Observed</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{aiInsights.patterns}</p>
                
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">This Week's Strengths</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{aiInsights.strengths}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Improvement Suggestions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{aiInsights.improvements}</p>
                
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Motivation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">{aiInsights.motivation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reflection Questions */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🤔</span>
            Guided Reflection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What was my biggest accomplishment this week?
              </label>
              <Textarea
                value={accomplishment}
                onChange={(e) => setAccomplishment(e.target.value)}
                className="w-full h-24 resize-none"
                placeholder="Reflect on your wins..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Where did my schedule break down and why?
              </label>
              <Textarea
                value={breakdown}
                onChange={(e) => setBreakdown(e.target.value)}
                className="w-full h-24 resize-none"
                placeholder="Identify challenges..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What is one adjustment I will make for next week?
              </label>
              <Textarea
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                className="w-full h-24 resize-none"
                placeholder="Plan your improvement..."
              />
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSaveReview}
                disabled={createWeeklyReview.isPending || updateWeeklyReview.isPending}
                className="gradient-bg text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl"
              >
                {createWeeklyReview.isPending || updateWeeklyReview.isPending 
                  ? "Saving..." 
                  : "Save Review"
                }
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
