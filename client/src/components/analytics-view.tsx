import { useMemo, useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { useDailyEntries } from "@/hooks/use-daily-entries";
import { useCreateGoal, useDeleteGoal, useGoals } from "@/hooks/use-goals";
import { HabitHealthDashboard } from "@/components/habit-health-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, ArrowLeft, ArrowRight, LineChart, Plus, Target } from "lucide-react";
import { getMockHabits } from "@/lib/mockData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { habitTagConfig, type HabitTag } from "@/lib/habit-tags";
import { habitTagOptions, goalPeriodOptions } from "@shared/schema";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTimeZone } from "@/hooks/use-timezone";
import { getDateKeyForZone } from "@/lib/utils";

interface AnalyticsViewProps {
  isGuestMode?: boolean;
}

type RelapseSignal = {
  id: number;
  name: string;
  emoji: string;
  risk: number;
  recentRate: number;
  missStreak: number;
};

const getDayDifference = (newer: string, older: string) => {
  const newerDate = new Date(`${newer}T00:00:00Z`);
  const olderDate = new Date(`${older}T00:00:00Z`);
  if (Number.isNaN(newerDate.getTime()) || Number.isNaN(olderDate.getTime())) return 0;
  const diff = newerDate.getTime() - olderDate.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
};

export function AnalyticsView({ isGuestMode = false }: AnalyticsViewProps) {
  const timeZone = useTimeZone();
  const { data: habits, isLoading, error } = isGuestMode 
    ? { data: getMockHabits(), isLoading: false, error: null }
    : useHabits();
  const { data: goals = [], isLoading: goalsLoading } = isGuestMode
    ? { data: [], isLoading: false }
    : useGoals();
  const endDate = useMemo(() => getDateKeyForZone(new Date(), timeZone), [timeZone]);
  const startDate = useMemo(
    () => getDateKeyForZone(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), timeZone),
    [timeZone]
  );
  const { data: dailyEntries = [], isLoading: entriesLoading } = isGuestMode
    ? { data: [], isLoading: false }
    : useDailyEntries(startDate, endDate, timeZone);
  const createGoal = useCreateGoal();
  const deleteGoal = useDeleteGoal();
  const [goalTag, setGoalTag] = useState<HabitTag>("STR");
  const [goalPeriod, setGoalPeriod] = useState<(typeof goalPeriodOptions)[number]>("weekly");
  const [goalTarget, setGoalTarget] = useState("3");

  const habitsById = useMemo(() => {
    return new Map((habits || []).map((habit) => [habit.id, habit]));
  }, [habits]);

  const sortedEntries = useMemo(
    () => [...dailyEntries].sort((a, b) => a.date.localeCompare(b.date)),
    [dailyEntries]
  );

  const completionSeries = useMemo(() => {
    const habitCount = habits?.length || 0;
    if (habitCount === 0) return [];

    return sortedEntries.map((entry) => {
      const completions = entry.habitCompletions as Record<string, boolean>;
      const completed = Object.values(completions || {}).filter(Boolean).length;
      return {
        date: entry.date,
        completionRate: (completed / habitCount) * 100,
      };
    });
  }, [habits, sortedEntries]);

  const trendVelocity = useMemo(() => {
    if (completionSeries.length < 4) return 0;

    const windowSize = Math.min(7, Math.floor(completionSeries.length / 2));
    if (windowSize < 2) return 0;

    const recentWindow = completionSeries.slice(-windowSize);
    const priorWindow = completionSeries.slice(-windowSize * 2, -windowSize);
    if (priorWindow.length === 0) return 0;

    const avg = (values: typeof completionSeries) =>
      values.reduce((sum, item) => sum + item.completionRate, 0) / values.length;

    const delta = avg(recentWindow) - avg(priorWindow);
    return Math.round(delta * 10) / 10;
  }, [completionSeries]);

  const relapseSignals = useMemo<RelapseSignal[]>(() => {
    if (!habits || habits.length === 0) return [];

    const recentWindow = sortedEntries.slice(-14);
    const fallbackWindowLength = Math.max(1, recentWindow.length);

    return habits
      .map((habit) => {
        const recentCompletions = recentWindow.reduce((sum, entry) => {
          const completions = entry.habitCompletions as Record<string, boolean>;
          return sum + (completions?.[habit.id.toString()] ? 1 : 0);
        }, 0);
        const recentRate = (recentCompletions / fallbackWindowLength) * 100;

        let lastCompletedDate = habit.lastCompleted || "";
        if (!lastCompletedDate) {
          for (let index = sortedEntries.length - 1; index >= 0; index -= 1) {
            const completions = sortedEntries[index].habitCompletions as Record<string, boolean>;
            if (completions?.[habit.id.toString()]) {
              lastCompletedDate = sortedEntries[index].date;
              break;
            }
          }
        }

        const missStreak = lastCompletedDate
          ? getDayDifference(endDate, lastCompletedDate)
          : Math.max(3, Math.min(14, fallbackWindowLength));
        const consistencyPenalty = Math.max(0, 100 - recentRate) * 0.55;
        const missPenalty = Math.min(40, missStreak * 10);
        const streakPenalty = (habit.streak || 0) >= 3 ? 0 : 10;
        const difficultyPenalty = (habit.difficultyRating || 3) >= 4 ? 8 : 0;
        const risk = Math.round(
          Math.max(0, Math.min(100, consistencyPenalty + missPenalty + streakPenalty + difficultyPenalty))
        );

        return {
          id: habit.id,
          name: habit.name,
          emoji: habit.emoji,
          risk,
          recentRate,
          missStreak,
        };
      })
      .sort((a, b) => b.risk - a.risk);
  }, [habits, sortedEntries, endDate]);

  const averageRelapseRisk = useMemo(() => {
    if (relapseSignals.length === 0) return 0;
    const totalRisk = relapseSignals.reduce((sum, signal) => sum + signal.risk, 0);
    return Math.round(totalRisk / relapseSignals.length);
  }, [relapseSignals]);

  const outlookScore = Math.max(0, Math.min(100, Math.round(averageRelapseRisk - trendVelocity * 0.8)));

  const tagDistribution = useMemo(() => {
    return habitTagOptions
      .map((tag) => ({
        tag,
        value: (habits || []).filter((habit) => habit.tags?.includes(tag)).length,
        color: habitTagConfig[tag as HabitTag].color,
      }))
      .filter((item) => item.value > 0);
  }, [habits]);

  const getGoalCount = (tag: HabitTag, period: (typeof goalPeriodOptions)[number]) => {
    const periodDays = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
    const rangeStartKey = getDateKeyForZone(
      new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000),
      timeZone
    );
    let count = 0;

    dailyEntries.forEach((entry) => {
      if (entry.date < rangeStartKey) return;
      const completions = entry.habitCompletions as Record<string, boolean>;
      Object.entries(completions || {}).forEach(([habitId, completed]) => {
        if (!completed) return;
        const habit = habitsById.get(Number(habitId));
        if (!habit || !habit.tags?.includes(tag)) return;
        count += 1;
      });
    });
    return count;
  };

  const handleCreateGoal = () => {
    const target = Math.max(1, Number(goalTarget) || 1);
    createGoal.mutate({ tag: goalTag, period: goalPeriod, targetCount: target });
    setGoalTarget("3");
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Unable to load habit data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || goalsLoading || entriesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Habit Health Analytics
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive overview of your habit performance and progress
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Relapse Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold text-foreground">{averageRelapseRisk}%</p>
            <p className="text-xs text-muted-foreground mt-1">Daily horizon across active habits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Trend Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">
                {trendVelocity > 0 ? "+" : ""}
                {trendVelocity}
              </p>
              {trendVelocity >= 0 ? (
                <ArrowRight className="h-5 w-5 text-emerald-600" />
              ) : (
                <ArrowLeft className="h-5 w-5 text-rose-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weekly horizon (percentage-point change)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Execution Outlook
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold text-foreground">{outlookScore}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {outlookScore < 40
                ? "Low risk this week"
                : outlookScore < 65
                  ? "Watchlist: tighten weak spots"
                  : "Intervention needed on high-risk habits"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">At-Risk Habits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {relapseSignals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete habits for a few days to unlock relapse signals.</p>
          ) : (
            relapseSignals.slice(0, 4).map((signal) => (
              <div key={signal.id} className="rounded-md border border-border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{signal.emoji}</span>
                    <span className="text-sm font-medium text-foreground truncate">{signal.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{signal.risk}% risk</span>
                </div>
                <Progress value={signal.risk} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{signal.missStreak}d since last completion</span>
                  <span>{Math.round(signal.recentRate)}% in last 14 days</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 items-stretch min-w-0">
        <Card className="min-w-0 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tag Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-end gap-2 flex-wrap">
              <div className="flex-1 min-w-[100px]">
                <div className="text-xs font-medium text-muted-foreground mb-1.5">Tag</div>
                <Select value={goalTag} onValueChange={(value) => setGoalTag(value as HabitTag)}>
                  <SelectTrigger data-testid="select-goal-tag">
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {habitTagOptions.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[100px]">
                <div className="text-xs font-medium text-muted-foreground mb-1.5">Period</div>
                <Select
                  value={goalPeriod}
                  onValueChange={(value) => setGoalPeriod(value as (typeof goalPeriodOptions)[number])}
                >
                  <SelectTrigger data-testid="select-goal-period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalPeriodOptions.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20">
                <div className="text-xs font-medium text-muted-foreground mb-1.5">Target</div>
                <Input
                  type="number"
                  min={1}
                  value={goalTarget}
                  onChange={(event) => setGoalTarget(event.target.value)}
                  data-testid="input-goal-target"
                />
              </div>
              <Button onClick={handleCreateGoal} disabled={createGoal.isPending} size="icon" data-testid="button-add-goal">
                <Plus />
              </Button>
            </div>

            <div className="space-y-3 flex-1">
              {goals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
                  <Target className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No goals yet</p>
                  <p className="text-xs text-muted-foreground/60">Set a tag, period, and target above</p>
                </div>
              )}
              {goals.map((goal) => {
                const count = getGoalCount(goal.tag as HabitTag, goal.period as (typeof goalPeriodOptions)[number]);
                const progress = Math.min(100, (count / Math.max(1, goal.targetCount)) * 100);
                const tagMeta = habitTagConfig[goal.tag as HabitTag];
                return (
                  <div key={goal.id} className="space-y-2 rounded-md border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md border text-xs font-mono ${tagMeta.className}`}>
                          {tagMeta.label}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {goal.period} goal
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGoal.mutate(goal.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{count} / {goal.targetCount} completions</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tag Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-w-0 overflow-auto settings-scroll">
            {tagDistribution.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Add tags to habits to see distribution.
              </div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tagDistribution}
                      dataKey="value"
                      nameKey="tag"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {tagDistribution.map((entry) => (
                        <Cell key={entry.tag} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap gap-3">
                  {tagDistribution.map((entry) => {
                    const meta = habitTagConfig[entry.tag as HabitTag];
                    return (
                      <div key={entry.tag} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-md border ${meta.className}`}>
                          {meta.label}
                        </span>
                        <span>{entry.value} habits</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <HabitHealthDashboard habits={habits || []} />
    </div>
  );
}
