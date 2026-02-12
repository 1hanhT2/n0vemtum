import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Star, Trophy, Shield, Award } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-gsap";

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
  diamond: Crown,
};

const tierColors = {
  bronze: "from-orange-400 to-orange-600",
  silver: "from-slate-400 to-slate-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-gray-400 to-gray-600",
  diamond: "from-purple-400 to-purple-600",
};

export function TierPromotionNotification({
  oldTier,
  newTier,
  habit,
  show,
  onClose,
}: TierPromotionNotificationProps) {
  const [celebrating, setCelebrating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (show) {
      setCelebrating(true);
      const timer = setTimeout(() => {
        setCelebrating(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  useEffect(() => {
    if (!show || !overlayRef.current || !cardRef.current) return;
    if (prefersReducedMotion) {
      gsap.set(overlayRef.current, { opacity: 1 });
      gsap.set(cardRef.current, { opacity: 1, y: 0, rotateY: 0 });
      return;
    }

    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" });
    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 50, rotateY: -90 },
      { opacity: 1, y: 0, rotateY: 0, duration: 0.5, ease: "back.out(1.4)" },
      0.02
    );

    return () => {
      tl.kill();
      gsap.killTweensOf(overlayRef.current);
      gsap.killTweensOf(cardRef.current);
    };
  }, [show, prefersReducedMotion]);

  useEffect(() => {
    if (!show) return;

    const particles = particleRefs.current.filter(Boolean) as HTMLDivElement[];
    if (prefersReducedMotion) {
      if (iconRef.current) gsap.set(iconRef.current, { scale: 1, rotate: 0 });
      if (particles.length > 0) gsap.set(particles, { opacity: 1, scale: 1, x: 0, y: 0 });
      return;
    }

    if (iconRef.current) {
      if (celebrating) {
        gsap.to(iconRef.current, {
          scale: 1.2,
          rotate: 360,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      } else {
        gsap.killTweensOf(iconRef.current);
        gsap.set(iconRef.current, { scale: 1, rotate: 0 });
      }
    }

    if (particles.length > 0) {
      if (celebrating) {
        particles.forEach((node, i) => {
          const angle = (i * Math.PI * 2) / particles.length;
          gsap.fromTo(
            node,
            { scale: 0, opacity: 0, x: 0, y: 0 },
            {
              scale: 1,
              opacity: 1,
              x: Math.cos(angle) * 60,
              y: Math.sin(angle) * 60,
              duration: 1.1,
              delay: i * 0.08,
              repeat: -1,
              repeatDelay: 0.8,
              ease: "power2.out",
            }
          );
        });
      } else {
        gsap.killTweensOf(particles);
        gsap.set(particles, { scale: 0, opacity: 0, x: 0, y: 0 });
      }
    }

    return () => {
      if (iconRef.current) gsap.killTweensOf(iconRef.current);
      if (particles.length > 0) gsap.killTweensOf(particles);
    };
  }, [show, celebrating, prefersReducedMotion]);

  if (!show) return null;

  const NewTierIcon = tierIcons[newTier.toLowerCase() as keyof typeof tierIcons] || Crown;
  const tierGradient = tierColors[newTier.toLowerCase() as keyof typeof tierColors] || "from-purple-400 to-purple-600";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      style={{ opacity: 0 }}
    >
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="relative"
        style={{ opacity: 0, transform: "perspective(1000px)" }}
      >
        <Card className={`w-96 bg-gradient-to-br ${tierGradient} border-0 text-white`}>
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div ref={iconRef} className="text-8xl mb-4">
                <NewTierIcon className="w-20 h-20 mx-auto text-white drop-shadow-lg" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    ref={(node) => {
                      particleRefs.current[i] = node;
                    }}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{ opacity: 0, scale: 0 }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                Tier Promotion!
              </h2>

              <div className="space-y-2">
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
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-white/80 text-sm leading-relaxed">
                Your consistency and dedication have earned you a promotion to {newTier} tier!
                Keep up the excellent work building this habit.
              </p>
            </div>

            <div>
              <Button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-2"
                variant="outline"
              >
                Awesome!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
