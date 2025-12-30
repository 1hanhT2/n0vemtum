import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useLevelUpHabit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (habitId: number) => {
      const response = await apiRequest(`/api/habits/${habitId}/level-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json();
    },
    onSuccess: (habit) => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Level Up!",
        description: `${habit.emoji} ${habit.name} reached level ${habit.level}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Level Up Failed",
        description: error instanceof Error ? error.message : "Could not level up habit",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateHabitProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ habitId, completed, date }: { habitId: number; completed: boolean; date: string }) => {
      const response = await apiRequest(`/api/habits/${habitId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed, date }),
      });
      return response.json();
    },
    onSuccess: (response, { completed }) => {
      const { userProgress, user, ...habit } = response || {};
      // Use optimistic updates instead of invalidating all queries
      queryClient.setQueryData(['/api/habits'], (oldHabits: any[]) => 
        oldHabits?.map(h => h.id === habit.id ? habit : h)
      );
      if (userProgress) {
        queryClient.setQueryData(['/api/user/progress'], userProgress);
        if (user) {
          queryClient.setQueryData(['/api/auth/user'], user);
        }
        queryClient.setQueryData(['/api/auth/user'], (oldUser: any) => {
          if (!oldUser) return oldUser;
          return {
            ...oldUser,
            level: userProgress.level,
            xp: userProgress.xp,
            stats: user?.stats ?? oldUser.stats,
          };
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/progress'] });
      }
      
      if (completed) {
        // Check for new badges or tier promotions (simplified check)
        const oldHabits = queryClient.getQueryData(['/api/habits']) as any[];
        const oldHabit = oldHabits?.find((h: any) => h.id === habit.id);
        const newBadges = habit.badges?.filter((badge: string) => 
          !oldHabit?.badges?.includes(badge)
        ) || [];
        
        if (newBadges.length > 0) {
          toast({
            title: "New Badge Earned!",
            description: `${habit.emoji} ${habit.name} earned: ${newBadges.join(', ')}`,
          });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Progress Update Failed",
        description: error instanceof Error ? error.message : "Could not update habit progress",
        variant: "destructive",
      });
    },
  });
}

export function useAwardBadge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ habitId, badge }: { habitId: number; badge: string }) => {
      const response = await apiRequest(`/api/habits/${habitId}/badge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ badge }),
      });
      return response.json();
    },
    onSuccess: (habit, { badge }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: "Badge Awarded!",
        description: `${habit.emoji} ${habit.name} earned the ${badge.replace(/_/g, ' ')} badge!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Badge Award Failed",
        description: error instanceof Error ? error.message : "Could not award badge",
        variant: "destructive",
      });
    },
  });
}
