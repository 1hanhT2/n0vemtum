import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyEntries = pgTable("daily_entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  habitCompletions: jsonb("habit_completions").notNull().default({}), // { habitId: boolean }
  punctualityScore: integer("punctuality_score").notNull().default(3),
  adherenceScore: integer("adherence_score").notNull().default(3),
  notes: text("notes").default(""),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weeklyReviews = pgTable("weekly_reviews", {
  id: serial("id").primaryKey(),
  weekStartDate: text("week_start_date").notNull().unique(), // YYYY-MM-DD format (Monday)
  accomplishment: text("accomplishment").default(""),
  breakdown: text("breakdown").default(""),
  adjustment: text("adjustment").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'streak', 'completion', 'consistency', 'milestone'
  name: text("name").notNull(),
  description: text("description").notNull(),
  badge: text("badge").notNull(), // emoji for the badge
  requirement: integer("requirement").notNull(), // numeric requirement (days, count, etc.)
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'daily_completion', 'habit_specific', 'weekly_review'
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
});

export const insertDailyEntrySchema = createInsertSchema(dailyEntries).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklyReviewSchema = createInsertSchema(weeklyReviews).omit({
  id: true,
  createdAt: true,
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertStreakSchema = createInsertSchema(streaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;
export type DailyEntry = typeof dailyEntries.$inferSelect;

export type InsertWeeklyReview = z.infer<typeof insertWeeklyReviewSchema>;
export type WeeklyReview = typeof weeklyReviews.$inferSelect;

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertStreak = z.infer<typeof insertStreakSchema>;
export type Streak = typeof streaks.$inferSelect;

export type User = {
  id: number;
  username: string;
};
