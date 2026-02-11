import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Loader2 } from "lucide-react";

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

const getDifficultyColor = (rating: number) => {
  switch (rating) {
    case 1: return "bg-green-500 text-white";
    case 2: return "bg-green-400 text-white";
    case 3: return "bg-yellow-500 text-white";
    case 4: return "bg-orange-500 text-white";
    case 5: return "bg-red-500 text-white";
    default: return "bg-muted text-muted-foreground";
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

export function DifficultyBadge({ habit, onAnalyze, isAnalyzing = false }: HabitDifficultyDisplayProps) {
  if (isAnalyzing) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Analyzing
      </span>
    );
  }

  if (!habit.difficultyRating) {
    return (
      <Button
        onClick={() => onAnalyze?.(habit.id)}
        size="sm"
        variant="ghost"
        className="text-xs h-6 px-2 text-muted-foreground"
        data-testid={`button-analyze-${habit.id}`}
      >
        <Brain className="w-3 h-3 mr-1" />
        Analyze
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Badge className={`${getDifficultyColor(habit.difficultyRating)} text-xs`}>
        {getDifficultyLabel(habit.difficultyRating)}
      </Badge>
      <Button
        onClick={() => onAnalyze?.(habit.id)}
        disabled={isAnalyzing}
        size="sm"
        variant="ghost"
        className="text-xs"
        data-testid={`button-reanalyze-${habit.id}`}
      >
        <Sparkles className="w-3 h-3 mr-1" />
        Re-analyze
      </Button>
    </div>
  );
}

export function AiAnalysisNote({ analysis }: { analysis?: string }) {
  if (!analysis) return null;

  return (
    <p className="text-xs text-muted-foreground leading-relaxed pl-8 border-l-2 border-border ml-0.5">
      {analysis}
    </p>
  );
}

export function HabitDifficultyDisplay({ habit, onAnalyze, isAnalyzing = false }: HabitDifficultyDisplayProps) {
  return (
    <DifficultyBadge habit={habit} onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} />
  );
}
