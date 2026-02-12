import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Achievement } from "@shared/schema";
import { detectClientTimeZone } from "@/lib/timezone";

export function useAchievements(options?: { enabled?: boolean }) {
  const timeZone = detectClientTimeZone();
  return useQuery<Achievement[]>({
    queryKey: ["/api/achievements", timeZone],
    queryFn: async () => {
      const response = await fetch("/api/achievements", { credentials: "include", headers: { "x-timezone": timeZone } });
      if (!response.ok) throw new Error('Failed to fetch achievements');
      return response.json();
    },
    enabled: options?.enabled ?? true,
  });
}

export function useUnlockAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/achievements/${id}/unlock`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
    },
  });
}
