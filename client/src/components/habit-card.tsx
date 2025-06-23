import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy, Flame, Target, TrendingUp } from "lucide-react";

interface Habit {
  id: number;
  name: string;
  emoji: string;
  level?: number;
  experience?: number;
  experienceToNext?: number;
  masteryPoints?: number;
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

const tierEmojis = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '💍',
};

export function HabitCard({ habit, date, isCompleted = false, onToggle }: HabitCardProps) {
  const [checked, setChecked] = useState(isCompleted);

  const handleToggle = (value: boolean) => {
    setChecked(value);
    onToggle?.(habit.id, value);
  };

  const experiencePercentage = habit.experience && habit.experienceToNext 
    ? (habit.experience / (habit.experience + habit.experienceToNext)) * 100 
    : 0;

  const tierColor = tierColors[habit.tier as keyof typeof tierColors] || tierColors.bronze;
  const tierEmoji = tierEmojis[habit.tier as keyof typeof tierEmojis] || tierEmojis.bronze;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-3 sm:p-4 transition-all duration-200 hover:shadow-md ${
        checked ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Checkbox
              checked={checked}
              onCheckedChange={handleToggle}
              className="flex-shrink-0"
            />
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <span className="text-lg sm:text-xl flex-shrink-0">{habit.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm sm:text-base truncate">{habit.name}</h3>
                <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                  {habit.tier && (
                    <Badge variant="secondary" className={`text-xs bg-gradient-to-r ${tierColor} text-white`}>
                      {tierEmoji} {habit.tier}
                    </Badge>
                  )}
                  {habit.level && (
                    <Badge variant="outline" className="text-xs">
                      Lv.{habit.level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2">
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
              {habit.streak && habit.streak > 0 && (
                <div className="flex items-center space-x-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span>{habit.streak}</span>
                </div>
              )}
              {habit.masteryPoints && (
                <div className="flex items-center space-x-1">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <span>{habit.masteryPoints}</span>
                </div>
              )}
            </div>
            
            {habit.experience !== undefined && habit.experienceToNext && (
              <div className="w-16 sm:w-20">
                <Progress value={experiencePercentage} className="h-1 sm:h-2" />
                <div className="text-xs text-muted-foreground text-center mt-1">
                  {habit.experience}/{habit.experience + habit.experienceToNext} XP
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}