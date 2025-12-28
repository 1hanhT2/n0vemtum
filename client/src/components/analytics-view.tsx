import { useHabits } from "@/hooks/use-habits";
import { HabitHealthDashboard } from "@/components/habit-health-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { getMockHabits } from "@/lib/mockData";

interface AnalyticsViewProps {
  isGuestMode?: boolean;
}

export function AnalyticsView({ isGuestMode = false }: AnalyticsViewProps) {
  const { data: habits, isLoading, error } = isGuestMode 
    ? { data: getMockHabits(), isLoading: false, error: null }
    : useHabits();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-muted-foreground">
            Unable to load habit data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Habit Health Analytics
        </h2>
        <p className="text-muted-foreground">
          Comprehensive overview of your habit performance and progress
        </p>
      </div>
      
      <HabitHealthDashboard habits={habits || []} />
    </div>
  );
}