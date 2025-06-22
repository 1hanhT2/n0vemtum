import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Achievement } from "@shared/schema";

export function useAchievements() {
  return useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      const response = await fetch("/api/achievements", { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch achievements');
      return response.json();
    },
  });
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/achievements/${id}/unlock`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
    },
  });
}