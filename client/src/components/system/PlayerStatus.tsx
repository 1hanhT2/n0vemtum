import { useAuth } from "@/hooks/useAuth";
import { Shield, Zap, Brain, Activity, Eye, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function PlayerStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: progress } = useQuery<{ level: number; xp: number; xpToNext: number }>({
    queryKey: ["/api/user/progress"],
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: challengesData, isLoading: challengesLoading, isError: challengesError } = useQuery<any>({
    queryKey: ["/api/challenges"],
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const response = await apiRequest("/api/challenges");
      return response.json();
    },
  });

  const normalizedChallenges = useMemo(() => {
    return (challengesData?.challenges || []).map((challenge: any, idx: number) => {
      if (typeof challenge === "string") {
        return { key: challenge, label: challenge, xp: 15, completed: false, id: idx + 1 };
      }
      if (typeof challenge === "object" && challenge !== null) {
        const label = `${challenge.emoji ? `${challenge.emoji} ` : ""}${challenge.name || challenge.title || "New challenge"}`;
        const xp =
          Number.isFinite(Number(challenge.xp)) && Number(challenge.xp) > 0
            ? Math.round(Number(challenge.xp))
            : 15;
        const id = typeof challenge.id === "number" ? challenge.id : idx + 1;
        const key = `${id}-${label}-${xp}`;
        return { key, label, xp, completed: !!challenge.completed, id };
      }
      return { key: `${idx}`, label: "Challenge incoming...", xp: 10, completed: false, id: idx + 1 };
    });
  }, [challengesData]);

  const completeChallenge = useMutation({
    mutationFn: async ({ id, completed }: { id: number | string; completed: boolean }) => {
      const response = await apiRequest(`/api/challenges/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.challenges) {
        queryClient.setQueryData(["/api/challenges"], (prev: any) => ({
          ...(prev || {}),
          challenges: data.challenges,
          date: data.date || prev?.date,
        }));
      }
      if (data?.progress) {
        queryClient.setQueryData(["/api/user/progress"], data.progress);
        queryClient.setQueryData(["/api/auth/user"], (oldUser: any) => {
          if (!oldUser) return oldUser;
          return { ...oldUser, level: data.progress.level, xp: data.progress.xp };
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Challenge update failed",
        description: error?.message || "Could not update challenge.",
        variant: "destructive",
      });
    },
  });

  const reshuffleChallenges = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/challenges/reshuffle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.challenges) {
        queryClient.setQueryData(["/api/challenges"], data);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Could not reshuffle",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
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
      className="space-y-4"
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

      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-mono">Challenges</div>
            <div className="text-sm text-foreground/90">AI one-off tasks to boost today</div>
          </div>
        </div>
        {!user && (
          <p className="text-sm text-muted-foreground">Sign in to get personalized challenges.</p>
        )}
        {user && (
          <>
            {challengesLoading && <p className="text-sm text-muted-foreground">Fetching fresh challenges…</p>}
            {challengesError && <p className="text-sm text-muted-foreground">Couldn&apos;t load challenges right now.</p>}
            {!challengesLoading && !challengesError && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Daily challenges refresh each day.</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => reshuffleChallenges.mutate()}
                  disabled={reshuffleChallenges.isPending}
                >
                  {reshuffleChallenges.isPending ? "Shuffling…" : "Reshuffle"}
                </Button>
              </div>
            )}
            {!challengesLoading && !challengesError && (
              <ul className="space-y-2">
                {normalizedChallenges.slice(0, 3).map((challenge) => {
                  const checked = !!challenge.completed;
                  return (
                    <li
                      key={challenge.key}
                      className={`text-sm text-foreground/90 border rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                        checked ? "bg-green-500/10 border-green-500/60" : "bg-muted/50 border-border/60"
                      }`}
                      onClick={() => completeChallenge.mutate({ id: challenge.id, completed: !checked })}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="w-full flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => completeChallenge.mutate({ id: challenge.id, completed: !checked })}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className={checked ? "line-through text-muted-foreground" : ""}>
                            {challenge.label}
                          </span>
                        </div>
                        <span className={`text-xs font-mono ${checked ? "text-green-600" : "text-primary"}`}>
                          +{challenge.xp} XP
                        </span>
                      </div>
                    </li>
                  );
                })}
                {normalizedChallenges.length === 0 && (
                  <li className="text-sm text-muted-foreground">No suggestions yet—complete a habit to get tailored challenges.</li>
                )}
              </ul>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
