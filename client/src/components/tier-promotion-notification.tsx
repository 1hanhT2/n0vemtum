import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Star, Trophy, Shield, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TierPromotionNotificationProps {
  oldTier: string;
  newTier: string;
  habit: {
    id: number;
    name: string;
    emoji: string;
  };
  show: boolean;
  onClose: () => void;
}

const tierIcons = {
  bronze: Shield,
  silver: Award,
  gold: Trophy,
  platinum: Star,
  diamond: Crown
};

const tierColors = {
  bronze: "from-orange-400 to-orange-600",
  silver: "from-slate-400 to-slate-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-gray-400 to-gray-600",
  diamond: "from-purple-400 to-purple-600"
};

export function TierPromotionNotification({ 
  oldTier, 
  newTier, 
  habit, 
  show, 
  onClose 
}: TierPromotionNotificationProps) {
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (show) {
      setCelebrating(true);
      const timer = setTimeout(() => {
        setCelebrating(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return null;

  const NewTierIcon = tierIcons[newTier.toLowerCase() as keyof typeof tierIcons] || Crown;
  const tierGradient = tierColors[newTier.toLowerCase() as keyof typeof tierColors] || "from-purple-400 to-purple-600";

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
          initial={{ y: 50, rotateY: -90 }}
          animate={{ y: 0, rotateY: 0 }}
          transition={{ type: "spring", damping: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative"
        >
          <Card className={`w-96 bg-gradient-to-br ${tierGradient} border-0 text-white shadow-2xl`}>
            <CardContent className="p-8 text-center space-y-6">
              {/* Celebration Animation */}
              <div className="relative">
                <motion.div
                  animate={celebrating ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360, 0]
                  } : {}}
                  transition={{ duration: 2, repeat: celebrating ? Infinity : 0 }}
                  className="text-8xl mb-4"
                >
                  <NewTierIcon className="w-20 h-20 mx-auto text-white drop-shadow-lg" />
                </motion.div>
                
                {/* Particle effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={celebrating ? {
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
                        y: [0, Math.sin(i * 45 * Math.PI / 180) * 60]
                      } : {}}
                      transition={{ 
                        duration: 2, 
                        delay: i * 0.1,
                        repeat: celebrating ? Infinity : 0,
                        repeatDelay: 1
                      }}
                      className="absolute w-2 h-2 bg-white rounded-full"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold text-white drop-shadow-lg"
                >
                  Tier Promotion!
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <p className="text-xl text-white/90">
                    {habit.emoji} {habit.name}
                  </p>
                  <div className="flex items-center justify-center space-x-3 text-lg">
                    <span className="capitalize bg-white/20 px-3 py-1 rounded-full">
                      {oldTier}
                    </span>
                    <span className="text-2xl">→</span>
                    <span className="capitalize bg-white/30 px-3 py-1 rounded-full font-bold">
                      {newTier}
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-white/10 rounded-lg p-4 backdrop-blur-sm"
              >
                <p className="text-white/80 text-sm leading-relaxed">
                  Your consistency and dedication have earned you a promotion to {newTier} tier! 
                  Keep up the excellent work building this habit.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Button
                  onClick={onClose}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-2"
                  variant="outline"
                >
                  Awesome!
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}