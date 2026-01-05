import { useQuery } from "@tanstack/react-query";
import type { Streak } from "@shared/schema";
import { detectClientTimeZone } from "@/lib/timezone";

export function useStreaks() {
  const timeZone = detectClientTimeZone();
  return useQuery<Streak[]>({
    queryKey: ["/api/streaks", timeZone],
    queryFn: async () => {
      const response = await fetch("/api/streaks", { credentials: "include", headers: { "x-timezone": timeZone } });
      if (!response.ok) throw new Error('Failed to fetch streaks');
      return response.json();
    },
  });
}

export function useStreak(type: string) {
  const timeZone = detectClientTimeZone();
  return useQuery<Streak>({
    queryKey: ["/api/streaks", type, timeZone],
    queryFn: async () => {
      const response = await fetch(`/api/streaks/${type}`, { credentials: "include", headers: { "x-timezone": timeZone } });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch streak');
      return response.json();
    },
  });
}
