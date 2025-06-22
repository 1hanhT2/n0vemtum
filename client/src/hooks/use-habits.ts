import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Habit, InsertHabit } from "@shared/schema";

export function useHabits() {
  return useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (habit: InsertHabit) => {
      const response = await apiRequest("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...habit }: Partial<InsertHabit> & { id: number }) => {
      const response = await apiRequest(`/api/habits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/habits/${id}`, {
        method: "DELETE"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });
}
