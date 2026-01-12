import type { Habit, DailyEntry, Achievement, Streak, SkillPointHistory } from "@shared/schema";
import type { RankInfo } from "@shared/ranks";
import { getRankInfo, rankDefinitions } from "@shared/ranks";

export const mockHabits: Habit[] = [
  {
    id: 1,
    name: "Morning Exercise",
    emoji: "🏃‍♂️",
    tags: ["STR", "VIT"],
    userId: "guest",
    order: 1,
    isActive: true,
    level: 5,
    experience: 245,
    experienceToNext: 355,
    streak: 7,
    longestStreak: 14,
    completionRate: 85.5,
    totalCompletions: 42,
    tier: "Bronze",
    badges: ["first_completion", "week_warrior", "streak_starter"],
    difficultyRating: 4,
    aiAnalysis: "Physical activities require consistent energy and motivation. Weather, fatigue, and schedule conflicts can create barriers.",
    lastCompleted: "2025-01-22",
    lastDecayAt: null,
    lastAnalyzed: new Date("2025-01-20"),
    createdAt: new Date("2024-12-01"),
  },
  {
    id: 2,
    name: "Read 30 Minutes",
    emoji: "📚",
    tags: ["INT"],
    userId: "guest",
    order: 2,
    isActive: true,
    level: 3,
    experience: 180,
    experienceToNext: 220,
    streak: 12,
    longestStreak: 18,
    completionRate: 92.3,
    totalCompletions: 56,
    tier: "Silver",
    badges: ["first_completion", "week_warrior", "month_master"],
    difficultyRating: 3,
    aiAnalysis: "Learning-based habits need sustained attention and time commitment. Progress may feel slow initially but compounds over time.",
    lastCompleted: "2025-01-22",
    lastDecayAt: null,
    lastAnalyzed: new Date("2025-01-19"),
    createdAt: new Date("2024-11-15"),
  },
  {
    id: 3,
    name: "Drink 8 Glasses Water",
    emoji: "💧",
    tags: ["VIT"],
    userId: "guest",
    order: 3,
    isActive: true,
    level: 8,
    experience: 420,
    experienceToNext: 180,
    streak: 25,
    longestStreak: 31,
    completionRate: 96.8,
    totalCompletions: 89,
    tier: "Gold",
    badges: ["first_completion", "week_warrior", "month_master", "streak_starter"],
    difficultyRating: 2,
    aiAnalysis: "Basic maintenance habits are low-effort but require consistent memory and routine integration.",
    lastCompleted: "2025-01-22",
    lastDecayAt: null,
    lastAnalyzed: new Date("2025-01-18"),
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 4,
    name: "Meditate",
    emoji: "🧘‍♀️",
    tags: ["PER", "INT"],
    userId: "guest",
    order: 4,
    isActive: true,
    level: 4,
    experience: 210,
    experienceToNext: 290,
    streak: 5,
    longestStreak: 21,
    completionRate: 78.4,
    totalCompletions: 34,
    tier: "Bronze",
    badges: ["first_completion", "streak_starter"],
    difficultyRating: 3,
    aiAnalysis: "Mindfulness practices require mental discipline and consistent scheduling. Stress and busy schedules can interfere.",
    lastCompleted: "2025-01-21",
    lastDecayAt: null,
    lastAnalyzed: new Date("2025-01-17"),
    createdAt: new Date("2024-12-10"),
  },
  {
    id: 5,
    name: "Practice Guitar",
    emoji: "🎸",
    tags: ["AGI", "INT"],
    userId: "guest",
    order: 5,
    isActive: true,
    level: 2,
    experience: 95,
    experienceToNext: 105,
    streak: 3,
    longestStreak: 8,
    completionRate: 65.2,
    totalCompletions: 18,
    tier: "Novice",
    badges: ["first_completion"],
    difficultyRating: 4,
    aiAnalysis: "Skill-based habits need regular practice and patience. Progress plateaus and finger fatigue can be discouraging.",
    lastCompleted: "2025-01-20",
    lastDecayAt: null,
    lastAnalyzed: new Date("2025-01-16"),
    createdAt: new Date("2025-01-01"),
  }
];

export const mockDailyEntry: DailyEntry = {
  id: 1,
  date: "2025-01-23",
  userId: "guest",
  habitCompletions: {
    "1": true,
    "2": true,
    "3": true,
    "4": false,
    "5": false,
  },
  subtaskCompletions: {},
  punctualityScore: 4,
  adherenceScore: 4,
  notes: "Great day! Managed to complete most habits despite a busy schedule.",
  isCompleted: true,
  completedAt: new Date("2025-01-23T20:15:00Z"),
  createdAt: new Date("2025-01-23"),
  updatedAt: new Date("2025-01-23"),
};

export const mockAchievements: Achievement[] = [
  {
    id: 1,
    userId: "guest",
    type: "streak",
    name: "First Steps",
    description: "Complete your first day",
    badge: "sprout",
    requirement: 1,
    isUnlocked: true,
    unlockedAt: new Date("2024-10-20"),
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 2,
    userId: "guest",
    type: "streak",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    badge: "shield",
    requirement: 7,
    isUnlocked: true,
    unlockedAt: new Date("2024-11-01"),
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 3,
    userId: "guest",
    type: "completion",
    name: "Flow State",
    description: "Finish at least 85% of habits in a day",
    badge: "infinity",
    requirement: 85,
    isUnlocked: false,
    unlockedAt: null,
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 4,
    userId: "guest",
    type: "milestone",
    name: "Half Century",
    description: "Complete 50 total days",
    badge: "sun",
    requirement: 50,
    isUnlocked: false,
    unlockedAt: null,
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 5,
    userId: "guest",
    type: "consistency",
    name: "Reflection Master",
    description: "Complete 5 weekly reviews",
    badge: "book",
    requirement: 5,
    isUnlocked: false,
    unlockedAt: null,
    createdAt: new Date("2024-10-20"),
  },
];

export const mockStreaks: Streak[] = [
  {
    id: 1,
    userId: "guest",
    type: "daily_completion",
    currentStreak: 5,
    longestStreak: 18,
    lastActiveDate: "2025-01-22",
    createdAt: new Date("2024-10-20"),
    updatedAt: new Date("2025-01-22"),
  },
];

export const mockSkillPointsHistory: SkillPointHistory[] = [
  {
    id: 1,
    userId: "guest",
    tag: "STR",
    delta: 0.6,
    value: 11.8,
    reason: "habit-completion",
    date: "2025-01-21",
    createdAt: new Date("2025-01-21T08:15:00Z"),
  },
  {
    id: 2,
    userId: "guest",
    tag: "INT",
    delta: 1.0,
    value: 13.4,
    reason: "habit-completion",
    date: "2025-01-20",
    createdAt: new Date("2025-01-20T18:45:00Z"),
  },
  {
    id: 3,
    userId: "guest",
    tag: "VIT",
    delta: -0.3,
    value: 12.1,
    reason: "habit-decay",
    date: "2025-01-19",
    createdAt: new Date("2025-01-19T06:30:00Z"),
  },
  {
    id: 4,
    userId: "guest",
    tag: "AGI",
    delta: 0.6,
    value: 11.2,
    reason: "habit-completion",
    date: "2025-01-18",
    createdAt: new Date("2025-01-18T19:10:00Z"),
  },
  {
    id: 5,
    userId: "guest",
    tag: "PER",
    delta: 1.0,
    value: 12.7,
    reason: "tier-promotion",
    date: "2025-01-17",
    createdAt: new Date("2025-01-17T14:05:00Z"),
  },
];

export function getMockHabits(): Habit[] {
  return mockHabits;
}

export function getMockDailyEntry(date: string): DailyEntry | undefined {
  if (date === "2025-01-23") {
    return mockDailyEntry;
  }
  return undefined;
}

export function getMockAchievements(): Achievement[] {
  return mockAchievements;
}

export function getMockStreaks(): Streak[] {
  return mockStreaks;
}

export function getMockStreak(type: string): Streak | undefined {
  return mockStreaks.find(s => s.type === type);
}

export function getMockSkillPointsHistory(startDate?: string, endDate?: string): SkillPointHistory[] {
  return mockSkillPointsHistory.filter((entry) => {
    if (startDate && entry.date < startDate) return false;
    if (endDate && entry.date > endDate) return false;
    return true;
  });
}

const mockRankLevel = 9;
const mockRankInfo: RankInfo = {
  ...getRankInfo(mockRankLevel),
  ranks: rankDefinitions,
  level: mockRankLevel,
};

export function getMockRankInfo(): RankInfo {
  return mockRankInfo;
}
