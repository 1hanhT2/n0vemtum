import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useHabitSuggestions(habitIds?: number[]) {
  // Create a stable key based on habit IDs to prevent unnecessary refetches
  const habitKey = habitIds?.sort().join(',') || 'no-habits';
  
  return useQuery({
    queryKey: ["/api/ai/habit-suggestions", habitKey],
    staleTime: 30 * 60 * 1000, // 30 minutes - suggestions don't change often
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
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
      // Round completion rate to reduce cache misses for tiny differences
      const roundedRate = Math.round(completionRate * 100) / 100;
      
      const response = await apiRequest("POST", "/api/ai/motivation", {
        completionRate: roundedRate,
        currentStreak,
      });
      return response.json();
    },
  });
}

// New hook for cached motivational messages based on completion rate and streak
export function useCachedMotivationalMessage(completionRate: number, currentStreak: number) {
  const roundedRate = Math.round(completionRate * 100) / 100;
  
  return useQuery({
    queryKey: ["/api/ai/motivation", roundedRate, currentStreak],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/ai/motivation", {
        completionRate: roundedRate,
        currentStreak,
      });
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    // Only fetch if we have valid data
    enabled: completionRate >= 0 && currentStreak >= 0,
  });
}