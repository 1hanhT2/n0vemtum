import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Zap, Brain, Activity, Eye, Crown } from "lucide-react";
import { motion } from "framer-motion";

export function PlayerStatus() {
  const { user } = useAuth();

  // Safe defaults if fields are missing (though schema update should handle this)
  const level = (user as any)?.level || 1;
  const xp = (user as any)?.xp || 0;
  const xpToNext = level * 100; // Simple XP curve
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
    { key: 'strength', label: 'STR', icon: Shield, color: 'text-red-400' },
    { key: 'agility', label: 'AGI', icon: Zap, color: 'text-yellow-400' },
    { key: 'intelligence', label: 'INT', icon: Brain, color: 'text-blue-400' },
    { key: 'vitality', label: 'VIT', icon: Activity, color: 'text-green-400' },
    { key: 'perception', label: 'PER', icon: Eye, color: 'text-purple-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden text-slate-100">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <Crown className="w-32 h-32" />
        </div>

        <CardHeader className="pb-2 border-b border-slate-800/50">
          <div className="flex justify-between items-end">
            <div>
               <div className="text-xs font-mono text-teal-400 tracking-widest uppercase mb-1">Status Window</div>
               <CardTitle className="font-serif text-2xl text-white tracking-wide flex items-center gap-2">
                 {(user as any)?.username || "Hunter"}
                 <span className="text-sm font-sans font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                   {userClass}
                 </span>
               </CardTitle>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Level</div>
              <div className="text-3xl font-bold text-teal-400 font-mono leading-none">{level}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* XP Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>EXP</span>
              <span>{xp} / {xpToNext}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-600 to-teal-400"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             {statConfig.map((stat) => (
               <div key={stat.key} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center justify-between group hover:border-teal-500/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm font-mono text-slate-300">{stat.label}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{(stats as any)[stat.key] || 10}</span>
               </div>
             ))}
          </div>

          <div className="pt-2 border-t border-slate-800/50">
             <div className="text-xs text-center text-slate-500 font-mono uppercase tracking-widest">
                System Active
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
