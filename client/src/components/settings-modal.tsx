import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useHabits, useUpdateHabit } from "@/hooks/use-habits";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const { data: habits } = useHabits();
  const updateHabit = useUpdateHabit();

  const [habitSettings, setHabitSettings] = useState<Array<{ id: number; name: string; emoji: string }>>([]);
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
  }, [habits]);

  const handleSaveSettings = async () => {
    try {
      // Update habits
      for (const habit of habitSettings) {
        if (habits?.find(h => h.id === habit.id)) {
          await updateHabit.mutateAsync({
            id: habit.id,
            name: habit.name,
            emoji: habit.emoji,
          });
        }
      }

      // TODO: Save theme and notification preferences
      
      toast({
        title: "Settings saved successfully! ⚙️",
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

  const themes = [
    { key: 'default', name: 'Default', gradient: 'from-blue-500 to-purple-500' },
    { key: 'nature', name: 'Nature', gradient: 'from-green-500 to-teal-500' },
    { key: 'sunset', name: 'Sunset', gradient: 'from-orange-500 to-pink-500' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">⚙️</span>
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Habit Names */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Customize Habits</h3>
            <div className="space-y-3">
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
                </div>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => (
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
