import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyEntries } from "@/hooks/use-daily-entries";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function HistoryView() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get start and end of current month for data fetching
  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
  
  const { data: dailyEntries, isLoading } = useDailyEntries(monthStart, monthEnd);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const today = new Date();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasData = dailyEntries?.some(entry => entry.date === dateKey);
      const isToday = day === today.getDate() && 
                     currentMonth === today.getMonth() && 
                     currentYear === today.getFullYear();
      
      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (hasData) {
              toast({
                title: `Data for ${dateKey}`,
                description: "Viewing historical data (full implementation needed)",
              });
            }
          }}
          className={`h-12 rounded-lg border text-sm font-medium transition-all duration-200 ${
            isToday 
              ? 'bg-primary text-white border-primary' 
              : hasData 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {day}
        </motion.button>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">🗓️ History</h2>
        <p className="text-gray-600 dark:text-gray-300">Browse your past entries and progress</p>
      </div>

      {/* Calendar */}
      <Card className="rounded-2xl shadow-lg bg-card dark:bg-gray-900 border-border dark:border-gray-700 transition-all duration-200 hover:dark:bg-gray-800 hover:shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="w-8 h-8 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="w-8 h-8 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-primary rounded mr-2"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded mr-2"></div>
              <span>Has Data</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded mr-2"></div>
              <span>No Data</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats for Current Month */}
      {dailyEntries && dailyEntries.length > 0 && (
        <Card className="rounded-2xl shadow-lg bg-card dark:bg-gray-900 border-border dark:border-gray-700 transition-all duration-200 hover:dark:bg-gray-800 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white">Month Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dailyEntries.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Days Tracked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {dailyEntries.filter(entry => entry.completedAt).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Days Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {(dailyEntries.reduce((sum, entry) => sum + entry.punctualityScore, 0) / dailyEntries.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Avg Punctuality</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {(dailyEntries.reduce((sum, entry) => sum + entry.adherenceScore, 0) / dailyEntries.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Avg Adherence</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
