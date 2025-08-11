import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Award, 
  TrendingUp,
  Crown,
  Zap,
  Shield,
  Gem
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HabitProgressionProps {
  habit: {
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
  };
  onLevelUp?: (habitId: number) => void;
}

export function HabitProgression({ habit, onLevelUp }: HabitProgressionProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const getTierIcon = (tierValue: string) => {
    switch (tierValue) {
      case "bronze": return <Shield className="w-4 h-4 text-amber-600" />;
      case "silver": return <Shield className="w-4 h-4 text-gray-400" />;
      case "gold": return <Crown className="w-4 h-4 text-yellow-500" />;
      case "platinum": return <Star className="w-4 h-4 text-blue-400" />;
      case "diamond": return <Gem className="w-4 h-4 text-purple-500" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTierColor = (tierValue: string) => {
    switch (tierValue) {
      case "bronze": return "from-amber-500 to-amber-700";
      case "silver": return "from-gray-400 to-gray-600";
      case "gold": return "from-yellow-400 to-yellow-600";
      case "platinum": return "from-blue-400 to-blue-600";
      case "diamond": return "from-purple-400 to-purple-600";
      default: return "from-gray-400 to-gray-600";
    }
  };

  const getDifficultyMultiplier = (rating?: number) => {
    if (!rating) return 1;
    return rating * 0.2 + 0.6; // 0.8x to 1.6x multiplier
  };

  const calculateNextLevelXP = (level: number, difficulty?: number) => {
    const baseXP = 100;
    const multiplier = getDifficultyMultiplier(difficulty);
    return Math.floor(baseXP * Math.pow(1.2, level - 1) * multiplier);
  };

  // Use defaults for missing gamification data
  const level = habit.level || 1;
  const experience = habit.experience || 0;
  const experienceToNext = habit.experienceToNext || 100;
  const masteryPoints = habit.masteryPoints || 0;
  const streak = habit.streak || 0;
  const longestStreak = habit.longestStreak || 0;
  const completionRate = habit.completionRate || 0;
  const totalCompletions = habit.totalCompletions || 0;
  const tier = habit.tier || "bronze";
  const badges = habit.badges || [];

  const experiencePercentage = experienceToNext > 0 ? (experience / experienceToNext) * 100 : 0;

  const badgeEmojis: { [key: string]: string } = {
    "first_completion": "🎯",
    "week_warrior": "⚔️",
    "month_master": "👑",
    "streak_starter": "🔥",
    "consistency_king": "💎",
    "habit_hero": "🦸",
    "dedication_demon": "😈",
    "persistence_pro": "💪"
  };

  const handleCelebration = () => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 2000);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${getTierColor(habit.tier)} opacity-10`} />
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`p-2 rounded-full bg-gradient-to-r ${getTierColor(tier)} text-white`}>
                {getTierIcon(tier)}
              </div>
              {streak > 0 && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {streak}
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>{habit.emoji} {habit.name}</span>
                <Badge variant="outline" className="text-xs">
                  Level {level}
                </Badge>
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="capitalize">{tier} Tier</span>
                <span>•</span>
                <span>{completionRate}% Success Rate</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <TrendingUp className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Experience Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Experience</span>
            <span className="font-medium">{experience} / {experienceToNext} XP</span>
          </div>
          <Progress value={experiencePercentage} className="h-2" />
          {experiencePercentage >= 100 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <Button
                onClick={() => {
                  onLevelUp?.(habit.id);
                  handleCelebration();
                }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Level Up!
              </Button>
            </motion.div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="space-y-1 relative">
            <div className="flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-md px-2 py-1">{streak}</div>
            <div className="text-xs text-gray-500">Current</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-sm font-medium">{longestStreak}</div>
            <div className="text-xs text-gray-500">Best</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-sm font-medium">{masteryPoints}</div>
            <div className="text-xs text-gray-500">Mastery</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Award className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-sm font-medium">{totalCompletions}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Earned Badges
            </div>
            <div className="flex flex-wrap gap-1">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-lg"
                  title={badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                >
                  {badgeEmojis[badge] || "🏆"}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 border-t pt-3"
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-gray-700 dark:text-gray-300">Progress Metrics</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Completions</span>
                      <span>{totalCompletions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Mastery Points</span>
                      <span>{masteryPoints}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-gray-700 dark:text-gray-300">Streak Stats</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                      <span>{streak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Longest Streak</span>
                      <span>{longestStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Tier</span>
                      <span className="capitalize">{tier}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Celebration Animation */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}