import type { Habit, DailyEntry, Achievement, Streak } from "@shared/schema";

export const mockHabits: Habit[] = [
  {
    id: 1,
    name: "Morning Exercise",
    emoji: "🏃‍♂️",
    tags: ["STR", "VIT"],
    userId: "guest",
    level: 5,
    experience: 245,
    experienceToNext: 355,
    masteryPoints: 120,
    streak: 7,
    longestStreak: 14,
    completionRate: 85.5,
    totalCompletions: 42,
    tier: "Bronze",
    badges: ["first_completion", "week_warrior", "streak_starter"],
    difficultyRating: 4,
    aiAnalysis: "Physical activities require consistent energy and motivation. Weather, fatigue, and schedule conflicts can create barriers.",
    lastCompleted: "2025-01-22",
    lastAnalyzed: "2025-01-20",
    createdAt: new Date("2024-12-01"),
  },
  {
    id: 2,
    name: "Read 30 Minutes",
    emoji: "📚",
    tags: ["INT"],
    userId: "guest",
    level: 3,
    experience: 180,
    experienceToNext: 220,
    masteryPoints: 75,
    streak: 12,
    longestStreak: 18,
    completionRate: 92.3,
    totalCompletions: 56,
    tier: "Silver",
    badges: ["first_completion", "week_warrior", "month_master"],
    difficultyRating: 3,
    aiAnalysis: "Learning-based habits need sustained attention and time commitment. Progress may feel slow initially but compounds over time.",
    lastCompleted: "2025-01-22",
    lastAnalyzed: "2025-01-19",
    createdAt: new Date("2024-11-15"),
  },
  {
    id: 3,
    name: "Drink 8 Glasses Water",
    emoji: "💧",
    tags: ["VIT"],
    userId: "guest",
    level: 8,
    experience: 420,
    experienceToNext: 180,
    masteryPoints: 200,
    streak: 25,
    longestStreak: 31,
    completionRate: 96.8,
    totalCompletions: 89,
    tier: "Gold",
    badges: ["first_completion", "week_warrior", "month_master", "streak_starter"],
    difficultyRating: 2,
    aiAnalysis: "Basic maintenance habits are low-effort but require consistent memory and routine integration.",
    lastCompleted: "2025-01-22",
    lastAnalyzed: "2025-01-18",
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 4,
    name: "Meditate",
    emoji: "🧘‍♀️",
    tags: ["PER", "INT"],
    userId: "guest",
    level: 4,
    experience: 210,
    experienceToNext: 290,
    masteryPoints: 95,
    streak: 5,
    longestStreak: 21,
    completionRate: 78.4,
    totalCompletions: 34,
    tier: "Bronze",
    badges: ["first_completion", "streak_starter"],
    difficultyRating: 3,
    aiAnalysis: "Mindfulness practices require mental discipline and consistent scheduling. Stress and busy schedules can interfere.",
    lastCompleted: "2025-01-21",
    lastAnalyzed: "2025-01-17",
    createdAt: new Date("2024-12-10"),
  },
  {
    id: 5,
    name: "Practice Guitar",
    emoji: "🎸",
    tags: ["AGI", "INT"],
    userId: "guest",
    level: 2,
    experience: 95,
    experienceToNext: 105,
    masteryPoints: 35,
    streak: 3,
    longestStreak: 8,
    completionRate: 65.2,
    totalCompletions: 18,
    tier: "Novice",
    badges: ["first_completion"],
    difficultyRating: 4,
    aiAnalysis: "Skill-based habits need regular practice and patience. Progress plateaus and finger fatigue can be discouraging.",
    lastCompleted: "2025-01-20",
    lastAnalyzed: "2025-01-16",
    createdAt: new Date("2025-01-01"),
  }
];

export const mockDailyEntry: DailyEntry = {
  id: 1,
  date: "2025-01-23",
  userId: "guest",
  completedHabits: [1, 2, 3],
  punctualityScore: 4,
  adherenceScore: 4,
  notes: "Great day! Managed to complete most habits despite a busy schedule.",
  motivationalMessage: "You're building incredible momentum! Your consistency is paying off - keep this energy going!",
  createdAt: new Date("2025-01-23"),
  updatedAt: new Date("2025-01-23"),
};

export const mockAchievements: Achievement[] = [
  {
    id: 1,
    userId: "guest",
    title: "First Steps",
    description: "Complete your first habit",
    category: "milestone",
    isUnlocked: true,
    unlockedAt: new Date("2024-10-20"),
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 2,
    userId: "guest",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    category: "streak",
    isUnlocked: true,
    unlockedAt: new Date("2024-11-01"),
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 3,
    userId: "guest",
    title: "Consistency King",
    description: "Maintain a 30-day streak",
    category: "streak",
    isUnlocked: false,
    unlockedAt: null,
    createdAt: new Date("2024-10-20"),
  },
  {
    id: 4,
    userId: "guest",
    title: "Level Master",
    description: "Reach level 10 in any habit",
    category: "level",
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
