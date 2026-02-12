import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHabits } from "@/hooks/use-habits";
import { useDailyEntries } from "@/hooks/use-daily-entries";
import { useWeeklyReview, useCreateWeeklyReview, useUpdateWeeklyReview } from "@/hooks/use-weekly-reviews";
import { useWeeklyInsights } from "@/hooks/use-ai";
import { getWeekDates, getWeekStartDate } from "@/lib/utils";
import gsap from "gsap";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, CalendarRange, CheckCircle2, Sparkles, Star } from "lucide-react";
import { getMockHabits } from "@/lib/mockData";
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
import { useTimeZone } from "@/hooks/use-timezone";
import { usePrefersReducedMotion } from "@/hooks/use-gsap";

interface WeeklyViewProps {
  isGuestMode?: boolean;
}

export function WeeklyView({ isGuestMode = false }: WeeklyViewProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const timeZone = useTimeZone();
  const weekDates = getWeekDates(new Date(), timeZone);
  const weekStartDate = getWeekStartDate(new Date(), timeZone);
  
  const { data: habits, isLoading: habitsLoading } = isGuestMode 
    ? { data: getMockHabits(), isLoading: false }
    : useHabits();
  const { data: dailyEntries, isLoading: entriesLoading } = isGuestMode
    ? { data: [], isLoading: false }
    : useDailyEntries(weekDates[0], weekDates[6], timeZone);
  const { data: weeklyReview, error: weeklyReviewError, isLoading: weeklyReviewLoading } = isGuestMode
    ? { data: null, error: null, isLoading: false }
    : useWeeklyReview(weekStartDate);
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
      setAiInsights(weeklyReview.aiInsights || null);
    }
  }, [weeklyReview]);

  // Handle weekly review error
  useEffect(() => {
    if (weeklyReviewError && !isGuestMode) {
      console.log('Weekly review not found for', weekStartDate, '- this is normal for new weeks');
    }
  }, [weeklyReviewError, weekStartDate, isGuestMode]);

  // Handle AI insights response
  const persistAiInsights = async (insights: any) => {
    if (isGuestMode) return;

    const payload = {
      weekStartDate,
      aiInsights: insights,
    };

    if (weeklyReview) {
      await updateWeeklyReview.mutateAsync(payload);
    } else {
      await createWeeklyReview.mutateAsync({
        weekStartDate,
        accomplishment: "",
        breakdown: "",
        adjustment: "",
        aiInsights: insights,
      });
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    if (prefersReducedMotion) {
      gsap.set(containerRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );

    return () => {
      gsap.killTweensOf(containerRef.current);
    };
  }, [prefersReducedMotion]);

  const handleGenerateInsights = () => {
    if (isGuestMode) {
      toast({
        title: "Insights unavailable in demo",
        description: "Sign in to generate and save weekly insights.",
      });
      return;
    }

    weeklyInsightsMutation.mutate(undefined, {
      onSuccess: async (data) => {
        console.log('Weekly insights received:', data);
        setAiInsights(data);
        await persistAiInsights(data);
        toast({
          title: "Insights refreshed",
          description: "AI insights have been generated and saved.",
        });
      },
      onError: () => {
        toast({
          title: "Could not generate insights",
          description: "Please try again.",
          variant: "destructive",
        });
      },
    });
  };

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
      aiInsights: aiInsights || {},
    };

    try {
      if (weeklyReview) {
        await updateWeeklyReview.mutateAsync({ ...reviewData });
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
    <div ref={containerRef} className="space-y-6" style={{ opacity: 0 }}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Weekly Review</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Reflect on your progress and plan ahead</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-md shadow-lg text-center bg-card dark:bg-gray-900 border-border dark:border-gray-700 transition-all duration-200 hover:dark:bg-gray-800 hover:shadow-xl">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex justify-center mb-2">
              <CalendarRange className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {weeklyStats.completedDays}/7
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <span className="sm:hidden">Days</span>
              <span className="hidden sm:inline">Days Completed</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-md shadow-lg text-center bg-card dark:bg-gray-900 border-border dark:border-gray-700 transition-all duration-200 hover:dark:bg-gray-800 hover:shadow-xl">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {weeklyStats.completionRate.toFixed(0)}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <span className="sm:hidden">Rate</span>
              <span className="hidden sm:inline">Habit Completion</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-md shadow-lg text-center bg-card dark:bg-gray-900 border-border dark:border-gray-700 transition-all duration-200 hover:dark:bg-gray-800 hover:shadow-xl">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex justify-center mb-2">
              <Star className="h-7 w-7 text-purple-600 dark:text-purple-400 fill-purple-600/20 dark:fill-purple-400/20" />
            </div>
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
        <Card className="rounded-md shadow-lg">
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

        <Card className="rounded-md shadow-lg">
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

      {/* AI Insights Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span>AI Weekly Insights</span>
          </CardTitle>
          {aiInsights && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInsights}
              disabled={weeklyInsightsMutation.isPending || isGuestMode}
              className="flex items-center gap-2"
            >
              {weeklyInsightsMutation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Refresh Insights
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {aiInsights ? (
            <div className="space-y-4">
              {aiInsights.patterns && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Patterns</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">{aiInsights.patterns}</p>
                </div>
              )}
              {aiInsights.strengths && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Strengths</h4>
                  <p className="text-green-700 dark:text-green-300 text-sm">{aiInsights.strengths}</p>
                </div>
              )}
              {aiInsights.improvements && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Areas for Improvement</h4>
                  <p className="text-orange-700 dark:text-orange-300 text-sm">{aiInsights.improvements}</p>
                </div>
              )}
              {aiInsights.motivation && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Motivation</h4>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">{aiInsights.motivation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Button
                onClick={handleGenerateInsights}
                disabled={weeklyInsightsMutation.isPending || isGuestMode}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {weeklyInsightsMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating Insights...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate AI Insights
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reflection Questions */}
      <Card className="rounded-md shadow-lg">
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
            <Button
              onClick={handleSaveReview}
              disabled={createWeeklyReview.isPending || updateWeeklyReview.isPending}
              className="gradient-bg text-white px-6 py-3 rounded-md font-semibold shadow-lg hover:shadow-xl transform transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              {createWeeklyReview.isPending || updateWeeklyReview.isPending
                ? "Saving..."
                : "Save Review"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
