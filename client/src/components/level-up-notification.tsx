import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Sparkles, Star, PartyPopper } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-gsap";

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
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const loadingIconRef = useRef<HTMLDivElement>(null);
  const sparkleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const canLevelUp = habit.experience >= habit.experienceToNext;
  const shouldRender = show && canLevelUp;

  const handleLevelUp = () => {
    setCelebrating(true);
    onLevelUp(habit.id);

    setTimeout(() => {
      setCelebrating(false);
      onClose();
    }, 2000);
  };

  useEffect(() => {
    if (!shouldRender || !overlayRef.current || !cardRef.current) return;
    if (prefersReducedMotion) {
      gsap.set(overlayRef.current, { opacity: 1 });
      gsap.set(cardRef.current, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" });
    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" },
      0.04
    );

    return () => {
      tl.kill();
      gsap.killTweensOf(overlayRef.current);
      gsap.killTweensOf(cardRef.current);
    };
  }, [shouldRender, prefersReducedMotion]);

  useEffect(() => {
    if (!shouldRender) return;

    const sparkleNodes = sparkleRefs.current.filter(Boolean) as HTMLDivElement[];
    if (prefersReducedMotion) {
      if (heroRef.current) gsap.set(heroRef.current, { rotate: 0, scale: 1 });
      if (loadingIconRef.current) gsap.set(loadingIconRef.current, { rotate: 0 });
      if (sparkleNodes.length > 0) gsap.set(sparkleNodes, { opacity: 1, x: 0, y: 0, scale: 1 });
      return;
    }

    if (heroRef.current) {
      if (celebrating) {
        gsap.to(heroRef.current, {
          rotate: 360,
          scale: 1.15,
          duration: 0.6,
          yoyo: true,
          repeat: -1,
          ease: "power1.inOut",
        });
      } else {
        gsap.killTweensOf(heroRef.current);
        gsap.set(heroRef.current, { rotate: 0, scale: 1 });
      }
    }

    if (loadingIconRef.current) {
      if (celebrating) {
        gsap.to(loadingIconRef.current, {
          rotate: 360,
          duration: 1,
          repeat: -1,
          ease: "none",
        });
      } else {
        gsap.killTweensOf(loadingIconRef.current);
        gsap.set(loadingIconRef.current, { rotate: 0 });
      }
    }

    if (sparkleNodes.length > 0) {
      if (celebrating) {
        sparkleNodes.forEach((node, i) => {
          const angle = (i * Math.PI * 2) / sparkleNodes.length;
          gsap.fromTo(
            node,
            { opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 },
            {
              opacity: 1,
              scale: 1,
              x: Math.cos(angle) * 40,
              y: Math.sin(angle) * 40,
              rotate: 180,
              duration: 1,
              delay: i * 0.08,
              repeat: -1,
              repeatDelay: 0.4,
              ease: "power2.out",
            }
          );
        });
      } else {
        gsap.killTweensOf(sparkleNodes);
        gsap.set(sparkleNodes, { opacity: 0, x: 0, y: 0, scale: 0 });
      }
    }

    return () => {
      if (heroRef.current) gsap.killTweensOf(heroRef.current);
      if (loadingIconRef.current) gsap.killTweensOf(loadingIconRef.current);
      if (sparkleNodes.length > 0) gsap.killTweensOf(sparkleNodes);
    };
  }, [celebrating, shouldRender, prefersReducedMotion]);

  if (!shouldRender) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      style={{ opacity: 0 }}
    >
      <div ref={cardRef} onClick={(e) => e.stopPropagation()} className="relative" style={{ opacity: 0 }}>
        <Card className="w-80 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700">
          <CardContent className="p-6 text-center space-y-4">
            <div className="relative">
              <div ref={heroRef} className="text-6xl mb-2">
                {celebrating ? <PartyPopper className="w-14 h-14 text-orange-500" /> : habit.emoji}
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    ref={(node) => {
                      sparkleRefs.current[i] = node;
                    }}
                    className="absolute text-yellow-400"
                    style={{ opacity: 0 }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
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
                <span className="text-gray-600 dark:text-gray-400">Level Progress</span>
                <span className="font-medium">100%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: "100%" }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Surplus progress carries over to the next level
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
                  <div ref={loadingIconRef}>
                    <Star className="w-4 h-4" />
                  </div>
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
      </div>
    </div>
  );
}
