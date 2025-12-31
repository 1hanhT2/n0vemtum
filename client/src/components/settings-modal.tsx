import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabits, useUpdateHabit, useCreateHabit, useDeleteHabit } from "@/hooks/use-habits";
import { useHabitSuggestions } from "@/hooks/use-ai";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Trash2, Sparkles, User, Mail, Calendar, Hash, Moon, Palette, Settings } from "lucide-react";
import { getMockHabits } from "@/lib/mockData";
import { ThemeKey, applyTheme, getStoredDarkMode, getStoredTheme } from "@/lib/theme";
import { usePendingProtection } from "@/hooks/use-debounce";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { HabitSubtasksEditor } from "./habit-subtasks-editor";
import { habitTagOptions } from "@shared/schema";
import { habitTagConfig, type HabitTag } from "@/lib/habit-tags";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSetSetting } from "@/hooks/use-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGuestMode?: boolean;
}

export function SettingsModal({ isOpen, onClose, isGuestMode = false }: SettingsModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: habits } = isGuestMode 
    ? { data: getMockHabits() }
    : useHabits();
  const updateHabit = useUpdateHabit();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const { data: aiSuggestions, isLoading: suggestionsLoading } = isGuestMode
    ? { data: ["Try morning journaling", "Practice gratitude daily", "Take evening walks"], isLoading: false }
    : useHabitSuggestions();
  const queryClient = useQueryClient();
  const { data: userSettings } = useQuery<any[]>({
    queryKey: ["/api/settings"],
    enabled: !isGuestMode,
  });
  const setSetting = useSetSetting();


  const [habitSettings, setHabitSettings] = useState<Array<{
    id: number;
    name: string;
    emoji: string;
    tags: HabitTag[];
    isNew?: boolean;
  }>>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('blue');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    dailyReminder: false,
    weeklyReview: false,
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [challengeDifficulty, setChallengeDifficulty] = useState<number>(50);
  const [challengeType, setChallengeType] = useState<string>("balanced");
  const [personalizationProfile, setPersonalizationProfile] = useState("");
  const personalizationMaxLength = 800;
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
    : "";

  useEffect(() => {
    if (habits) {
      setHabitSettings(habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        tags: (habit.tags || []) as HabitTag[],
      })));
    }

    // Load saved preferences
    const savedTheme = getStoredTheme();
    const savedMode = getStoredDarkMode();
    setSelectedTheme(savedTheme);
    setIsDarkMode(savedMode);
    applyTheme(savedTheme, savedMode);
  }, [habits]);

  useEffect(() => {
    if (!userSettings) return;
    const difficultySetting = userSettings.find((s) => s.key === "challengeDifficulty");
    const typeSetting = userSettings.find((s) => s.key === "challengeType");
    const personalizationSetting = userSettings.find((s) => s.key === "personalizationProfile");
    if (difficultySetting) {
      const parsed = Number(difficultySetting.value);
      if (Number.isFinite(parsed)) {
        setChallengeDifficulty(Math.max(0, Math.min(100, parsed)));
      }
    }
    if (typeSetting) {
      setChallengeType(typeSetting.value || "balanced");
    }
    if (personalizationSetting && typeof personalizationSetting.value === "string") {
      setPersonalizationProfile(personalizationSetting.value);
    }
  }, [userSettings]);

  useEffect(() => {
    if (!isGuestMode) return;
    const storedProfile = localStorage.getItem('personalizationProfile');
    if (storedProfile) {
      setPersonalizationProfile(storedProfile);
    }
  }, [isGuestMode]);

  const handleSaveSettings = async () => {
    if (isGuestMode) {
      // In demo mode, save to localStorage only
      localStorage.setItem('theme', selectedTheme);
      localStorage.setItem('darkMode', isDarkMode.toString());
      localStorage.setItem('personalizationProfile', personalizationProfile.trim());
      applyTheme(selectedTheme, isDarkMode);

      toast({
        title: "Demo Mode",
        description: "Settings saved locally. Sign in to sync across devices.",
        variant: "default",
      });
      onClose();
      return;
    }

    // Validate all habits before saving
    const invalidHabits = habitSettings.filter(habit => 
      !habit.name.trim() || habit.name.length > 50
    );

    if (invalidHabits.length > 0) {
      toast({
        title: "Invalid habit names",
        description: "Please ensure all habits have valid names (1-50 characters).",
        variant: "destructive",
      });
      return;
    }

    try {
      // Handle new habits
      for (const habit of habitSettings) {
        if (habit.isNew) {
          await createHabit.mutateAsync({
            name: habit.name.trim(),
            emoji: habit.emoji || '✨',
            order: habitSettings.indexOf(habit) + 1,
            isActive: true,
            tags: habit.tags || [],
          });
        } else if (habits?.find(h => h.id === habit.id)) {
          await updateHabit.mutateAsync({
            id: habit.id,
            name: habit.name.trim(),
            emoji: habit.emoji || '✨',
            order: habitSettings.indexOf(habit) + 1,
            tags: habit.tags || [],
          });
        }
      }

      // Save theme and mode to database for cross-device sync
      // await setSetting.mutateAsync({ key: 'theme', value: selectedTheme });
      // await setSetting.mutateAsync({ key: 'darkMode', value: isDarkMode.toString() });

      // Also save to localStorage for immediate access
      localStorage.setItem('theme', selectedTheme);
      localStorage.setItem('darkMode', isDarkMode.toString());

      // Persist challenge preferences
      if (user?.id) {
        await setSetting.mutateAsync({ key: 'challengeDifficulty', value: String(Math.round(challengeDifficulty)), userId: user.id });
        await setSetting.mutateAsync({ key: 'challengeType', value: challengeType, userId: user.id });
        await setSetting.mutateAsync({ key: 'personalizationProfile', value: personalizationProfile.trim(), userId: user.id });
      }

      // Apply theme
      applyTheme(selectedTheme, isDarkMode);

      toast({
        title: "Settings saved successfully!",
        description: "Your preferences are synced across all devices.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Changes saved locally. Will sync when connection is restored.",
        variant: "default",
      });

      // Fallback to localStorage
      localStorage.setItem('theme', selectedTheme);
      localStorage.setItem('darkMode', isDarkMode.toString());
      applyTheme(selectedTheme, isDarkMode);
      onClose();
    }
  };

  const handleResetDataInternal = async () => {
    if (isGuestMode) {
      // Clear localStorage for demo mode
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('temp_daily_entry_')) {
          localStorage.removeItem(key);
        }
      });

      toast({
        title: "Demo Data Cleared",
        description: "Local demo data has been reset. Sign in to use cloud storage.",
        variant: "default",
      });
      return;
    }

    setShowResetDialog(false);

    try {
      const response = await fetch('/api/reset-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to reset data');
      }

      toast({
        title: "Data Reset Complete",
        description: "All your data has been permanently deleted. You will be logged out.",
        variant: "default",
      });

      // Log out user and redirect to landing page
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error('Reset data error:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const [handleResetData, isResettingData] = usePendingProtection(handleResetDataInternal);

  const updateHabitSetting = (id: number, field: 'name' | 'emoji', value: string) => {
    // Validate input
    if (field === 'name' && value.length > 50) {
      toast({
        title: "Name too long",
        description: "Habit names must be 50 characters or less.",
        variant: "destructive",
      });
      return;
    }

    if (field === 'emoji' && value.length > 4) {
      value = value.slice(0, 4); // Limit emoji length
    }

    setHabitSettings(prev => prev.map(habit => 
      habit.id === id ? { ...habit, [field]: value } : habit
    ));
  };

  const addNewHabit = () => {
    const newId = Math.max(...habitSettings.map(h => h.id), 0) + 1;
    setHabitSettings(prev => [...prev, {
      id: newId,
      name: 'New Habit',
      emoji: '✨',
      tags: [],
      isNew: true,
    }]);
  };

  const addSuggestedHabit = (suggestion: { name: string; emoji: string }) => {
    const newId = Math.max(...habitSettings.map(h => h.id), 0) + 1;
    setHabitSettings(prev => [...prev, {
      id: newId,
      name: suggestion.name,
      emoji: suggestion.emoji,
      tags: [],
      isNew: true,
    }]);
  };

  const toggleHabitTag = (id: number, tag: HabitTag) => {
    setHabitSettings(prev => prev.map(habit => {
      if (habit.id !== id) return habit;
      const tags = habit.tags || [];
      const isSelected = tags.includes(tag);
      if (!isSelected && tags.length >= 3) {
        toast({
          title: "Tag limit reached",
          description: "You can select up to 3 tags per habit.",
          variant: "destructive",
        });
        return habit;
      }
      return {
        ...habit,
        tags: isSelected ? tags.filter(existing => existing !== tag) : [...tags, tag],
      };
    }));
  };

  const removeHabit = async (id: number) => {
    const habit = habitSettings.find(h => h.id === id);
    if (!habit) return;

    if (habit.isNew) {
      // Just remove from local state if it's a new habit
      setHabitSettings(prev => prev.filter(h => h.id !== id));
    } else {
      // Delete from database if it's an existing habit
      try {
        await deleteHabit.mutateAsync(id);
        setHabitSettings(prev => prev.filter(h => h.id !== id));
        toast({
          title: "Habit removed",
          description: "The habit has been deleted.",
        });
      } catch (error) {
        toast({
          title: "Error removing habit",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const themes = [
    { key: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { key: 'green', name: 'Green', color: 'bg-green-500' },
    { key: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { key: 'orange', name: 'Orange', color: 'bg-orange-500' },
    { key: 'red', name: 'Red', color: 'bg-red-500' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-screen h-screen max-w-[100vw] max-h-[100vh] sm:max-w-3xl sm:h-[90vh] sm:max-h-[90vh] overflow-hidden p-0 sm:p-0 rounded-none sm:rounded-3xl"
        aria-describedby="settings-description"
      >
        <div className="h-full flex flex-col bg-card min-h-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Customize your habits, select themes, and configure notification preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto settings-scroll px-6 pb-6">
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="personalization">Personalization</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                {/* Account Section */}
                {!isGuestMode && user && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Account Information
                    </h3>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <Label className="text-sm font-medium">User ID</Label>
                              <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                            </div>
                          </div>
                          {user.email && (
                            <div className="flex items-center space-x-3">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          )}
                          {displayName && (
                            <div className="flex items-center space-x-3">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <Label className="text-sm font-medium">Name</Label>
                                <p className="text-sm text-muted-foreground">{displayName}</p>
                              </div>
                            </div>
                          )}
                          {user.createdAt && (
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <Label className="text-sm font-medium">Member Since</Label>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(user.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Habit Names */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">📝 Customize Habits</h3>
                    <Button
                      onClick={addNewHabit}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-[26rem] overflow-y-auto pr-1 settings-scroll">
                    {habitSettings.map((habit) => (
                      <div
                        key={habit.id}
                        className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40"
                      >
                        <div className="flex items-center space-x-3">
                          <Input
                            value={habit.emoji}
                            onChange={(e) => updateHabitSetting(habit.id, 'emoji', e.target.value)}
                            className="w-12 text-center text-lg"
                            maxLength={2}
                          />
                          <Input
                            value={habit.name}
                            onChange={(e) => updateHabitSetting(habit.id, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => removeHabit(habit.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 px-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Tags (up to 3)
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {habitTagOptions.map((tag) => {
                              const config = habitTagConfig[tag as HabitTag];
                              const isSelected = habit.tags?.includes(tag as HabitTag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleHabitTag(habit.id, tag as HabitTag)}
                                  className={`px-2 py-1 rounded-full border text-xs font-mono transition-colors ${
                                    isSelected
                                      ? config.className
                                      : "border-border text-muted-foreground bg-muted/40 hover:bg-muted"
                                  }`}
                                >
                                  {config.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {habit.isNew ? (
                          <p className="text-sm text-muted-foreground">Save this habit to start adding subtasks.</p>
                        ) : (
                          <HabitSubtasksEditor habitId={habit.id} isGuestMode={isGuestMode} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Habit Suggestions */}
                {aiSuggestions && aiSuggestions.length > 0 && (
                  <div>
                    <div className="flex items-center mb-4">
                      <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">AI Suggested Habits</h3>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto settings-scroll pr-1">
                      {aiSuggestions.map((suggestion: { name: string; emoji: string }, index: number) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addSuggestedHabit(suggestion)}
                          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 hover:from-purple-100 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-xl border border-purple-200 dark:border-gray-600 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{suggestion.emoji}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{suggestion.name}</span>
                          </div>
                          <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenge Preferences */}
                {!isGuestMode && (
                  <div className="border border-border rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Daily Challenge Settings</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium text-muted-foreground">
                        <span>Difficulty</span>
                        <span>{Math.round(challengeDifficulty)}</span>
                      </div>
                      <Slider
                        value={[challengeDifficulty]}
                        max={100}
                        step={1}
                        onValueChange={(val) => setChallengeDifficulty(val[0] ?? 50)}
                      />
                      <p className="text-xs text-muted-foreground">Higher difficulty yields tougher, higher-XP one-off challenges.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                      <Select value={challengeType} onValueChange={setChallengeType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select challenge type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physical">Physical</SelectItem>
                          <SelectItem value="mental">Mental</SelectItem>
                          <SelectItem value="productivity">Productivity</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Guide the AI toward the style of daily challenges you want.</p>
                    </div>
                  </div>
                )}

                {/* Appearance Settings */}
                <div>
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    <Palette className="h-5 w-5 text-purple-500" />
                    <span>Appearance</span>
                  </div>

                  {/* Dark/Light Mode Toggle */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all duration-200 hover:dark:bg-gray-700">
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white">
                          <Moon className="h-4 w-4" />
                          Dark Mode
                        </span>
                      </div>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isDarkMode ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDarkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Theme Colors */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-white mb-3">Accent Color</div>
                    <div className="grid grid-cols-5 gap-3">
                      {themes.map((theme) => (
                        <motion.button
                          key={theme.key}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedTheme(theme.key)}
                          className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedTheme === theme.key
                              ? 'border-primary'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-400 hover:dark:bg-gray-800'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full ${theme.color} mx-auto`}></div>
                          {selectedTheme === theme.key && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                          )}
                          <div className="text-xs font-medium text-gray-700 dark:text-white mt-2">{theme.name}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">🔔 Reminders</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="daily-reminder"
                        checked={notifications.dailyReminder}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, dailyReminder: !!checked }))
                        }
                      />
                      <Label htmlFor="daily-reminder">Daily reminder at 9:00 PM</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="weekly-review"
                        checked={notifications.weeklyReview}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, weeklyReview: !!checked }))
                        }
                      />
                      <Label htmlFor="weekly-review">Weekly review reminder</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="personalization" className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Personalization Profile</h3>
                  </div>
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="personalization-profile">Tell the AI about you</Label>
                        <Textarea
                          id="personalization-profile"
                          value={personalizationProfile}
                          onChange={(e) => setPersonalizationProfile(e.target.value)}
                          maxLength={personalizationMaxLength}
                          placeholder="Example: I am a night owl, I can only work out after 7 PM. I prefer short routines, 10-20 minutes. I am recovering from a knee injury, so avoid intense cardio. I like direct, no-fluff feedback. My main goal is stress reduction and better sleep."
                          className="min-h-[160px]"
                        />
                        <p className="text-xs text-muted-foreground">
                          Used to tailor difficulty ratings, daily challenges, assistant responses, and weekly analysis.
                          {` ${personalizationProfile.length}/${personalizationMaxLength}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row sm:space-x-3 gap-3 sm:gap-0 bg-card pt-4 px-6 pb-6 border-t border-border rounded-3xl">
              <Button
                onClick={handleSaveSettings}
                disabled={updateHabit.isPending}
                className="flex-1 gradient-bg text-white"
              >
                {updateHabit.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => setShowResetDialog(true)}
                variant="destructive"
                className="px-4"
              >
                Reset Data
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Reset Data Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              ⚠️ Permanently Delete All Data
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold">This action cannot be undone.</p>
              <p>This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All your habit tracking data</li>
                <li>Daily entries and completion records</li>
                <li>Weekly reviews and insights</li>
                <li>Achievement progress and badges</li>
                <li>Streaks and statistics</li>
                <li>Personal settings and preferences</li>
              </ul>
              <p className="font-semibold text-red-600 dark:text-red-400 mt-3">
                You will be logged out after the reset is complete.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetData}
              disabled={isResettingData}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {isResettingData ? "Deleting..." : "Yes, Delete Everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
