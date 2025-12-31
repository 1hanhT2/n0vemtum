import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Setting, InsertSetting } from "@shared/schema";

export function useSettings() {
  return useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });
}

export function useSetting(key: string) {
  return useQuery<Setting>({
    queryKey: ["/api/settings", key],
    queryFn: async () => {
      const response = await fetch(`/api/settings/${key}`, { credentials: "include" });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch setting');
      return response.json();
    },
  });
}

export function useSetSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (setting: InsertSetting) => {
      const response = await apiRequest("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setting),
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.setQueryData(["/api/settings", data.key], data);
    },
  });
}
