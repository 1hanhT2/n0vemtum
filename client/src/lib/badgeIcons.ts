import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Compass,
  Crown,
  Dumbbell,
  Flag,
  Flame,
  Gem,
  Infinity,
  Medal,
  Mountain,
  Palette,
  PenTool,
  Rocket,
  Shield,
  Sparkles as SparklesLucide,
  Sprout,
  Star,
  Sun,
  Sunrise,
  Sword,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

const badgeIconMap: Record<string, LucideIcon> = {
  sprout: Sprout,
  spark: Zap,
  shield: Shield,
  rocket: Rocket,
  mountain: Mountain,
  muscle: Dumbbell,
  star: Star,
  crown: Crown,
  target: Target,
  sparkles: SparklesLucide,
  palette: Palette,
  infinity: Infinity,
  flag: Flag,
  book: BookOpen,
  sunrise: Sunrise,
  sun: Sun,
  compass: Compass,
  pen: PenTool,
  medal: Medal,
  trophy: Trophy,
  // Legacy badge keys
  first_completion: Target,
  week_warrior: Sword,
  month_master: Crown,
  streak_starter: Flame,
  consistency_king: Gem,
  habit_hero: Shield,
  dedication_demon: SparklesLucide,
  persistence_pro: Dumbbell,
  award: Medal,
};

const emojiAlias: Record<string, string> = {
  "🎯": "first_completion",
  "⚔️": "week_warrior",
  "👑": "crown",
  "🔥": "spark",
  "💎": "consistency_king",
  "🦸": "habit_hero",
  "😈": "dedication_demon",
  "💪": "muscle",
  "🏆": "trophy",
  "🌱": "sprout",
  "⚡": "spark",
  "🛡️": "shield",
  "🚀": "rocket",
  "🏔️": "mountain",
  "🌟": "star",
  "✨": "sparkles",
  "🎨": "palette",
  "♾️": "infinity",
  "🏁": "flag",
  "📖": "book",
  "🌅": "sunrise",
  "☀️": "sun",
  "🧭": "compass",
  "🖋️": "pen",
  "🥇": "medal",
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
  platinum: SparklesLucide,
  diamond: Gem,
};

export const resolveTierIcon = (tier?: string): LucideIcon => {
  return tierIconMap[tier ?? ""] ?? Shield;
};
