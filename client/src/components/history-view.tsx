import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyEntries } from "@/hooks/use-daily-entries";
import { useHabits } from "@/hooks/use-habits";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Eye, CheckCircle, XCircle, Clock, BarChart3, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface HistoryViewProps {
  isGuestMode?: boolean;
}

export function HistoryView({ isGuestMode = false }: HistoryViewProps) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get start and end of current month for data fetching
  const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
  
  const { data: dailyEntries = [], isLoading } = useDailyEntries(monthStart, monthEnd);
  const { data: habits = [] } = useHabits();

  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null;
    return dailyEntries.find(entry => entry.date === selectedDate);
  }, [dailyEntries, selectedDate]);

  const monthStats = useMemo(() => {
    if (!dailyEntries.length || !habits.length) {
      return { daysTracked: 0, daysCompleted: 0, avgCompletion: 0 };
    }

    const daysTracked = dailyEntries.length;
    const completionRates = dailyEntries.map(entry => {
      const completions = entry.habitCompletions || {};
      const completed = Object.values(completions).filter(Boolean).length;
      return completed / habits.length;
    });

    const daysCompleted = completionRates.filter(rate => rate === 1).length;
    const avgCompletion = Math.round((completionRates.reduce((sum, rate) => sum + rate, 0) / daysTracked) * 100);

    return { daysTracked, daysCompleted, avgCompletion };
  }, [dailyEntries, habits]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const openDetailsModal = (date: string) => {
    setSelectedDate(date);
    setShowDetailsModal(true);
  };

  const getCompletionStats = (entry: any) => {
    if (!entry || !habits.length) return { completed: 0, total: 0, percentage: 0 };
    
    const completions = entry.habitCompletions || {};
    const completed = Object.values(completions).filter(Boolean).length;
    const total = habits.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600 dark:text-green-400";
    if (score >= 3) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
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
      days.push(<div key={`empty-${i}`} className="h-16"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasData = dailyEntries?.some(entry => entry.date === dateKey);
      const entry = dailyEntries?.find(entry => entry.date === dateKey);
      const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
      const stats = entry ? getCompletionStats(entry) : null;

      days.push(
        <motion.div
          key={day}
          className={`h-16 p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-all ${
            isToday 
              ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' 
              : hasData 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30' 
                : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => hasData && openDetailsModal(dateKey)}
        >
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            {day}
          </div>
          {stats && (
            <div className="text-xs">
              <Badge 
                variant={stats.percentage >= 80 ? "default" : stats.percentage >= 50 ? "secondary" : "destructive"}
                className="text-xs px-1 py-0"
              >
                {stats.percentage}%
              </Badge>
            </div>
          )}
        </motion.div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Month Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {monthStats.daysTracked}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days Tracked</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {monthStats.daysCompleted}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Days Completed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {monthStats.avgCompletion}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Completion</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Monthly Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Has Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">No Data</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Recent Entries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyEntries.length > 0 ? (
            <div className="space-y-3">
              {dailyEntries.slice(0, 10).map((entry) => {
                const stats = getCompletionStats(entry);
                
                return (
                  <motion.div 
                    key={entry.date} 
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => openDetailsModal(entry.date)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {formatDate(entry.date)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {stats.completed}/{stats.total} habits completed
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getScoreColor(entry.punctualityScore)}`}>
                          {entry.punctualityScore}/5 punctuality
                        </div>
                        <div className={`text-sm font-medium ${getScoreColor(entry.adherenceScore)}`}>
                          {entry.adherenceScore}/5 adherence
                        </div>
                      </div>
                      <Badge variant={stats.percentage >= 80 ? "default" : stats.percentage >= 50 ? "secondary" : "destructive"}>
                        {stats.percentage}%
                      </Badge>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No Tracking Data
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start tracking your habits to see historical data here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Historical Data for {selectedDate ? formatDate(selectedDate) : ''}</span>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-[70vh] pr-4">
            <div className="space-y-6">
              {selectedEntry ? (
                <>
                  {/* Overview Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {getCompletionStats(selectedEntry).percentage}%
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(selectedEntry.punctualityScore)}`}>
                            {selectedEntry.punctualityScore}/5
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Punctuality Score</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(selectedEntry.adherenceScore)}`}>
                            {selectedEntry.adherenceScore}/5
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Adherence Score</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Habit Completion Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Habit Completions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {habits.map((habit, index) => {
                          const isCompleted = selectedEntry.habitCompletions?.[habit.id] || false;
                          return (
                            <motion.div 
                              key={habit.id} 
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isCompleted 
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              }`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">{habit.emoji}</span>
                                <span className={`font-medium ${isCompleted ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {habit.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-gray-400" />
                                )}
                                <Badge variant={isCompleted ? "default" : "secondary"}>
                                  {isCompleted ? "Completed" : "Skipped"}
                                </Badge>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daily Reflection & Notes */}
                  {selectedEntry.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Clock className="w-5 h-5" />
                          <span>Daily Reflection</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedEntry.notes}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Completion Timeline */}
                  {selectedEntry.completedAt && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Clock className="w-5 h-5" />
                          <span>Completion Details</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Completed at: {new Date(selectedEntry.completedAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <CalendarIcon className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No Data Available
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No habit tracking data found for {selectedDate ? formatDate(selectedDate) : 'this date'}.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}