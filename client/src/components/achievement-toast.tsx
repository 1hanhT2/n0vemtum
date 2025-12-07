import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAchievements } from "@/hooks/use-achievements";
import { motion } from "framer-motion";
import { resolveBadgeIcon } from "@/lib/badgeIcons";
import { PartyPopper } from "lucide-react";

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
          title: "Achievement Unlocked!",
          description: (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                {(() => {
                  const Icon = resolveBadgeIcon(achievement.badge);
                  return <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
                })()}
              </div>
              <div>
                <div className="font-semibold flex items-center gap-2">
                  <PartyPopper className="h-4 w-4 text-amber-500" />
                  {achievement.name}
                </div>
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
