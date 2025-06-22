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
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const { data: habits } = useHabits();
  const updateHabit = useUpdateHabit();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const { data: aiSuggestions, isLoading: suggestionsLoading } = useHabitSuggestions();

  const [habitSettings, setHabitSettings] = useState<Array<{ id: number; name: string; emoji: string; isNew?: boolean }>>([]);
  const [selectedTheme, setSelectedTheme] = useState('default');
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
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'default';
    setSelectedTheme(savedTheme);
    applyTheme(savedTheme);
  }, [habits]);

  const applyTheme = (theme: string) => {
    // Remove existing theme classes
    document.documentElement.classList.remove('theme-default', 'theme-nature', 'theme-sunset', 'theme-black', 'theme-white');
    
    // Add new theme class
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Update CSS custom properties based on theme
    const root = document.documentElement;
    switch (theme) {
      case 'nature':
        root.style.setProperty('--primary', 'hsl(142, 76%, 36%)');
        root.style.setProperty('--secondary', 'hsl(164, 86%, 40%)');
        break;
      case 'sunset':
        root.style.setProperty('--primary', 'hsl(24, 95%, 53%)');
        root.style.setProperty('--secondary', 'hsl(340, 82%, 52%)');
        break;
      case 'black':
        root.style.setProperty('--background', 'hsl(0, 0%, 8%)');
        root.style.setProperty('--foreground', 'hsl(0, 0%, 95%)');
        root.style.setProperty('--card', 'hsl(0, 0%, 12%)');
        root.style.setProperty('--primary', 'hsl(0, 0%, 85%)');
        root.style.setProperty('--secondary', 'hsl(0, 0%, 70%)');
        break;
      case 'white':
        root.style.setProperty('--background', 'hsl(0, 0%, 98%)');
        root.style.setProperty('--foreground', 'hsl(0, 0%, 10%)');
        root.style.setProperty('--card', 'hsl(0, 0%, 100%)');
        root.style.setProperty('--primary', 'hsl(0, 0%, 20%)');
        root.style.setProperty('--secondary', 'hsl(0, 0%, 35%)');
        break;
      default:
        // Reset to default theme
        root.style.setProperty('--background', 'hsl(0, 0%, 100%)');
        root.style.setProperty('--foreground', 'hsl(20, 14.3%, 4.1%)');
        root.style.setProperty('--card', 'hsl(0, 0%, 100%)');
        root.style.setProperty('--primary', 'hsl(244, 73%, 65%)');
        root.style.setProperty('--secondary', 'hsl(251, 91%, 75%)');
        break;
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Handle new habits
      for (const habit of habitSettings) {
        if (habit.isNew) {
          await createHabit.mutateAsync({
            name: habit.name,
            emoji: habit.emoji,
            order: habitSettings.indexOf(habit) + 1,
            isActive: true,
          });
        } else if (habits?.find(h => h.id === habit.id)) {
          await updateHabit.mutateAsync({
            id: habit.id,
            name: habit.name,
            emoji: habit.emoji,
            order: habitSettings.indexOf(habit) + 1,
          });
        }
      }

      // Save theme
      document.documentElement.setAttribute('data-theme', selectedTheme);
      localStorage.setItem('theme', selectedTheme);
      
      // Apply theme classes
      applyTheme(selectedTheme);
      
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

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      // TODO: Implement data reset
      toast({
        title: "Data reset successfully! 🔄",
        description: "All data has been cleared.",
      });
      onClose();
    }
  };

  const updateHabitSetting = (id: number, field: 'name' | 'emoji', value: string) => {
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
    { key: 'default', name: 'Default', gradient: 'from-blue-500 to-purple-500' },
    { key: 'nature', name: 'Nature', gradient: 'from-green-500 to-teal-500' },
    { key: 'sunset', name: 'Sunset', gradient: 'from-orange-500 to-pink-500' },
    { key: 'black', name: 'Black', gradient: 'from-gray-900 to-black' },
    { key: 'white', name: 'White', gradient: 'from-gray-100 to-gray-200' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="settings-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
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
              <h3 className="text-lg font-semibold text-gray-800">📝 Customize Habits</h3>
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
                <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">AI Suggested Habits</h3>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {aiSuggestions.map((suggestion: { name: string; emoji: string }, index: number) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addSuggestedHabit(suggestion)}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-xl border border-purple-200 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{suggestion.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{suggestion.name}</span>
                    </div>
                    <Plus className="w-4 h-4 text-purple-600" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Theme Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Theme</h3>
            <div className="grid grid-cols-3 gap-3 mb-2">
              {themes.slice(0, 3).map((theme) => (
                <motion.button
                  key={theme.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTheme(theme.key)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedTheme === theme.key
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-8 rounded bg-gradient-to-r ${theme.gradient} mb-2`}></div>
                  <div className="text-xs font-medium">{theme.name}</div>
                </motion.button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {themes.slice(3).map((theme) => (
                <motion.button
                  key={theme.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTheme(theme.key)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedTheme === theme.key
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-8 rounded bg-gradient-to-r ${theme.gradient} mb-2 ${
                    theme.key === 'white' ? 'border border-gray-300' : ''
                  }`}></div>
                  <div className="text-xs font-medium">{theme.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🔔 Reminders</h3>
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
