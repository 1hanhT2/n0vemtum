import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Sparkles, Star, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LevelUpNotificationProps {
  habit: {
    id: number;
    name: string;
    emoji: string;
    experience: number;
    experienceToNext: number;
    level: number;
  };
  onLevelUp: (habitId: number) => void;
  show: boolean;
  onClose: () => void;
}

export function LevelUpNotification({ habit, onLevelUp, show, onClose }: LevelUpNotificationProps) {
  const [celebrating, setCelebrating] = useState(false);

  const handleLevelUp = () => {
    setCelebrating(true);
    onLevelUp(habit.id);
    
    setTimeout(() => {
      setCelebrating(false);
      onClose();
    }, 2000);
  };

  const canLevelUp = habit.experience >= habit.experienceToNext;

  if (!show || !canLevelUp) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative"
        >
          <Card className="w-80 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-6 text-center space-y-4">
              {/* Celebration Animation */}
              <div className="relative">
                <motion.div
                  animate={celebrating ? { 
                    rotate: [0, 360], 
                    scale: [1, 1.2, 1] 
                  } : {}}
                  transition={{ duration: 0.6 }}
                  className="text-6xl mb-2"
                >
                  {celebrating ? <PartyPopper className="w-14 h-14 text-orange-500" /> : habit.emoji}
                </motion.div>
                
                {/* Sparkle effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={celebrating ? {
                        scale: [0, 1, 0],
                        rotate: [0, 180],
                        x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                        y: [0, Math.sin(i * 60 * Math.PI / 180) * 40]
                      } : {}}
                      transition={{ 
                        duration: 1, 
                        delay: i * 0.1,
                        repeat: celebrating ? Infinity : 0,
                        repeatDelay: 0.5
                      }}
                      className="absolute text-yellow-400"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Level Up Available!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {habit.name} is ready to advance to level {habit.level + 1}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Current XP</span>
                  <span className="font-medium">{habit.experience} / {habit.experienceToNext}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Surplus XP will carry over to the next level
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={celebrating}
                >
                  Later
                </Button>
                <Button
                  onClick={handleLevelUp}
                  disabled={celebrating}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
                >
                  {celebrating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Level Up!
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
