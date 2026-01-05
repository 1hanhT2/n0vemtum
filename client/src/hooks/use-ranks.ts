import { useQuery } from "@tanstack/react-query";
import type { RankInfo } from "@shared/ranks";
import { detectClientTimeZone } from "@/lib/timezone";

export function useRanks(options?: { enabled?: boolean }) {
  const timeZone = detectClientTimeZone();
  return useQuery<RankInfo>({
    queryKey: ["/api/ranks", timeZone],
    queryFn: async () => {
      const response = await fetch("/api/ranks", { credentials: "include", headers: { "x-timezone": timeZone } });
      if (!response.ok) throw new Error("Failed to fetch ranks");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}
