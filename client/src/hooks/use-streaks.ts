import { useQuery } from "@tanstack/react-query";
import type { Streak } from "@shared/schema";

export function useStreaks() {
  return useQuery<Streak[]>({
    queryKey: ["/api/streaks"],
    queryFn: async () => {
      const response = await fetch("/api/streaks", { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch streaks');
      return response.json();
    },
  });
}

export function useStreak(type: string) {
  return useQuery<Streak>({
    queryKey: ["/api/streaks", type],
    queryFn: async () => {
      const response = await fetch(`/api/streaks/${type}`, { credentials: "include" });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch streak');
      return response.json();
    },
  });
}