import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { WeeklyReview, InsertWeeklyReview } from "@shared/schema";

export function useWeeklyReviews() {
  return useQuery<WeeklyReview[]>({
    queryKey: ["/api/weekly-reviews"],
  });
}

export function useWeeklyReview(weekStartDate: string) {
  return useQuery<WeeklyReview | null>({
    queryKey: ["/api/weekly-reviews", weekStartDate],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/weekly-reviews/${weekStartDate}`, { credentials: "include" });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('Failed to fetch weekly review');
        return response.json();
      } catch (error) {
        // Silently handle network errors and return null for missing reviews
        console.log('Weekly review not found, this is normal for new weeks');
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    throwOnError: false, // Don't throw errors to prevent UI error displays
  });
}

export function useCreateWeeklyReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: InsertWeeklyReview) => {
      const response = await apiRequest("/api/weekly-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review)
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-reviews"] });
      queryClient.setQueryData(["/api/weekly-reviews", data.weekStartDate], data);
    },
  });
}

export function useUpdateWeeklyReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ weekStartDate, ...review }: Partial<InsertWeeklyReview> & { weekStartDate: string }) => {
      const response = await apiRequest(`/api/weekly-reviews/${weekStartDate}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review)
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-reviews"] });
      queryClient.setQueryData(["/api/weekly-reviews", data.weekStartDate], data);
    },
  });
}