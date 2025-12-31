import { useQuery } from "@tanstack/react-query";
import type { RankInfo } from "@shared/ranks";

export function useRanks(options?: { enabled?: boolean }) {
  return useQuery<RankInfo>({
    queryKey: ["/api/ranks"],
    queryFn: async () => {
      const response = await fetch("/api/ranks", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch ranks");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}
