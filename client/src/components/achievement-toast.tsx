import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAchievements } from "@/hooks/use-achievements";
import { motion } from "framer-motion";

export function AchievementToast() {
  const { data: achievements } = useAchievements();
  const { toast } = useToast();

  useEffect(() => {
    const unlockedAchievements = achievements?.filter(a => a.isUnlocked && a.unlockedAt);
    
    if (unlockedAchievements && unlockedAchievements.length > 0) {
      // Show toast for recently unlocked achievements (within last 5 minutes)
      const recentlyUnlocked = unlockedAchievements.filter(a => {
        if (!a.unlockedAt) return false;
        const unlockTime = new Date(a.unlockedAt).getTime();
        const now = new Date().getTime();
        return (now - unlockTime) < 5 * 60 * 1000; // 5 minutes
      });

      recentlyUnlocked.forEach(achievement => {
        toast({
          title: `🎉 Achievement Unlocked!`,
          description: (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="text-2xl">{achievement.badge}</div>
              <div>
                <div className="font-semibold">{achievement.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {achievement.description}
                </div>
              </div>
            </motion.div>
          ),
          duration: 5000,
        });
      });
    }
  }, [achievements, toast]);

  return null;
}