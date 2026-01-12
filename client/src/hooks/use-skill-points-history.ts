import { useQuery } from "@tanstack/react-query";
import type { SkillPointHistory } from "@shared/schema";
import { detectClientTimeZone } from "@/lib/timezone";

export function useSkillPointsHistory(startDate?: string, endDate?: string, timeZone?: string) {
  const resolvedTimeZone = timeZone || detectClientTimeZone();
  const params = new URLSearchParams();
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);

  const queryString = params.toString();
  const url = queryString ? `/api/skill-points/history?${queryString}` : "/api/skill-points/history";

  return useQuery<SkillPointHistory[]>({
    queryKey: ["/api/skill-points/history", startDate, endDate, resolvedTimeZone],
    queryFn: async () => {
      const response = await fetch(url, {
        credentials: "include",
        headers: { "x-timezone": resolvedTimeZone },
      });
      if (!response.ok) throw new Error("Failed to fetch skill points history");
      return response.json();
    },
  });
}
