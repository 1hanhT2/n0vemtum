import { useMemo, useState } from "react";
import { useHabits } from "@/hooks/use-habits";
import { useDailyEntries } from "@/hooks/use-daily-entries";
import { useCreateGoal, useDeleteGoal, useGoals } from "@/hooks/use-goals";
import { HabitHealthDashboard } from "@/components/habit-health-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, LineChart } from "lucide-react";
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

      <div className="grid gap-6 lg:grid-cols-2 items-stretch min-w-0">
        <Card className="min-w-0 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tag Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Tag</div>
                <Select value={goalTag} onValueChange={(value) => setGoalTag(value as HabitTag)}>
                  <SelectTrigger>
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
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Period</div>
                <Select
                  value={goalPeriod}
                  onValueChange={(value) => setGoalPeriod(value as (typeof goalPeriodOptions)[number])}
                >
                  <SelectTrigger>
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
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Target</div>
                <Input
                  type="number"
                  min={1}
                  value={goalTarget}
                  onChange={(event) => setGoalTarget(event.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateGoal} disabled={createGoal.isPending}>
                {createGoal.isPending ? "Saving..." : "Add Goal"}
              </Button>
            </div>

            <div className="space-y-4">
              {goals.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No goals yet. Add one to track tag progress.
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
