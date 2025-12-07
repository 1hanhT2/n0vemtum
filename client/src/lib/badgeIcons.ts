import type { LucideIcon } from "lucide-react";
import {
  Award,
  Crown,
  Dumbbell,
  Flame,
  Gem,
  Medal,
  Shield,
  Sparkles,
  Sword,
  Target,
} from "lucide-react";

const badgeIconMap: Record<string, LucideIcon> = {
  first_completion: Target,
  week_warrior: Sword,
  month_master: Crown,
  streak_starter: Flame,
  consistency_king: Gem,
  habit_hero: Shield,
  dedication_demon: Sparkles,
  persistence_pro: Dumbbell,
  award: Medal,
};

const emojiAlias: Record<string, string> = {
  "🎯": "first_completion",
  "⚔️": "week_warrior",
  "👑": "month_master",
  "🔥": "streak_starter",
  "💎": "consistency_king",
  "🦸": "habit_hero",
  "😈": "dedication_demon",
  "💪": "persistence_pro",
  "🏆": "award",
};

export const getBadgeIconKey = (badge: string) => {
  if (badgeIconMap[badge]) return badge;
  if (emojiAlias[badge]) return emojiAlias[badge];
  return "award";
};

export const resolveBadgeIcon = (badge: string): LucideIcon => {
  return badgeIconMap[getBadgeIconKey(badge)] ?? Medal;
};

const tierIconMap: Record<string, LucideIcon> = {
  bronze: Shield,
  silver: Shield,
  gold: Crown,
  platinum: Sparkles,
  diamond: Gem,
};

export const resolveTierIcon = (tier?: string): LucideIcon => {
  return tierIconMap[tier ?? ""] ?? Shield;
};
