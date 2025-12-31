export type RankDefinition = {
  name: string;
  minLevel: number;
  description: string;
  emphasis?: string;
};

export type RankInfo = {
  level: number;
  currentRank: RankDefinition;
  nextRank?: RankDefinition;
  progressToNext: number; // 0-1
  ranks: RankDefinition[];
};

// Ordered ladder used by the System/Status window and Achievements tab
export const rankDefinitions: RankDefinition[] = [
  {
    name: "Novice",
    minLevel: 1,
    description: "Getting initiated into the system and establishing a baseline routine.",
  },
  {
    name: "Apprentice",
    minLevel: 4,
    description: "Building consistency with the fundamentals and refining daily rhythm.",
  },
  {
    name: "Adept",
    minLevel: 8,
    description: "Habits feel natural, focus improves, and streaks start to stack.",
  },
  {
    name: "Expert",
    minLevel: 12,
    description: "Deliberate training across multiple attributes with reliable execution.",
  },
  {
    name: "Master",
    minLevel: 18,
    description: "Elite consistency with challenging habits and long streak protection.",
  },
  {
    name: "Legend",
    minLevel: 24,
    description: "Mythic discipline; leading by example and sustaining momentum.",
  },
];

export function getRankForLevel(level: number): RankDefinition {
  const safeLevel = Number.isFinite(level) ? level : 1;
  const sorted = [...rankDefinitions].sort((a, b) => a.minLevel - b.minLevel);
  let current = sorted[0];

  for (const rank of sorted) {
    if (safeLevel >= rank.minLevel) {
      current = rank;
    } else {
      break;
    }
  }

  return current;
}

export function getNextRank(level: number): RankDefinition | undefined {
  const sorted = [...rankDefinitions].sort((a, b) => a.minLevel - b.minLevel);
  return sorted.find((rank) => rank.minLevel > level);
}

export function getRankInfo(level: number): RankInfo {
  const currentRank = getRankForLevel(level);
  const nextRank = getNextRank(level);
  const span = nextRank ? Math.max(1, nextRank.minLevel - currentRank.minLevel) : 1;
  const progressToNext = nextRank
    ? Math.min(1, Math.max(0, (level - currentRank.minLevel) / span))
    : 1;

  return {
    level,
    currentRank,
    nextRank,
    progressToNext,
    ranks: rankDefinitions,
  };
}
