import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const hasAnalysis = habit.difficultyRating && habit.aiAnalysis;
  const isStale = habit.lastAnalyzed && 
    new Date().getTime() - new Date(habit.lastAnalyzed).getTime() > 7 * 24 * 60 * 60 * 1000;

  if (!hasAnalysis && !isAnalyzing) {
    return (
      <Button
        onClick={() => onAnalyze?.(habit.id)}
        disabled={isAnalyzing}
        size="sm"
        variant="ghost"
        className="text-xs text-muted-foreground"
        data-testid={`button-analyze-${habit.id}`}
      >
        <Brain className="w-3 h-3 mr-1" />
        AI Analysis
      </Button>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Analyzing...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`${getDifficultyColor(habit.difficultyRating!)} text-xs`}>
          {getDifficultyLabel(habit.difficultyRating!)}
        </Badge>
        <Button
          onClick={() => onAnalyze?.(habit.id)}
          disabled={isAnalyzing}
          size="sm"
          variant="ghost"
          className="text-xs h-6 px-2"
          data-testid={`button-reanalyze-${habit.id}`}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Re-analyze
        </Button>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {habit.aiAnalysis}
      </p>
    </motion.div>
  );
}
