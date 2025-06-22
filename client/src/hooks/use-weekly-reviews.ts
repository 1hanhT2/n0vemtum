import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { WeeklyReview, InsertWeeklyReview } from "@shared/schema";

export function useWeeklyReviews() {
  return useQuery<WeeklyReview[]>({
    queryKey: ["/api/weekly-reviews"],
  });
}

export function useWeeklyReview(weekStartDate: string) {
  return useQuery<WeeklyReview>({
    queryKey: ["/api/weekly-reviews", weekStartDate],
    queryFn: async () => {
      const response = await fetch(`/api/weekly-reviews/${weekStartDate}`, { credentials: "include" });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch weekly review');
      return response.json();
    },
  });
}

export function useCreateWeeklyReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: InsertWeeklyReview) => {
      const response = await apiRequest("POST", "/api/weekly-reviews", review);
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