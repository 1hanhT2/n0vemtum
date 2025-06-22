import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useHabitSuggestions() {
  return useQuery({
    queryKey: ["/api/ai/habit-suggestions"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWeeklyInsights(startDate?: string, endDate?: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/weekly-insights", {
        startDate,
        endDate,
      });
      return response.json();
    },
  });
}

export function useMotivationalMessage() {
  return useMutation({
    mutationFn: async ({ completionRate, currentStreak }: { completionRate: number; currentStreak: number }) => {
      const response = await apiRequest("POST", "/api/ai/motivation", {
        completionRate,
        currentStreak,
      });
      return response.json();
    },
  });
}