import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { getTodayKey, getYesterdayKey, formatDate } from "@/lib/utils";
import gsap from "gsap";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, CheckCircle2, Target, PartyPopper, Settings, Sun, FileText } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useStreak } from "@/hooks/use-streaks";
import { useLevelUpHabit, useUpdateHabitProgress } from "@/hooks/use-gamification";
import { ReanalyzeButton, AiAnalysisNote } from "@/components/habit-difficulty-display";
import { HabitStatsRow, HabitProgressBar, LevelUpButton } from "@/components/habit-progression";
import { GamificationSummary } from "@/components/gamification-summary";
import { LevelUpNotification } from "@/components/level-up-notification";
import { HabitHealthRadar } from "@/components/habit-health-radar";
import { TierPromotionNotification } from "@/components/tier-promotion-notification";
import { TierExplanation } from "@/components/tier-explanation";
import { getMockHabits, getMockDailyEntry, getMockStreak } from "@/lib/mockData";
import { useDebounce, usePendingProtection } from '@/hooks/use-debounce';
import { SubtaskManager } from "@/components/subtask-manager";
import { getHabitTagConfig } from "@/lib/habit-tags";
import { useTimeZone } from "@/hooks/use-timezone";

interface TodayViewProps {
  isGuestMode?: boolean;
}

export function TodayView({ isGuestMode = false }: TodayViewProps) {
  const { toast } = useToast();
  const timeZone = useTimeZone();
  const today = useMemo(() => getTodayKey(timeZone), [timeZone]);
  const previousDateKey = useMemo(() => getYesterdayKey(timeZone), [timeZone]);
  const autoCompleteStorageKey = useMemo(
    () => `autoCompleteRanFor:${previousDateKey}:${timeZone}`,
    [previousDateKey, timeZone]
  );
  const { user } = useAuth();

  const { data: habits, isLoading: habitsLoading, error: habitsError } = isGuestMode 
    ? { data: getMockHabits(), isLoading: false, error: null }
    : useHabits();

  const { data: dailyEntry, isLoading: entryLoading } = isGuestMode
    ? { data: getMockDailyEntry(today), isLoading: false }
    : useDailyEntry(today, { timeZone });
  const { data: previousEntry } = isGuestMode
    ? { data: null }
    : useDailyEntry(previousDateKey, { timeZone });
  const createDailyEntry = useCreateDailyEntry();
  const updateDailyEntry = useUpdateDailyEntry();

  // Use a ref to track the latest dailyEntry without causing re-renders
  const dailyEntryRef = useRef(dailyEntry);
  useEffect(() => {
    dailyEntryRef.current = dailyEntry;
  }, [dailyEntry]);
  const lastSavedPayloadRef = useRef<string | null>(null);
  const habitToggleTimers = useRef<Record<number, ReturnType<typeof setTimeout> | undefined>>({});
  const latestHabitToggleState = useRef<Record<number, boolean>>({});

  // Debounced save function to prevent excessive API calls - memoized to prevent recreating
  const debouncedSaveInternal = useCallback((entryData: any) => {
    const serialized = JSON.stringify({ date: today, ...entryData });
    if (lastSavedPayloadRef.current === serialized && !updateDailyEntry.isPending && !createDailyEntry.isPending) {
      return;
    }

    const existingEntry = dailyEntryRef.current;
    if (existingEntry) {
      console.log('Auto-save: Updating existing daily entry for', today, entryData);
      updateDailyEntry.mutate({ date: today, ...entryData }, {
        onSuccess: () => {
          console.log('Auto-save: Update successful');
          lastSavedPayloadRef.current = serialized;
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        },
        onError: (error) => {
          console.error('Auto-save: Update failed', error);
          setAutoSaveStatus('error');
          toast({
            title: "Auto-save Failed",
            description: "Could not save your changes. Please try again.",
            variant: "destructive",
          });
        }
      });
    } else {
      if (!user?.id) {
        console.error('Auto-save: Cannot create entry - user not authenticated');
        return;
      }
      console.log('Auto-save: Creating new daily entry for', today, 'user:', user.id, entryData);
      createDailyEntry.mutate({ userId: user.id, date: today, ...entryData }, {
        onSuccess: () => {
          console.log('Auto-save: Create successful');
          lastSavedPayloadRef.current = serialized;
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        },
        onError: (error) => {
          console.error('Auto-save: Create failed', error);
          setAutoSaveStatus('error');
          toast({
            title: "Auto-save Failed",
            description: "Could not save your changes. Please try again.",
            variant: "destructive",
          });
        }
      });
    }
  }, [today, updateDailyEntry, updateDailyEntry.isPending, createDailyEntry, createDailyEntry.isPending, toast, user]); // Dependencies that are stable

  const debouncedSave = useDebounce(debouncedSaveInternal, 1500);
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
  const [subtaskCompletions, setSubtaskCompletions] = useState<Record<number, boolean>>({});
  const [punctualityScore, setPunctualityScore] = useState<number[]>([3]);
  const [adherenceScore, setAdherenceScore] = useState<number[]>([3]);
  const [notes, setNotes] = useState('');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [isDayCompleted, setIsDayCompleted] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoCompleteRef = useRef(false);
  const autoFinalizeRef = useRef(false);
  const todayContainerRef = useRef<HTMLDivElement>(null);
  const habitListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!todayContainerRef.current) return;
    gsap.fromTo(
      todayContainerRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
    );
    return () => { gsap.killTweensOf(todayContainerRef.current); };
  }, []);

  useEffect(() => {
    if (!habitListRef.current || !habits?.length) return;
    const items = habitListRef.current.querySelectorAll("[data-habit-item]");
    if (items.length === 0) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, delay: 0.15, ease: "power2.out" }
    );
    return () => { gsap.killTweensOf(items); };
  }, [habits?.length]);

  const filterCompletionsToHabits = useCallback(
    (completions: Record<number, boolean> = {}) => {
      // If habits haven't loaded yet, keep the raw completions so we don't lose saved state
      if (!habits) return completions || {};
      if (habits.length === 0) return {};
      const habitIds = new Set(habits.map((h) => h.id));
      const filtered: Record<number, boolean> = {};
      Object.entries(completions || {}).forEach(([id, done]) => {
        const numericId = Number(id);
        if (habitIds.has(numericId)) {
          filtered[numericId] = !!done;
        }
      });
      return filtered;
    },
    [habits]
  );

  // Load existing data when dailyEntry changes
  useEffect(() => {
    if (dailyEntry) {
      const filteredCompletions = filterCompletionsToHabits(dailyEntry.habitCompletions as Record<number, boolean> || {});
      setHabitCompletions(filteredCompletions);
      setSubtaskCompletions(dailyEntry.subtaskCompletions as Record<number, boolean> || {});
      setPunctualityScore([dailyEntry.punctualityScore]);
      setAdherenceScore([dailyEntry.adherenceScore]);
      setNotes(dailyEntry.notes || '');
      setIsDayCompleted(dailyEntry.isCompleted || false);
    } else {
      // Reset state if no daily entry exists
      setIsDayCompleted(false);
    }
  }, [dailyEntry]);

  useEffect(() => {
    if (dailyEntry) {
      lastSavedPayloadRef.current = JSON.stringify({
        date: dailyEntry.date,
        habitCompletions: dailyEntry.habitCompletions,
        subtaskCompletions: dailyEntry.subtaskCompletions,
        punctualityScore: dailyEntry.punctualityScore,
        adherenceScore: dailyEntry.adherenceScore,
        notes: dailyEntry.notes || '',
        isCompleted: dailyEntry.isCompleted,
      });
    } else {
      lastSavedPayloadRef.current = null;
    }
  }, [dailyEntry]);

  useEffect(() => {
    if (isGuestMode || !previousEntry || previousEntry.isCompleted) return;

    const notesPresent = previousEntry.notes && previousEntry.notes.trim().length > 0;
    const habitCompletionsData = (previousEntry.habitCompletions as Record<string, boolean>) || {};
    const subtaskCompletionsData = (previousEntry.subtaskCompletions as Record<string, boolean>) || {};
    const hasCompletions = Object.values(habitCompletionsData).some(Boolean);
    const hasSubtasks = Object.values(subtaskCompletionsData).some(Boolean);

    if (!notesPresent && !hasCompletions && !hasSubtasks) {
      return;
    }

    // Only run once per local day to avoid extra writes
    const alreadyRan = typeof window !== 'undefined'
      ? window.localStorage.getItem(autoCompleteStorageKey) === 'true'
      : false;
    if (alreadyRan) return;

    if (autoFinalizeRef.current) return;
    autoFinalizeRef.current = true;

    updateDailyEntry.mutate(
      { date: previousDateKey, isCompleted: true },
      {
        onError: () => {
          autoFinalizeRef.current = false;
        },
        onSuccess: () => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(autoCompleteStorageKey, 'true');
          }
          queryClient.invalidateQueries({ queryKey: ['/api/daily-entries'] });
        },
      }
    );
  }, [autoCompleteStorageKey, isGuestMode, previousEntry, previousDateKey, updateDailyEntry]);

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
        headers: { "x-timezone": timeZone },
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
  const saveTemporaryCompletions = (completions: Record<number, boolean>, subtasks?: Record<number, boolean>, punctuality?: number, adherence?: number, dailyNotes?: string) => {
    try {
      const tempData = {
        date: today,
        habitCompletions: completions,
        subtaskCompletions: subtasks ?? subtaskCompletions,
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
        const filteredCompletions = filterCompletionsToHabits(parsed.habitCompletions || {});
        setHabitCompletions(filteredCompletions);
        setSubtaskCompletions(parsed.subtaskCompletions || {});
        setPunctualityScore([parsed.punctualityScore || 3]);
        setAdherenceScore([parsed.adherenceScore || 3]);
        setNotes(parsed.notes || '');
      } catch (error) {
        console.error('Error loading temporary data:', error);
        // Clear corrupted data
        localStorage.removeItem(`temp_daily_entry_${today}`);
      }
    }
  }, [today, dailyEntry, filterCompletionsToHabits]);

  // Whenever habits change (e.g., after reset), drop completions that no longer map to existing habits
  useEffect(() => {
    if (!habits) return;
    setHabitCompletions((prev) => filterCompletionsToHabits(prev));
  }, [habits, filterCompletionsToHabits]);

  const scheduleHabitProgressUpdate = useCallback((habitId: number, completed: boolean) => {
    latestHabitToggleState.current[habitId] = completed;

    const existingTimer = habitToggleTimers.current[habitId];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    habitToggleTimers.current[habitId] = setTimeout(() => {
      if (updateHabitProgress.isPending) {
        habitToggleTimers.current[habitId] = setTimeout(() => {
          const latest = latestHabitToggleState.current[habitId];
          if (typeof latest === 'boolean') {
            scheduleHabitProgressUpdate(habitId, latest);
          }
        }, 150);
        return;
      }

      updateHabitProgress.mutate(
        { habitId, completed, date: today },
        {
          onSettled: () => {
            habitToggleTimers.current[habitId] = undefined;
          },
        }
      );
    }, 250);
  }, [today, updateHabitProgress]);

  const handleSubtaskToggle = (subtaskId: number, checked: boolean, habitId: number, totalSubtasks: number, completedSubtasks: number) => {
    if (isDayCompleted) return;
    const previousHabitCompletion = habitCompletions[habitId] || false;
    const newSubtaskCompletions = { ...subtaskCompletions, [subtaskId]: checked };
    setSubtaskCompletions(newSubtaskCompletions);

    // Auto-update habit completion based on subtask percentage
    const newCompletedCount = checked ? completedSubtasks + 1 : completedSubtasks - 1;
    const completionPercentage = newCompletedCount / totalSubtasks;
    const isHabitComplete = completionPercentage === 1; // 100% completion required
    
    const newHabitCompletions = { ...habitCompletions, [habitId]: isHabitComplete };
    setHabitCompletions(newHabitCompletions);

    if (!isGuestMode && previousHabitCompletion !== isHabitComplete) {
      scheduleHabitProgressUpdate(habitId, isHabitComplete);
    }

    // Recalculate scores based on new habit completion
    const newScore = calculateCompletionScore(newHabitCompletions);
    setPunctualityScore([newScore]);
    setAdherenceScore([newScore]);

    if (!isGuestMode) {
      saveTemporaryCompletions(newHabitCompletions, newSubtaskCompletions, newScore, newScore);
      
      setAutoSaveStatus('saving');
      debouncedSave({
        habitCompletions: newHabitCompletions,
        subtaskCompletions: newSubtaskCompletions,
        punctualityScore: newScore,
        adherenceScore: newScore,
        notes,
      });
    }
  };

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

    scheduleHabitProgressUpdate(habitId, checked);

    // Auto-calculate scores based on completion
    const newScore = calculateCompletionScore(newCompletions);
    setPunctualityScore([newScore]);
    setAdherenceScore([newScore]);

    // Save temporary data to localStorage (no database write until "finish day")
    saveTemporaryCompletions(newCompletions, subtaskCompletions, newScore, newScore);

    // Trigger auto-save
    setAutoSaveStatus('saving');
    debouncedSave({
      habitCompletions: newCompletions,
      subtaskCompletions,
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
      // Create or update daily entry
      const entryData = {
        date: today,
        habitCompletions,
        subtaskCompletions,
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

  useEffect(() => {
    if (isGuestMode || isDayCompleted) return;

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const delay = nextMidnight.getTime() - now.getTime();
    if (delay <= 0) return;

    const timeout = setTimeout(() => {
      const hasActivity =
        Object.values(habitCompletions).some(Boolean) ||
        Object.values(subtaskCompletions).some(Boolean) ||
        notes.trim().length > 0;

      if (hasActivity && !isDayCompleted) {
        Promise.resolve(handleCompleteDay()).catch(() => undefined);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [habitCompletions, subtaskCompletions, notes, isDayCompleted, isGuestMode, handleCompleteDay]);

  useEffect(() => {
    // Auto-completion when all habits are done is intentionally disabled to avoid surprise saves.
    autoCompleteRef.current = false;
  }, [habitCompletions, habits, isDayCompleted, isGuestMode]);

  const completedHabitsCount = useMemo(() => Object.values(habitCompletions).filter(Boolean).length, [habitCompletions]);
  const totalHabits = habits?.length ?? 0;
  const completionPercent = totalHabits > 0 ? Math.round((completedHabitsCount / totalHabits) * 100) : 0;
  const remainingHabits = totalHabits > 0 ? Math.max(0, totalHabits - completedHabitsCount) : 0;
  const progressBarWidth = totalHabits > 0 ? Math.min(100, (completedHabitsCount / totalHabits) * 100) : 0;

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
    saveTemporaryCompletions(habitCompletions, subtaskCompletions, newPunctuality[0], newAdherence[0]);

    if (isGuestMode) {
      toast({
        title: "Demo Mode",
        description: "Sign in to save your score changes",
        variant: "default",
      });
      return;
    }

    // Trigger auto-save
    setAutoSaveStatus('saving');
    debouncedSave({
      habitCompletions,
      subtaskCompletions,
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
    saveTemporaryCompletions(habitCompletions, subtaskCompletions, punctualityScore[0], adherenceScore[0], newNotes);
  };

  const handleNotesBlur = () => {
    if (isDayCompleted) return;
    if (isGuestMode) {
      toast({
        title: "Demo Mode",
        description: "Sign in to save your notes",
        variant: "default",
      });
      return;
    }
    setAutoSaveStatus('saving');
    // Only save when user stops typing (loses focus)
    debouncedSave({
      habitCompletions,
      subtaskCompletions,
      punctualityScore: punctualityScore[0],
      adherenceScore: adherenceScore[0],
      notes,
    });
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

  if (habitsError) {
    return (
      <Card className="border border-destructive/30 rounded-md bg-card text-card-foreground">
        <CardContent className="pt-6 space-y-3">
          <h3 className="text-base font-semibold text-foreground">Could not load habits</h3>
          <p className="text-sm text-muted-foreground">
            {habitsError instanceof Error
              ? habitsError.message
              : "The habits API returned an error. Please reload and try again."}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <div
        ref={todayContainerRef}
        className="space-y-6"
        style={{ opacity: 0 }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Today's Progress</h2>
          </div>
          <p className="text-muted-foreground">{formatDate(today)}</p>
        </div>

        <Card className="border border-border rounded-md bg-card text-card-foreground">
          <CardContent className="pt-6 space-y-2">
            <h3 className="text-base font-semibold text-foreground">No habits yet</h3>
            <p className="text-sm text-muted-foreground">
              Open <span className="font-medium text-foreground">Settings</span>, add a habit (or tap an AI suggestion),
              then press <span className="font-medium text-foreground">Save Changes</span>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={todayContainerRef}
      className="space-y-6"
      style={{ opacity: 0 }}
    >
      <div className="mb-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Today's Progress</h2>
          </div>
          <p className="text-muted-foreground">{formatDate(today)}</p>
        </div>

        <GamificationSummary habits={habits || []} />
        {habits && (
          <Card className="border border-border rounded-md bg-card text-card-foreground p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${autoSaveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' : autoSaveStatus === 'saved' ? 'bg-primary' : 'bg-muted-foreground/40'}`}></div>
                <span className="text-sm font-medium text-muted-foreground">
                  {autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'saved' ? 'Saved' : 'Today\'s Progress'}
                </span>
              </div>
              <span className="text-2xl font-bold text-foreground">
                {completedHabitsCount}/{totalHabits}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${progressBarWidth}%` 
                }}
              ></div>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-muted-foreground">
                {completionPercent}% Complete
              </span>
              <span className="text-muted-foreground">
                {remainingHabits} remaining
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* AI Motivational Message */}
      {motivationalMessage && (
        <Card className="border border-primary/20 rounded-md bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">AI Coach</h3>
                <p className="text-muted-foreground">{motivationalMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Core Routines Checklist */}
          <Card className="border border-border rounded-md bg-card text-card-foreground">
            <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            Today's Habits
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div ref={habitListRef} className="space-y-3">
            {habits?.map((habit) => {
              const difficultyHabit = {
                id: habit.id,
                name: habit.name,
                emoji: habit.emoji,
                difficultyRating: habit.difficultyRating || undefined,
                aiAnalysis: habit.aiAnalysis || undefined,
                lastAnalyzed: habit.lastAnalyzed ? habit.lastAnalyzed.toString() : undefined,
              };
              const hasGamification = habit.level !== undefined;

              return (
                <div
                  key={habit.id}
                  data-habit-item
                  className="p-4 rounded-md border border-border hover-elevate transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`habit-${habit.id}`}
                        data-testid={`checkbox-habit-${habit.id}`}
                        checked={habitCompletions[habit.id] || false}
                        onCheckedChange={(checked) => handleHabitToggle(habit.id, !!checked)}
                        disabled={isDayCompleted}
                        className="w-5 h-5 border-2 flex-shrink-0"
                      />
                      <label
                        htmlFor={`habit-${habit.id}`}
                        className={`cursor-pointer flex items-center gap-2 flex-wrap flex-1 min-w-0 ${
                          habitCompletions[habit.id] ? 'opacity-50' : ''
                        }`}
                      >
                          <span className={`text-base font-medium text-foreground transition-all ${
                            habitCompletions[habit.id] ? 'line-through text-muted-foreground' : ''
                          }`}>{habit.name}</span>
                          {habit.tags && habit.tags.length > 0 && habit.tags.map((tag) => {
                            const config = getHabitTagConfig(tag);
                            if (!config) return null;
                            return (
                              <span
                                key={`${habit.id}-${tag}`}
                                className={`px-1.5 py-0.5 rounded-md border text-xs font-mono ${config.className}`}
                              >
                                {config.label}
                              </span>
                            );
                          })}
                        </label>
                      <ReanalyzeButton
                        habitId={habit.id}
                        hasDifficulty={!!difficultyHabit.difficultyRating}
                        onAnalyze={handleAnalyzeHabit}
                        isAnalyzing={analyzingHabit === habit.id}
                      />
                    </div>

                    {hasGamification && (
                      <HabitStatsRow habit={habit} />
                    )}

                    {hasGamification && (
                      <HabitProgressBar habit={habit} />
                    )}

                    <AiAnalysisNote analysis={difficultyHabit.aiAnalysis} />

                    {hasGamification && (
                      <LevelUpButton
                        habit={habit}
                        onLevelUp={(habitId) => levelUpHabit.mutate(habitId)}
                      />
                    )}

                    <SubtaskManager
                      habitId={habit.id}
                      subtaskCompletions={subtaskCompletions}
                      onSubtaskToggle={handleSubtaskToggle}
                      isDayCompleted={isDayCompleted}
                      isGuestMode={isGuestMode}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Auto-Calculated Score */}
        <Card className="border border-border rounded-md bg-card text-card-foreground">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              Performance
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Auto-calculated score</p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <span className="text-2xl font-bold text-primary">{punctualityScore[0]}</span>
              <span className="text-lg text-muted-foreground ml-2">/ 5</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>100% completion:</span>
                <span className="font-medium text-foreground">5 points</span>
              </div>
              <div className="flex justify-between">
                <span>80-99% completion:</span>
                <span className="font-medium text-foreground">4 points</span>
              </div>
              <div className="flex justify-between">
                <span>60-79% completion:</span>
                <span className="font-medium text-foreground">3 points</span>
              </div>
              <div className="flex justify-between">
                <span>40-59% completion:</span>
                <span className="font-medium text-foreground">2 points</span>
              </div>
              <div className="flex justify-between">
                <span>Below 40%:</span>
                <span className="font-medium text-foreground">1 point</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Override (Optional) */}
        <Card className="rounded-md bg-card text-card-foreground border border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              Manual Adjustment
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
                disabled={isDayCompleted}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Poor (1)</span>
                <span>Perfect (5)</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold text-primary">{adherenceScore[0]}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Notes */}
      <Card className="rounded-md bg-card text-card-foreground border border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Daily Log & Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add your thoughts, wins, or observations for today..."
            disabled={isDayCompleted}
            className="min-h-[200px] resize-y border-border focus:border-primary focus:ring-primary"
          />
        </CardContent>
      </Card>

      {/* Complete Day Button */}
      <div className="text-center">
        {isDayCompleted ? (
          <Card className="rounded-md bg-card border border-green-600/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <PartyPopper className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Day Completed!</h3>
                <p className="text-green-700">Your progress has been saved and locked successfully.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div>
                <Button
                  size="lg"
                  disabled={createDailyEntry.isPending || updateDailyEntry.isPending || isCompletingDay}
                  className="px-8"
                >
                  {createDailyEntry.isPending || updateDailyEntry.isPending || isCompletingDay
                    ? "Saving..."
                    : (
                      <span className="inline-flex items-center gap-2">
                        Complete Day
                        <Sparkles className="h-5 w-5" />
                      </span>
                    )
                  }
                </Button>
              </div>
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
    </div>
  );
}
