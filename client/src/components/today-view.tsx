import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useHabits } from "@/hooks/use-habits";
import { useDailyEntry, useCreateDailyEntry, useUpdateDailyEntry } from "@/hooks/use-daily-entries";
import { useMotivationalMessage } from "@/hooks/use-ai";
import { getCurrentDateKey, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export function TodayView() {
  const { toast } = useToast();
  const today = getCurrentDateKey();
  
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: dailyEntry, isLoading: entryLoading } = useDailyEntry(today);
  const createDailyEntry = useCreateDailyEntry();
  const updateDailyEntry = useUpdateDailyEntry();
  const motivationMutation = useMotivationalMessage();

  const [habitCompletions, setHabitCompletions] = useState<Record<number, boolean>>({});
  const [punctualityScore, setPunctualityScore] = useState<number[]>([3]);
  const [adherenceScore, setAdherenceScore] = useState<number[]>([3]);
  const [notes, setNotes] = useState('');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [isDayCompleted, setIsDayCompleted] = useState(false);

  // Load existing data when dailyEntry changes
  useEffect(() => {
    if (dailyEntry) {
      setHabitCompletions(dailyEntry.habitCompletions as Record<number, boolean> || {});
      setPunctualityScore([dailyEntry.punctualityScore]);
      setAdherenceScore([dailyEntry.adherenceScore]);
      setNotes(dailyEntry.notes || '');
      setIsDayCompleted(dailyEntry.isCompleted || false);
    }
  }, [dailyEntry]);

  // Generate motivational message when habits change
  useEffect(() => {
    if (habits && Object.keys(habitCompletions).length > 0) {
      const completionRate = (Object.values(habitCompletions).filter(Boolean).length / habits.length) * 100;
      const currentStreak = 1; // Simple implementation, could be enhanced with streak tracking
      
      motivationMutation.mutate(
        { completionRate, currentStreak },
        {
          onSuccess: (data) => {
            setMotivationalMessage(data.message);
          },
        }
      );
    }
  }, [habitCompletions, habits]);

  // Calculate completion percentage score (1-5 scale)
  const calculateCompletionScore = (completions: Record<number, boolean>) => {
    if (!habits || habits.length === 0) return 3;
    const completedCount = Object.values(completions).filter(Boolean).length;
    const totalHabits = habits.length;
    const percentage = completedCount / totalHabits;
    
    // Convert percentage to 1-5 scale
    if (percentage === 1) return 5;
    if (percentage >= 0.8) return 4;
    if (percentage >= 0.6) return 3;
    if (percentage >= 0.4) return 2;
    return 1;
  };

  const handleHabitToggle = (habitId: number, checked: boolean) => {
    if (isDayCompleted) return; // Prevent changes if day is completed
    const newCompletions = { ...habitCompletions, [habitId]: checked };
    setHabitCompletions(newCompletions);
    
    // Auto-calculate scores based on completion
    const newScore = calculateCompletionScore(newCompletions);
    setPunctualityScore([newScore]);
    setAdherenceScore([newScore]);
    
    // Auto-save habit completion with calculated scores
    const entryData = {
      date: today,
      habitCompletions: newCompletions,
      punctualityScore: newScore,
      adherenceScore: newScore,
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
      isCompleted: true,
      completedAt: new Date(),
    };

    if (dailyEntry) {
      updateDailyEntry.mutate(
        { date: today, ...entryData },
        {
          onSuccess: () => {
            setIsDayCompleted(true);
            toast({
              title: "Day completed successfully!",
              description: "Your progress has been locked and saved.",
            });
          },
        }
      );
    } else {
      createDailyEntry.mutate(entryData, {
        onSuccess: () => {
          setIsDayCompleted(true);
          toast({
            title: "Day completed successfully!",
            description: "Your progress has been locked and saved.",
          });
        },
      });
    }
  };

  const handleScoreChange = (type: 'punctuality' | 'adherence', value: number[]) => {
    if (isDayCompleted) return; // Prevent changes if day is completed
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
        {habits && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-800">
                {Object.values(habitCompletions).filter(Boolean).length} / {habits.length} completed
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${habits.length > 0 ? (Object.values(habitCompletions).filter(Boolean).length / habits.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* AI Motivational Message */}
      {motivationalMessage && (
        <Card className="rounded-2xl shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">AI Coach Says:</h3>
                <p className="text-gray-700 italic">{motivationalMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  disabled={isDayCompleted}
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
        {/* Auto-Calculated Score */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="mr-2">🎯</span>
              Daily Performance Score
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Auto-calculated based on habit completion</p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-primary">{punctualityScore[0]}</span>
              <span className="text-lg text-gray-500 ml-2">/ 5</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>100% completion:</span>
                <span className="font-medium">5 points</span>
              </div>
              <div className="flex justify-between">
                <span>80-99% completion:</span>
                <span className="font-medium">4 points</span>
              </div>
              <div className="flex justify-between">
                <span>60-79% completion:</span>
                <span className="font-medium">3 points</span>
              </div>
              <div className="flex justify-between">
                <span>40-59% completion:</span>
                <span className="font-medium">2 points</span>
              </div>
              <div className="flex justify-between">
                <span>Below 40%:</span>
                <span className="font-medium">1 point</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Override (Optional) */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="mr-2">⚙️</span>
              Manual Adjustment
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Override if needed for special circumstances</p>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Slider
                value={adherenceScore}
                onValueChange={(value) => handleScoreChange('adherence', value)}
                max={5}
                min={1}
                step={1}
                disabled={isDayCompleted}
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
            disabled={isDayCompleted}
            className="w-full h-32 resize-none"
            placeholder="Add your thoughts, wins, or observations for today..."
          />
        </CardContent>
      </Card>

      {/* Complete Day Button */}
      <div className="text-center">
        {isDayCompleted ? (
          <Card className="rounded-2xl shadow-lg bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Day Completed!</h3>
                <p className="text-green-700">Your progress has been locked and saved successfully.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  disabled={createDailyEntry.isPending || updateDailyEntry.isPending}
                  className="gradient-bg text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  {createDailyEntry.isPending || updateDailyEntry.isPending
                    ? "Saving..."
                    : "Complete Day ✨"
                  }
                </Button>
              </motion.div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete Your Day?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to complete today? Once confirmed, you won't be able to make any changes to your habit tracking, scores, or notes for today.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCompleteDay}>
                  Yes, Complete Day
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </motion.div>
  );
}
