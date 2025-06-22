import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Trophy, Shield, Award } from "lucide-react";

interface TierRequirementsProps {
  currentHabit?: {
    level: number;
    completionRate: number;
    longestStreak: number;
    masteryPoints: number;
    difficultyRating: number;
    totalCompletions: number;
    tier: string;
  };
}

const tierInfo = [
  {
    name: "Bronze",
    icon: Shield,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    requirements: {
      level: 1,
      completionRate: 0,
      consistency: 0,
      longestStreak: 1,
      masteryPoints: 0,
      difficulty: 1
    },
    description: "Starting your habit journey"
  },
  {
    name: "Silver", 
    icon: Award,
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    requirements: {
      level: 3,
      completionRate: 35,
      consistency: 20,
      longestStreak: 3,
      masteryPoints: 50,
      difficulty: 1
    },
    description: "Building momentum"
  },
  {
    name: "Gold",
    icon: Trophy,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", 
    requirements: {
      level: 6,
      completionRate: 50,
      consistency: 30,
      longestStreak: 7,
      masteryPoints: 150,
      difficulty: 2
    },
    description: "Establishing consistency"
  },
  {
    name: "Platinum",
    icon: Star,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    requirements: {
      level: 10,
      completionRate: 60,
      consistency: 40,
      longestStreak: 14,
      masteryPoints: 400,
      difficulty: 3
    },
    description: "Strong habit mastery"
  },
  {
    name: "Diamond",
    icon: Crown,
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    requirements: {
      level: 15,
      completionRate: 70,
      consistency: 50,
      longestStreak: 21,
      masteryPoints: 800,
      difficulty: 4
    },
    description: "Elite habit champion"
  }
];

export function TierRequirements({ currentHabit }: TierRequirementsProps) {
  const calculateConsistency = (habit: typeof currentHabit) => {
    if (!habit || habit.totalCompletions === 0) return 0;
    return Math.min((habit.longestStreak / habit.totalCompletions) * 100, 100);
  };

  const getProgressToNextTier = (habit: typeof currentHabit) => {
    if (!habit) return null;
    
    const currentTierIndex = tierInfo.findIndex(tier => tier.name.toLowerCase() === habit.tier?.toLowerCase());
    const nextTier = tierInfo[currentTierIndex + 1];
    
    if (!nextTier) return null;
    
    const consistency = calculateConsistency(habit);
    
    const progress = {
      level: Math.min((habit.level / nextTier.requirements.level) * 100, 100),
      completionRate: Math.min((habit.completionRate / nextTier.requirements.completionRate) * 100, 100),
      consistency: Math.min((consistency / nextTier.requirements.consistency) * 100, 100),
      longestStreak: Math.min((habit.longestStreak / nextTier.requirements.longestStreak) * 100, 100),
      masteryPoints: Math.min((habit.masteryPoints / nextTier.requirements.masteryPoints) * 100, 100),
      difficulty: Math.min((habit.difficultyRating / nextTier.requirements.difficulty) * 100, 100)
    };
    
    return { nextTier, progress };
  };

  const progressData = currentHabit ? getProgressToNextTier(currentHabit) : null;

  return (
    <div className="space-y-6">
      {/* Current Progress to Next Tier */}
      {progressData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <progressData.nextTier.icon className="w-5 h-5" />
              <span>Progress to {progressData.nextTier.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level</span>
                    <span>{currentHabit?.level} / {progressData.nextTier.requirements.level}</span>
                  </div>
                  <Progress value={progressData.progress.level} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span>{currentHabit?.completionRate}% / {progressData.nextTier.requirements.completionRate}%</span>
                  </div>
                  <Progress value={progressData.progress.completionRate} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Consistency</span>
                    <span>{Math.round(calculateConsistency(currentHabit))}% / {progressData.nextTier.requirements.consistency}%</span>
                  </div>
                  <Progress value={progressData.progress.consistency} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Longest Streak</span>
                    <span>{currentHabit?.longestStreak} / {progressData.nextTier.requirements.longestStreak}</span>
                  </div>
                  <Progress value={progressData.progress.longestStreak} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mastery Points</span>
                    <span>{currentHabit?.masteryPoints} / {progressData.nextTier.requirements.masteryPoints}</span>
                  </div>
                  <Progress value={progressData.progress.masteryPoints} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Difficulty Rating</span>
                    <span>{currentHabit?.difficultyRating} / {progressData.nextTier.requirements.difficulty}</span>
                  </div>
                  <Progress value={progressData.progress.difficulty} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tier Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Tier System Overview</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tiers are based on consistency, difficulty, and overall performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tierInfo.map((tier, index) => {
              const IconComponent = tier.icon;
              const isCurrentTier = currentHabit?.tier?.toLowerCase() === tier.name.toLowerCase();
              
              return (
                <div 
                  key={tier.name}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    isCurrentTier 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-6 h-6" />
                      <div>
                        <h3 className="font-semibold flex items-center space-x-2">
                          <span>{tier.name}</span>
                          {isCurrentTier && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tier.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={tier.color}>
                      Tier {index + 1}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Level:</span>
                      <span className="ml-1 font-medium">{tier.requirements.level}+</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Completion:</span>
                      <span className="ml-1 font-medium">{tier.requirements.completionRate}%+</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Consistency:</span>
                      <span className="ml-1 font-medium">{tier.requirements.consistency}%+</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Streak:</span>
                      <span className="ml-1 font-medium">{tier.requirements.longestStreak}+ days</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Mastery:</span>
                      <span className="ml-1 font-medium">{tier.requirements.masteryPoints}+ pts</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Min Difficulty:</span>
                      <span className="ml-1 font-medium">{tier.requirements.difficulty}+</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">How Tiers Work</h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• <strong>Consistency</strong>: Ratio of longest streak to total completions</li>
              <li>• <strong>Difficulty</strong>: Higher tiers require more challenging habits</li>
              <li>• <strong>Performance</strong>: Balanced across multiple metrics</li>
              <li>• <strong>Diamond Tier</strong>: Reserved for masters of difficult habits</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}