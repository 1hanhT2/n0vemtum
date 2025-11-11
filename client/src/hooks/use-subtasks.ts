import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Subtask, InsertSubtask } from "@shared/schema";

export function useSubtasks(habitId: number) {
  return useQuery<Subtask[]>({
    queryKey: ['/api/subtasks', habitId],
    queryFn: () => fetch(`/api/subtasks/${habitId}`, { credentials: 'include' }).then(res => res.json()),
  });
}

export function useCreateSubtask() {
  return useMutation({
    mutationFn: async (subtask: InsertSubtask) => {
      const res = await apiRequest('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subtask),
      });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/subtasks', variables.habitId] });
    },
  });
}

export function useUpdateSubtask() {
  return useMutation({
    mutationFn: async ({ id, habitId, ...data }: { id: number; habitId: number } & Partial<InsertSubtask>) => {
      const res = await apiRequest(`/api/subtasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/subtasks', variables.habitId] });
    },
  });
}

export function useDeleteSubtask() {
  return useMutation({
    mutationFn: async ({ id, habitId }: { id: number; habitId: number }) => {
      const res = await apiRequest(`/api/subtasks/${id}`, {
        method: 'DELETE',
      });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/subtasks', variables.habitId] });
    },
  });
}
