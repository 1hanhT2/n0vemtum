import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useHabits, useUpdateHabit, useCreateHabit, useDeleteHabit } from "@/hooks/use-habits";
import { useHabitSuggestions } from "@/hooks/use-ai";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Trash2, Sparkles } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGuestMode?: boolean;
}

export function SettingsModal({ isOpen, onClose, isGuestMode = false }: SettingsModalProps) {
  const { toast } = useToast();
  const { data: habits } = useHabits();
  const updateHabit = useUpdateHabit();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const { data: aiSuggestions, isLoading: suggestionsLoading } = useHabitSuggestions();

  const [habitSettings, setHabitSettings] = useState<Array<{ id: number; name: string; emoji: string; isNew?: boolean }>>([]);
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    dailyReminder: false,
    weeklyReview: false,
  });

  useEffect(() => {
    if (habits) {
      setHabitSettings(habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
      })));
    }
    
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') || 'blue';
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setSelectedTheme(savedTheme);
    setIsDarkMode(savedMode);
    applyTheme(savedTheme, savedMode);
  }, [habits]);

  const applyTheme = (theme: string, darkMode: boolean) => {
    const root = document.documentElement;
    
    // Apply dark/light mode
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Remove existing theme classes
    root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-red');
    
    // Add new theme class
    root.classList.add(`theme-${theme}`);
    
    // Smart contrast theme colors optimized for accessibility
    switch (theme) {
      case 'green':
        root.style.setProperty('--primary', darkMode ? 'hsl(134, 61%, 41%)' : 'hsl(134, 61%, 41%)');
        root.style.setProperty('--primary-foreground', darkMode ? 'hsl(0, 0%, 100%)' : 'hsl(0, 0%, 100%)');
        root.style.setProperty('--ring', darkMode ? 'hsl(134, 61%, 41%)' : 'hsl(134, 61%, 41%)');
        break;
      case 'purple':
        root.style.setProperty('--primary', darkMode ? 'hsl(263, 70%, 50%)' : 'hsl(263, 70%, 50%)');
        root.style.setProperty('--primary-foreground', 'hsl(0, 0%, 100%)');
        root.style.setProperty('--ring', darkMode ? 'hsl(263, 70%, 50%)' : 'hsl(263, 70%, 50%)');
        break;
      case 'orange':
        root.style.setProperty('--primary', darkMode ? 'hsl(25, 95%, 53%)' : 'hsl(25, 95%, 53%)');
        root.style.setProperty('--primary-foreground', 'hsl(0, 0%, 100%)');
        root.style.setProperty('--ring', darkMode ? 'hsl(25, 95%, 53%)' : 'hsl(25, 95%, 53%)');
        break;
      case 'red':
        root.style.setProperty('--primary', darkMode ? 'hsl(0, 72%, 51%)' : 'hsl(0, 84%, 60%)');
        root.style.setProperty('--primary-foreground', 'hsl(0, 0%, 100%)');
        root.style.setProperty('--ring', darkMode ? 'hsl(0, 72%, 51%)' : 'hsl(0, 84%, 60%)');
        break;
      default: // blue
        root.style.setProperty('--primary', darkMode ? 'hsl(217, 91%, 60%)' : 'hsl(221, 83%, 53%)');
        root.style.setProperty('--primary-foreground', 'hsl(0, 0%, 100%)');
        root.style.setProperty('--ring', darkMode ? 'hsl(217, 91%, 60%)' : 'hsl(221, 83%, 53%)');
        break;
    }
  };

  const handleSaveSettings = async () => {
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
          });
        } else if (habits?.find(h => h.id === habit.id)) {
          await updateHabit.mutateAsync({
            id: habit.id,
            name: habit.name.trim(),
            emoji: habit.emoji || '✨',
            order: habitSettings.indexOf(habit) + 1,
          });
        }
      }

      // Save theme and mode
      localStorage.setItem('theme', selectedTheme);
      localStorage.setItem('darkMode', isDarkMode.toString());
      
      // Apply theme
      applyTheme(selectedTheme, isDarkMode);
      
      toast({
        title: "Settings saved successfully!",
        description: "Your preferences have been updated.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      return;
    }
    
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
      
      // Force page reload to refresh all data
      window.location.reload();
      
    } catch (error) {
      console.error('Reset data error:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset data. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      isNew: true,
    }]);
  };

  const addSuggestedHabit = (suggestion: { name: string; emoji: string }) => {
    const newId = Math.max(...habitSettings.map(h => h.id), 0) + 1;
    setHabitSettings(prev => [...prev, {
      id: newId,
      name: suggestion.name,
      emoji: suggestion.emoji,
      isNew: true,
    }]);
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="settings-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">⚙️</span>
            Settings
          </DialogTitle>
        </DialogHeader>
        <div id="settings-description" className="sr-only">
          Customize your habits, select themes, and configure notification preferences.
        </div>

        <div className="space-y-6">
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
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {habitSettings.map((habit) => (
                <div key={habit.id} className="flex items-center space-x-3">
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
              <div className="space-y-2 max-h-32 overflow-y-auto">
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

          {/* Appearance Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">🎨 Appearance</h3>
            
            {/* Dark/Light Mode Toggle */}
            <div className="mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all duration-200 hover:dark:bg-gray-700">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-white">🌙 Dark Mode</span>
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

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleSaveSettings}
              disabled={updateHabit.isPending}
              className="flex-1 gradient-bg text-white"
            >
              {updateHabit.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={handleResetData}
              variant="destructive"
              className="px-4"
            >
              Reset Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
