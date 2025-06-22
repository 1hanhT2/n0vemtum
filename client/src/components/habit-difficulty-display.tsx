import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface HabitDifficultyDisplayProps {
  habit: {
    id: number;
    name: string;
    emoji: string;
    difficultyRating?: number;
    aiAnalysis?: string;
    lastAnalyzed?: string;
  };
  onAnalyze?: (habitId: number) => void;
  isAnalyzing?: boolean;
}

export function HabitDifficultyDisplay({ 
  habit, 
  onAnalyze, 
  isAnalyzing = false 
}: HabitDifficultyDisplayProps) {
  const getDifficultyColor = (rating: number) => {
    switch (rating) {
      case 1: return "bg-green-500 text-white";
      case 2: return "bg-green-400 text-white";
      case 3: return "bg-yellow-500 text-white";
      case 4: return "bg-orange-500 text-white";
      case 5: return "bg-red-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  const getDifficultyLabel = (rating: number) => {
    switch (rating) {
      case 1: return "Very Easy";
      case 2: return "Easy";
      case 3: return "Moderate";
      case 4: return "Hard";
      case 5: return "Very Hard";
      default: return "Unknown";
    }
  };

  const getDifficultyStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const hasAnalysis = habit.difficultyRating && habit.aiAnalysis;
  const isStale = habit.lastAnalyzed && 
    new Date().getTime() - new Date(habit.lastAnalyzed).getTime() > 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AI Difficulty Analysis
          </span>
        </div>
        
        {!hasAnalysis || isStale ? (
          <Button
            onClick={() => onAnalyze?.(habit.id)}
            disabled={isAnalyzing}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                {hasAnalysis ? "Re-analyze" : "Analyze"}
              </>
            )}
          </Button>
        ) : (
          <Badge variant="outline" className="text-xs text-gray-500">
            Last analyzed {new Date(habit.lastAnalyzed!).toLocaleDateString()}
          </Badge>
        )}
      </div>

      {hasAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3">
            <Badge className={`${getDifficultyColor(habit.difficultyRating!)} px-3 py-1`}>
              {getDifficultyStars(habit.difficultyRating!)} {getDifficultyLabel(habit.difficultyRating!)}
            </Badge>
          </div>
          
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {habit.aiAnalysis}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!hasAnalysis && !isAnalyzing && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Click "Analyze" to get AI-powered difficulty insights</p>
        </div>
      )}
    </div>
  );
}