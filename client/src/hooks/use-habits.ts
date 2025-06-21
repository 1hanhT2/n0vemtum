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
      const response = await apiRequest("POST", "/api/habits", habit);
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
      const response = await apiRequest("PUT", `/api/habits/${id}`, habit);
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
      const response = await apiRequest("DELETE", `/api/habits/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    },
  });
}
