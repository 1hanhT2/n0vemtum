import { useAuth } from "@/hooks/useAuth";
import { Shield, Zap, Brain, Activity, Eye, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export function PlayerStatus() {
  const { user } = useAuth();
  const { data: progress } = useQuery<{ level: number; xp: number; xpToNext: number }>({
    queryKey: ["/api/user/progress"],
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Safe defaults if fields are missing (though schema update should handle this)
  const level = progress?.level ?? (user as any)?.level ?? 1;
  const xp = progress?.xp ?? (user as any)?.xp ?? 0;
  const xpToNext = progress?.xpToNext ?? Math.max(1, level) * 100; // Simple XP curve
  const xpPercentage = Math.min(100, (xp / xpToNext) * 100);
  const userClass = (user as any)?.class || "Novice";

  const stats = (user as any)?.stats || {
    strength: 10,
    agility: 10,
    intelligence: 10,
    vitality: 10,
    perception: 10
  };

  const statConfig = [
    { key: 'strength', label: 'STR', icon: Shield, color: 'text-red-500 dark:text-red-400' },
    { key: 'agility', label: 'AGI', icon: Zap, color: 'text-yellow-500 dark:text-yellow-400' },
    { key: 'intelligence', label: 'INT', icon: Brain, color: 'text-blue-500 dark:text-blue-400' },
    { key: 'vitality', label: 'VIT', icon: Activity, color: 'text-green-500 dark:text-green-400' },
    { key: 'perception', label: 'PER', icon: Eye, color: 'text-purple-500 dark:text-purple-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="panel bg-card text-foreground shadow-sm">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <Crown className="w-32 h-32" />
        </div>

        <div className="p-6 pb-2 border-b border-border relative z-10">
          <div className="flex justify-between items-end">
            <div>
               <div className="text-xs font-mono text-teal-600 dark:text-[#89f7d8] tracking-widest uppercase mb-1">Status Window</div>
               <div className="font-serif dark:font-inter font-bold text-2xl tracking-wide flex items-center gap-2">
                 {(user as any)?.username || "Hunter"}
                 <span className="text-sm font-mono font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                   {userClass}
                 </span>
               </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider text-[10px] mb-1">Level</div>
              <div className="text-3xl font-bold text-teal-600 dark:text-[#89f7d8] font-mono leading-none">{level}</div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-6 space-y-6 relative z-10">
          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>EXP</span>
              <span>{xp} / {xpToNext}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 dark:from-[#89f7d8] dark:to-[#7aa7ff]"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             {statConfig.map((stat) => (
               <div key={stat.key} className="bg-muted/40 dark:bg-muted rounded-lg p-3 border border-border flex items-center justify-between group hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm font-mono text-foreground/80">{stat.label}</span>
                  </div>
                  <span className="font-mono font-bold">{(stats as any)[stat.key] || 10}</span>
               </div>
             ))}
          </div>

          <div className="pt-4 border-t border-border">
             <div className="text-xs text-center text-muted-foreground font-mono uppercase tracking-widest">
                System Active
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
