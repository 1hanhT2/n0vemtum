import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useThrottle } from '@/hooks/use-debounce';
import { Flame } from "lucide-react";
import { resolveTierIcon } from "@/lib/badgeIcons";

interface Habit {
  id: number;
  name: string;
  emoji: string;
  level?: number;
  experience?: number;
  experienceToNext?: number;
  streak?: number;
  longestStreak?: number;
  completionRate?: number;
  totalCompletions?: number;
  tier?: string;
  badges?: string[];
  difficultyRating?: number;
}

interface HabitCardProps {
  habit: Habit;
  date: string;
  isCompleted?: boolean;
  onToggle?: (habitId: number, completed: boolean) => void;
}

const tierColors = {
  bronze: 'from-amber-600 to-amber-700',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-cyan-600',
  diamond: 'from-purple-400 to-purple-600',
};

export function HabitCard({ habit, date, isCompleted = false, onToggle }: HabitCardProps) {
  const [checked, setChecked] = useState(isCompleted);

  const handleToggleInternal = (value: boolean) => {
    setChecked(value);
    onToggle?.(habit.id, value);
  };

  const handleToggle = useThrottle(handleToggleInternal, 500);

  const experiencePercentage = habit.experience !== undefined && habit.experienceToNext
    ? Math.min(100, (habit.experience / habit.experienceToNext) * 100)
    : 0;

  const tierColor = tierColors[habit.tier as keyof typeof tierColors] || tierColors.bronze;
  const TierIcon = resolveTierIcon(habit.tier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className={`p-4 transition-all duration-200 border-2 ${
        checked 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}>
        <div className="flex items-center space-x-4">
          {/* Large touch-friendly checkbox */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggle(!checked)}
            className={`w-12 h-12 rounded-full border-2 transition-all duration-200 touch-target flex items-center justify-center ${
              checked
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
            }`}
          >
            {checked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="text-xl font-bold"
              >
                ✓
              </motion.div>
            )}
          </motion.button>
          
          {/* Habit content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl flex-shrink-0">{habit.emoji}</span>
              <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">
                {habit.name}
              </h3>
            </div>
            
            {/* Mobile-optimized badges and stats */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {habit.tier && (
                <Badge className={`text-xs px-2 py-1 bg-gradient-to-r ${tierColor} text-white`}>
                  <TierIcon className="mr-1 h-4 w-4 text-white" />
                  <span className="hidden sm:inline capitalize">{habit.tier}</span>
                </Badge>
              )}
              {habit.level && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  <span className="sm:hidden">Lv.{habit.level}</span>
                  <span className="hidden sm:inline">Level {habit.level}</span>
                </Badge>
              )}
              {habit.streak && habit.streak > 0 && (
                <Badge className="text-xs px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
                  <Flame className="h-4 w-4 mr-1" />
                  <span className="sm:hidden">{habit.streak}</span>
                  <span className="hidden sm:inline">{habit.streak} day streak</span>
                </Badge>
              )}
            </div>
            
            {/* Level progress for mobile */}
            {habit.experience !== undefined && habit.experienceToNext && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span className="sm:hidden">Progress</span>
                  <span className="hidden sm:inline">Level Progress</span>
                  <span>{Math.round(experiencePercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${experiencePercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
