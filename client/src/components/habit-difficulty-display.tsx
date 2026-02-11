import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Loader2 } from "lucide-react";

interface HabitDifficultyProps {
  difficultyRating?: number;
  habitId: number;
}

interface ReanalyzeButtonProps {
  habitId: number;
  hasDifficulty: boolean;
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

export function DifficultyBadge({ difficultyRating, habitId }: HabitDifficultyProps) {
  if (!difficultyRating) return null;

  return (
    <Badge className={`${getDifficultyColor(difficultyRating)} text-xs`} data-testid={`badge-difficulty-${habitId}`}>
      {getDifficultyLabel(difficultyRating)}
    </Badge>
  );
}

export function ReanalyzeButton({ habitId, hasDifficulty, onAnalyze, isAnalyzing = false }: ReanalyzeButtonProps) {
  if (isAnalyzing) {
    return (
      <Button size="icon" variant="ghost" disabled data-testid={`button-reanalyze-${habitId}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      onClick={() => onAnalyze?.(habitId)}
      size="icon"
      variant="ghost"
      data-testid={hasDifficulty ? `button-reanalyze-${habitId}` : `button-analyze-${habitId}`}
    >
      {hasDifficulty ? <Sparkles className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
    </Button>
  );
}

export function AiAnalysisNote({ analysis }: { analysis?: string }) {
  if (!analysis) return null;

  return (
    <p className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-border">
      {analysis}
    </p>
  );
}
