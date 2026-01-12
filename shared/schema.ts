import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const habitTagOptions = ["STR", "AGI", "INT", "VIT", "PER"] as const;
export const habitTagSchema = z.enum(habitTagOptions);
export const habitTagsSchema = z.array(habitTagSchema).max(3);
export const goalPeriodOptions = ["daily", "weekly", "monthly"] as const;
export const goalPeriodSchema = z.enum(goalPeriodOptions);
export const chatRoleSchema = z.enum(["user", "assistant", "system"]);

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // RPG System Fields
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  class: varchar("class").default("Novice"),
  stats: jsonb("stats").notNull().default({
    strength: 10,
    agility: 10,
    intelligence: 10,
    vitality: 10,
    perception: 10
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().default("default"),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  tags: text("tags").array().notNull().default([]),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  difficultyRating: integer("difficulty_rating").notNull().default(3),
  aiAnalysis: text("ai_analysis"),
  lastAnalyzed: timestamp("last_analyzed"),
  // Gamification fields
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  experienceToNext: integer("experience_to_next").notNull().default(100),
  streak: integer("streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  completionRate: integer("completion_rate").notNull().default(0), // percentage
  totalCompletions: integer("total_completions").notNull().default(0),
  tier: text("tier").notNull().default("bronze"), // bronze, silver, gold, platinum, diamond
  badges: text("badges").array().notNull().default([]), // earned badges for this habit
  lastCompleted: text("last_completed"), // YYYY-MM-DD
  lastDecayAt: text("last_decay_at"), // YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow(),
});

export const skillPointsHistory = pgTable("skill_points_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  tag: text("tag").notNull(), // STR/AGI/INT/VIT/PER
  delta: real("delta").notNull(),
  value: real("value").notNull(),
  reason: text("reason").notNull().default(""),
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  tag: text("tag").notNull(), // STR/AGI/INT/VIT/PER
  period: text("period").notNull(), // daily/weekly/monthly
  targetCount: integer("target_count").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(), // user/assistant/system
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyEntries = pgTable("daily_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  habitCompletions: jsonb("habit_completions").notNull().default({}), // { habitId: boolean }
  subtaskCompletions: jsonb("subtask_completions").notNull().default({}), // { subtaskId: boolean }
  punctualityScore: integer("punctuality_score").notNull().default(3),
  adherenceScore: integer("adherence_score").notNull().default(3),
  notes: text("notes").default(""),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const weeklyReviews = pgTable("weekly_reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  weekStartDate: text("week_start_date").notNull().unique(), // YYYY-MM-DD format (Monday)
  accomplishment: text("accomplishment").default(""),
  breakdown: text("breakdown").default(""),
  adjustment: text("adjustment").default(""),
  aiInsights: jsonb("ai_insights").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Composite unique constraint for user + key
  index("unique_user_setting").on(table.userId, table.key)
]);

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
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
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'daily_completion', 'habit_specific', 'weekly_review'
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subtasks = pgTable("subtasks", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHabitSchema = createInsertSchema(habits)
  .omit({
    id: true,
    createdAt: true,
    lastAnalyzed: true,
  })
  .extend({
    tags: habitTagsSchema.optional(),
  });

export const insertGoalSchema = createInsertSchema(goals)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    tag: habitTagSchema,
    period: goalPeriodSchema,
  });

export const insertChatMessageSchema = createInsertSchema(chatMessages)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    role: chatRoleSchema,
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

export const insertSubtaskSchema = createInsertSchema(subtasks).omit({
  id: true,
  createdAt: true,
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;
export type SkillPointHistory = typeof skillPointsHistory.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

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

export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;
export type Subtask = typeof subtasks.$inferSelect;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
