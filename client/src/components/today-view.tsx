import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabits } from "@/hooks/use-habits";
import { useDailyEntry, useCreateDailyEntry, useUpdateDailyEntry } from "@/hooks/use-daily-entries";
import { getCurrentDateKey, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function TodayView() {
  const { toast } = useToast();
  const today = getCurrentDateKey();
  
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: dailyEntry, isLoading: entryLoading } = useDailyEntry(today);
  const createDailyEntry = useCreateDailyEntry();
  const updateDailyEntry = useUpdateDailyEntry();

  const [habitCompletions, setHabitCompletions] = useState<Record<number, boolean>>({});
  const [punctualityScore, setPunctualityScore] = useState<number[]>([3]);
  const [adherenceScore, setAdherenceScore] = useState<number[]>([3]);
  const [notes, setNotes] = useState('');

  // Load existing data when dailyEntry changes
  useEffect(() => {
    if (dailyEntry) {
      setHabitCompletions(dailyEntry.habitCompletions as Record<number, boolean> || {});
      setPunctualityScore([dailyEntry.punctualityScore]);
      setAdherenceScore([dailyEntry.adherenceScore]);
      setNotes(dailyEntry.notes || '');
    }
  }, [dailyEntry]);

  const handleHabitToggle = (habitId: number, checked: boolean) => {
    const newCompletions = { ...habitCompletions, [habitId]: checked };
    setHabitCompletions(newCompletions);
    
    // Auto-save habit completion
    const entryData = {
      date: today,
      habitCompletions: newCompletions,
      punctualityScore: punctualityScore[0],
      adherenceScore: adherenceScore[0],
      notes,
    };

    if (dailyEntry) {
      updateDailyEntry.mutate({ date: today, ...entryData });
    } else {
      createDailyEntry.mutate(entryData);
    }
  };

  const handleCompleteDay = () => {
    const entryData = {
      date: today,
      habitCompletions,
      punctualityScore: punctualityScore[0],
      adherenceScore: adherenceScore[0],
      notes,
      completedAt: new Date(),
    };

    if (dailyEntry) {
      updateDailyEntry.mutate(
        { date: today, ...entryData },
        {
          onSuccess: () => {
            toast({
              title: "Day completed successfully! 🎉",
              description: "Your progress has been saved.",
            });
          },
        }
      );
    } else {
      createDailyEntry.mutate(entryData, {
        onSuccess: () => {
          toast({
            title: "Day completed successfully! 🎉",
            description: "Your progress has been saved.",
          });
        },
      });
    }
  };

  const handleScoreChange = (type: 'punctuality' | 'adherence', value: number[]) => {
    if (type === 'punctuality') {
      setPunctualityScore(value);
    } else {
      setAdherenceScore(value);
    }

    // Auto-save scores
    const entryData = {
      date: today,
      habitCompletions,
      punctualityScore: type === 'punctuality' ? value[0] : punctualityScore[0],
      adherenceScore: type === 'adherence' ? value[0] : adherenceScore[0],
      notes,
    };

    if (dailyEntry) {
      updateDailyEntry.mutate({ date: today, ...entryData });
    } else {
      createDailyEntry.mutate(entryData);
    }
  };

  if (habitsLoading || entryLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">✨ Today's Focus</h2>
        <p className="text-gray-600">{formatDate(today)}</p>
      </div>

      {/* Core Routines Checklist */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <span className="mr-2">✅</span>
            Core Routine Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habits?.map((habit) => (
              <motion.div
                key={habit.id}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Checkbox
                  id={`habit-${habit.id}`}
                  checked={habitCompletions[habit.id] || false}
                  onCheckedChange={(checked) => handleHabitToggle(habit.id, !!checked)}
                  className="w-6 h-6"
                />
                <label
                  htmlFor={`habit-${habit.id}`}
                  className={`flex-1 flex items-center space-x-3 cursor-pointer ${
                    habitCompletions[habit.id] ? 'line-through text-gray-500' : ''
                  }`}
                >
                  <span className="text-2xl">{habit.emoji}</span>
                  <span className="text-lg font-medium text-gray-800">{habit.name}</span>
                </label>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Punctuality Score */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="mr-2">⏰</span>
              Punctuality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Slider
                value={punctualityScore}
                onValueChange={(value) => handleScoreChange('punctuality', value)}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Poor (1)</span>
                <span>Perfect (5)</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">{punctualityScore[0]}</span>
            </div>
          </CardContent>
        </Card>

        {/* Task Adherence Score */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="mr-2">🎯</span>
              Task Adherence Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Slider
                value={adherenceScore}
                onValueChange={(value) => handleScoreChange('adherence', value)}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Poor (1)</span>
                <span>Perfect (5)</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-secondary">{adherenceScore[0]}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Notes */}
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="mr-2">📝</span>
            Daily Log & Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 resize-none"
            placeholder="Add your thoughts, wins, or observations for today..."
          />
        </CardContent>
      </Card>

      {/* Complete Day Button */}
      <div className="text-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleCompleteDay}
            disabled={createDailyEntry.isPending || updateDailyEntry.isPending}
            className="gradient-bg text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            {createDailyEntry.isPending || updateDailyEntry.isPending
              ? "Saving..."
              : "Complete Day ✨"
            }
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
