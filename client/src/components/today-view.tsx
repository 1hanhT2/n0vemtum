import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
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
import { queryClient } from "@/lib/queryClient";
import { useStreak } from "@/hooks/use-streaks";
import { useLevelUpHabit, useUpdateHabitProgress } from "@/hooks/use-gamification";
import { HabitDifficultyDisplay } from "@/components/habit-difficulty-display";
import { HabitProgression } from "@/components/habit-progression";
import { GamificationSummary } from "@/components/gamification-summary";
import { LevelUpNotification } from "@/components/level-up-notification";
import { HabitHealthRadar } from "@/components/habit-health-radar";
import { TierPromotionNotification } from "@/components/tier-promotion-notification";
import { TierExplanation } from "@/components/tier-explanation";
import { RefreshCw } from "lucide-react";
import { getMockHabits, getMockDailyEntry, getMockStreak } from "@/lib/mockData";
import { useDebounce, usePendingProtection } from '@/hooks/use-debounce';

interface TodayViewProps {
  isGuestMode?: boolean;
}

export function TodayView({ isGuestMode = false }: TodayViewProps) {
  const { toast } = useToast();
  const today = getCurrentDateKey();

  const { data: habits, isLoading: habitsLoading, error: habitsError } = isGuestMode 
    ? { data: getMockHabits(), isLoading: false, error: null }
    : useHabits();

  const { data: dailyEntry, isLoading: entryLoading } = isGuestMode
    ? { data: getMockDailyEntry(today), isLoading: false }
    : useDailyEntry(today);
  const createDailyEntry = useCreateDailyEntry();
  const updateDailyEntry = useUpdateDailyEntry();

  // Debounced save function to prevent excessive API calls - memoized to prevent recreating
  const debouncedSaveInternal = useCallback((entryData: any, existingEntry: typeof dailyEntry) => {
    if (existingEntry) {
      updateDailyEntry.mutate({ date: today, ...entryData });
    } else {
      createDailyEntry.mutate(entryData);
    }
  }, [today, updateDailyEntry, createDailyEntry]); // Dependencies that are stable

  const debouncedSave = useDebounce(
    useCallback((entryData: any) => {
      debouncedSaveInternal(entryData, dailyEntry);
    }, [debouncedSaveInternal, dailyEntry]), 
    500
  );
  const { data: currentStreak } = isGuestMode
    ? { data: getMockStreak('daily_completion') }
    : useStreak('daily_completion');
  const [analyzingHabit, setAnalyzingHabit] = useState<number | null>(null);
  const motivationMutation = useMotivationalMessage();
  const levelUpHabit = useLevelUpHabit();
  const updateHabitProgress = useUpdateHabitProgress();
  const [levelUpHabitId, setLevelUpHabitId] = useState<number | null>(null);
  const [tierPromotion, setTierPromotion] = useState<{
    habitId: number;
    oldTier: string;
    newTier: string;
  } | null>(null);

  const [habitCompletions, setHabitCompletions] = useState<Record<number, boolean>>({});
  const [punctualityScore, setPunctualityScore] = useState<number[]>([3]);
  const [adherenceScore, setAdherenceScore] = useState<number[]>([3]);
  const [notes, setNotes] = useState('');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [isDayCompleted, setIsDayCompleted] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');


  // Load existing data when dailyEntry changes
  useEffect(() => {
    if (dailyEntry) {
      setHabitCompletions(dailyEntry.habitCompletions as Record<number, boolean> || {});
      setPunctualityScore([dailyEntry.punctualityScore]);
      setAdherenceScore([dailyEntry.adherenceScore]);
      setNotes(dailyEntry.notes || '');
      setIsDayCompleted(dailyEntry.isCompleted || false);
    } else {
      // Reset state if no daily entry exists
      setIsDayCompleted(false);
    }
  }, [dailyEntry]);

  // Generate motivational message when habits change
  useEffect(() => {
    if (habits && Object.keys(habitCompletions).length > 0) {
      const completionRate = (Object.values(habitCompletions).filter(Boolean).length / habits.length) * 100;
      const currentStreakValue = currentStreak?.currentStreak ?? 0;

      motivationMutation.mutate(
        { completionRate, currentStreak: currentStreakValue },
        {
          onSuccess: (data) => {
            setMotivationalMessage(data.message);
          },
        }
      );
    }
  }, [habitCompletions, habits]);

  const handleAnalyzeHabit = async (habitId: number) => {
    if (isGuestMode) {
      toast({
        title: "Demo Mode",
        description: "Sign in to analyze habits with AI",
        variant: "default",
      });
      return;
    }

    setAnalyzingHabit(habitId);
    try {
      const response = await fetch(`/api/ai/analyze-habit-difficulty/${habitId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
        toast({
          title: "Analysis Complete",
          description: "Habit difficulty has been analyzed by AI",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze habit difficulty",
        variant: "destructive",
      });
    } finally {
      setAnalyzingHabit(null);
    }
  };

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

  // Store temporary habit completions in localStorage
  const saveTemporaryCompletions = (completions: Record<number, boolean>, punctuality?: number, adherence?: number, dailyNotes?: string) => {
    try {
      const tempData = {
        date: today,
        habitCompletions: completions,
        punctualityScore: punctuality ?? punctualityScore[0],
        adherenceScore: adherence ?? adherenceScore[0],
        notes: dailyNotes ?? notes,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(`temp_daily_entry_${today}`, JSON.stringify(tempData));
    } catch (error) {
      console.error('Failed to save temporary data:', error);
      toast({
        title: "Storage Warning",
        description: "Unable to save temporary changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load temporary completions from localStorage on component mount
  useEffect(() => {
    const tempData = localStorage.getItem(`temp_daily_entry_${today}`);
    if (tempData && !dailyEntry) {
      try {
        const parsed = JSON.parse(tempData);
        setHabitCompletions(parsed.habitCompletions || {});
        setPunctualityScore([parsed.punctualityScore || 3]);
        setAdherenceScore([parsed.adherenceScore || 3]);
        setNotes(parsed.notes || '');
      } catch (error) {
        console.error('Error loading temporary data:', error);
        // Clear corrupted data
        localStorage.removeItem(`temp_daily_entry_${today}`);
      }
    }
  }, [today, dailyEntry]);

  const handleHabitToggle = (habitId: number, checked: boolean) => {
    if (isDayCompleted) return; // Prevent changes if day is completed
    const newCompletions = { ...habitCompletions, [habitId]: checked };
    setHabitCompletions(newCompletions);

    if (isGuestMode) {
      // In guest mode, just show visual feedback without API calls
      toast({
        title: checked ? "Habit Completed!" : "Habit Unchecked",
        description: checked ? "Great job! Sign in to save your progress." : "Progress not saved in demo mode.",
        variant: "default",
      });

      // Auto-calculate scores based on completion for guest mode
      const newScore = calculateCompletionScore(newCompletions);
      setPunctualityScore([newScore]);
      setAdherenceScore([newScore]);
      return;
    }

    // In real mode, habit progress will be updated when "finish day" is pressed
    // For now, just show user feedback that the change is pending
    toast({
      title: "Changes Saved Temporarily",
      description: "Click 'Finish Day' to finalize your progress",
      variant: "default",
    });

    // Auto-calculate scores based on completion
    const newScore = calculateCompletionScore(newCompletions);
    setPunctualityScore([newScore]);
    setAdherenceScore([newScore]);

    // Save temporary data to localStorage (no database write until "finish day")
    saveTemporaryCompletions(newCompletions, newScore, newScore);

    // Trigger auto-save
    setAutoSaveStatus('saving');
    debouncedSave({
      date: today,
      habitCompletions: newCompletions,
      punctualityScore: newScore,
      adherenceScore: newScore,
      notes,
    });

    setTimeout(() => {
      if (updateDailyEntry.isPending || createDailyEntry.isPending) {
        setAutoSaveStatus('saving');
      } else {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    }, 500);
  };

  const handleCompleteDayInternal = async () => {
    try {
      // Process habit completions sequentially to avoid race conditions
      const completedHabits = Object.entries(habitCompletions).filter(([_, completed]) => completed);

      for (const [habitId, completed] of completedHabits) {
        if (completed) {
          try {
            await updateHabitProgress.mutateAsync({
              habitId: parseInt(habitId),
              completed: true,
              date: today
            });
          } catch (error) {
            console.error(`Failed to update habit ${habitId}:`, error);
            // Continue processing other habits even if one fails
          }
        }
      }

      // Create or update daily entry
      const entryData = {
        date: today,
        habitCompletions,
        punctualityScore: punctualityScore[0],
        adherenceScore: adherenceScore[0],
        notes,
        isCompleted: true,
      };

      if (dailyEntry) {
        await updateDailyEntry.mutateAsync({ ...entryData });
      } else {
        await createDailyEntry.mutateAsync({ userId: 'current', ...entryData });
      }

      // Clear temporary storage
      localStorage.removeItem(`temp_daily_entry_${today}`);

      setIsDayCompleted(true);
      toast({
        title: "Day Completed!",
        description: "Your progress has been saved and locked for today.",
      });

      // Invalidate queries to refresh habit data
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/daily-entries'] });
    } catch (error) {
      console.error('Day completion error:', error);
      toast({
        title: "Error",
        description: `Failed to complete day: ${error instanceof Error ? error.message : 'Please try again'}`,
        variant: "destructive",
      });
    }
  };

  const [handleCompleteDay, isCompletingDay] = usePendingProtection(handleCompleteDayInternal);

  const handleScoreChange = (type: 'punctuality' | 'adherence', value: number[]) => {
    if (isDayCompleted) return; // Prevent changes if day is completed
    let newPunctuality = punctualityScore;
    let newAdherence = adherenceScore;

    if (type === 'punctuality') {
      newPunctuality = value;
      setPunctualityScore(value);
    } else {
      newAdherence = value;
      setAdherenceScore(value);
    }

    // Save to temporary storage with updated scores
    saveTemporaryCompletions(habitCompletions, newPunctuality[0], newAdherence[0]);

    // Trigger auto-save
    setAutoSaveStatus('saving');
    debouncedSave({
      date: today,
      habitCompletions,
      punctualityScore: newPunctuality[0],
      adherenceScore: newAdherence[0],
      notes,
    });

    setTimeout(() => {
      if (updateDailyEntry.isPending || createDailyEntry.isPending) {
        setAutoSaveStatus('saving');
      } else {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    }, 500);
  };

  const handleNotesChange = (newNotes: string) => {
    if (isDayCompleted) return;
    setNotes(newNotes);
    // Save to temporary storage with updated notes
    saveTemporaryCompletions(habitCompletions, punctualityScore[0], adherenceScore[0], newNotes);
  };

  const handleNotesBlur = () => {
    if (isDayCompleted) return;
    // Save to temporary storage when user leaves the notes field
    saveTemporaryCompletions(habitCompletions, punctualityScore[0], adherenceScore[0], notes);
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
      <div className="mb-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Today's Progress</h2>
          <p className="text-gray-600 dark:text-gray-400">{formatDate(today)}</p>
        </div>

        <GamificationSummary habits={habits || []} />
        {habits && (
          <Card className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${autoSaveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' : autoSaveStatus === 'saved' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'saved' ? 'Saved' : 'Today\'s Progress'}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.values(habitCompletions).filter(Boolean).length}/{habits.length}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${Math.min(100, habits.length > 0 ? (Object.values(habitCompletions).filter(Boolean).length / habits.length) * 100 : 0)}%` 
                }}
              ></div>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {Math.round((Object.values(habitCompletions).filter(Boolean).length / habits.length) * 100)}% Complete
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {habits.length - Object.values(habitCompletions).filter(Boolean).length} remaining
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* AI Motivational Message */}
      {motivationalMessage && (
        <Card className="border border-purple-200 dark:border-purple-800/30 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI Coach</h3>
                <p className="text-gray-600 dark:text-gray-300">{motivationalMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Core Routines Checklist */}
      <Card className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-base">✅</span>
            </div>
            Today's Habits
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {habits?.map((habit) => (
              <motion.div
                key={habit.id}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.01 }}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-all space-y-4 hover:shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <Checkbox
                    id={`habit-${habit.id}`}
                    checked={habitCompletions[habit.id] || false}
                    onCheckedChange={(checked) => handleHabitToggle(habit.id, !!checked)}
                    disabled={isDayCompleted}
                    className="w-5 h-5 border-2"
                  />
                  <label
                    htmlFor={`habit-${habit.id}`}
                    className={`flex-1 flex items-center space-x-3 cursor-pointer ${
                      habitCompletions[habit.id] ? 'opacity-60' : ''
                    }`}
                  >
                    <span className="text-xl">{habit.emoji}</span>
                    <span className={`text-base font-medium text-gray-900 dark:text-gray-100 transition-all ${
                      habitCompletions[habit.id] ? 'line-through' : ''
                    }`}>{habit.name}</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <HabitDifficultyDisplay
                    habit={{
                      id: habit.id,
                      name: habit.name,
                      emoji: habit.emoji,
                      difficultyRating: habit.difficultyRating || undefined,
                      aiAnalysis: habit.aiAnalysis || undefined,
                      lastAnalyzed: habit.lastAnalyzed ? habit.lastAnalyzed.toString() : undefined,
                    }}
                    onAnalyze={handleAnalyzeHabit}
                    isAnalyzing={analyzingHabit === habit.id}
                  />

                  {/* Only show progression if gamification data exists */}
                  {habit.level !== undefined && (
                    <HabitProgression
                      habit={habit}
                      onLevelUp={(habitId) => levelUpHabit.mutate(habitId)}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Auto-Calculated Score */}
        <Card className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-base">🎯</span>
              </div>
              Performance
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-10">Auto-calculated score</p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-primary">{punctualityScore[0]}</span>
              <span className="text-lg text-gray-500 ml-2">/ 5</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
        <Card className="rounded-2xl shadow-lg bg-card dark:bg-gray-800 border-border dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
              <span className="mr-2">⚙️</span>
              Manual Adjustment
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Override if needed for special circumstances</p>
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
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-300 mt-2">
                <span>Poor (1)</span>
                <span>Perfect (5)</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{adherenceScore[0]}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Notes */}
      <Card className="rounded-2xl shadow-lg bg-card dark:bg-gray-800 border-border dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <span className="mr-2">📝</span>
            Daily Log & Notes
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Supports markdown formatting: **bold**, *italic*, # headers, lists, and more
          </p>
        </CardHeader>
        <CardContent>
          <SimpleMDE
            value={notes}
            onChange={(value) => handleNotesChange(value)}
            options={{
              spellChecker: false,
              placeholder: "Add your thoughts, wins, or observations for today...\n\nTip: Use markdown formatting:\n- **bold text**\n- *italic text*\n- # Heading\n- - List item",
              status: false,
              toolbar: [
                "bold",
                "italic",
                "heading",
                "|",
                "unordered-list",
                "ordered-list",
                "|",
                "link",
                "quote",
                "|",
                "preview",
                "guide"
              ],
              minHeight: "200px",
              maxHeight: "400px",
              autoDownloadFontAwesome: false,
              hideIcons: isDayCompleted ? ["bold", "italic", "heading", "unordered-list", "ordered-list", "link", "quote"] : undefined,
              showIcons: isDayCompleted ? [] : undefined,
            }}
            className={isDayCompleted ? "pointer-events-none opacity-60" : ""}
          />
        </CardContent>
      </Card>

      {/* Complete Day Button */}
      <div className="text-center">
        {isDayCompleted ? (
          <Card className="rounded-2xl shadow-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Day Completed!</h3>
                <p className="text-green-700 dark:text-green-400">Your progress has been saved and locked successfully.</p>
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
                  disabled={createDailyEntry.isPending || updateDailyEntry.isPending || isCompletingDay}
                  className="gradient-bg text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  {createDailyEntry.isPending || updateDailyEntry.isPending || isCompletingDay
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

      {/* Level Up Notification */}
      {levelUpHabitId && habits && (
        <LevelUpNotification
          habit={habits.find(h => h.id === levelUpHabitId)!}
          onLevelUp={(habitId) => {
            levelUpHabit.mutate(habitId, {
              onSuccess: (updatedHabit) => {
                const oldHabit = habits.find(h => h.id === habitId);
                // Check for tier promotion after level up
                if (oldHabit && oldHabit.tier !== updatedHabit.tier) {
                  setTierPromotion({
                    habitId,
                    oldTier: oldHabit.tier,
                    newTier: updatedHabit.tier
                  });
                }
              }
            });
            setLevelUpHabitId(null);
          }}
          show={true}
          onClose={() => setLevelUpHabitId(null)}
        />
      )}

      {/* Tier Promotion Notification */}
      {tierPromotion && habits && (
        <TierPromotionNotification
          oldTier={tierPromotion.oldTier}
          newTier={tierPromotion.newTier}
          habit={habits.find(h => h.id === tierPromotion.habitId)!}
          show={true}
          onClose={() => setTierPromotion(null)}
        />
      )}
    </motion.div>
  );
}