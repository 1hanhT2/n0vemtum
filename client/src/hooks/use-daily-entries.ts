import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { DailyEntry, InsertDailyEntry } from "@shared/schema";
import { useDebounce } from "./use-debounce";

export function useDailyEntries(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  
  const queryString = params.toString();
  const url = queryString ? `/api/daily-entries?${queryString}` : '/api/daily-entries';
  
  return useQuery<DailyEntry[]>({
    queryKey: ["/api/daily-entries", startDate, endDate],
    queryFn: async () => {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error('Failed to fetch daily entries');
      return response.json();
    },
  });
}

export function useDailyEntry(date: string) {
  return useQuery<DailyEntry>({
    queryKey: ["/api/daily-entries", date],
    queryFn: async () => {
      const response = await fetch(`/api/daily-entries/${date}`, { credentials: "include" });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch daily entry');
      return response.json();
    },
  });
}

export function useCreateDailyEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entry: InsertDailyEntry) => {
      const response = await apiRequest("/api/daily-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-entries"] });
      queryClient.setQueryData(["/api/daily-entries", data.date], data);
    },
  });
}

export function useUpdateDailyEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ date, ...entry }: Partial<InsertDailyEntry> & { date: string }) => {
      const response = await apiRequest(`/api/daily-entries/${date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
      });
      return response.json();
    },
    onMutate: async ({ date, ...entry }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/daily-entries", date] });
      
      // Snapshot previous value
      const previousEntry = queryClient.getQueryData(["/api/daily-entries", date]);
      
      // Optimistically update
      queryClient.setQueryData(["/api/daily-entries", date], (old: any) => ({
        ...old,
        ...entry,
        date,
      }));
      
      return { previousEntry, date };
    },
    onError: (err, variables, context: any) => {
      // Rollback on error
      if (context?.previousEntry) {
        queryClient.setQueryData(["/api/daily-entries", context.date], context.previousEntry);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-entries"] });
      queryClient.setQueryData(["/api/daily-entries", data.date], data);
    },
  });
}
