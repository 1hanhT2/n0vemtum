import {
  habits,
  skillPointsHistory,
  goals,
  chatMessages,
  dailyEntries,
  weeklyReviews,
  settings,
  achievements,
  streaks,
  users,
  subtasks,
  type Habit,
  type SkillPointHistory,
  type InsertHabit,
  type Goal,
  type InsertGoal,
  type ChatMessage,
  type InsertChatMessage,
  type DailyEntry,
  type InsertDailyEntry,
  type WeeklyReview,
  type InsertWeeklyReview,
  type Setting,
  type InsertSetting,
  type Achievement,
  type InsertAchievement,
  type Streak,
  type InsertStreak,
  type User,
  type UpsertUser,
  type Subtask,
  type InsertSubtask,
} from "@shared/schema";
import { getRankForLevel } from "@shared/ranks";
import { db } from "./db";
import { eq, and, gte, lte, not, desc } from "drizzle-orm";
import { generateHabitSuggestions } from "./ai";
import { getTodayKey as getTodayKeyForZone, getYesterdayKey, normalizeTimeZone } from "@shared/time";

type DbExecutor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserProgress(userId: string): Promise<{ level: number; xp: number; xpToNext: number } | undefined>;
  getSkillPointsHistory(userId: string, startDate?: string, endDate?: string): Promise<SkillPointHistory[]>;

  // Habits
  getHabits(userId: string, timeZone?: string): Promise<Habit[]>;
  getHabitById(id: number, userId: string, timeZone?: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>, userId: string): Promise<Habit>;
  updateHabitDifficulty(id: number, difficulty: number, analysis: string, userId: string): Promise<Habit>;
  deleteHabit(id: number, userId: string): Promise<void>;

  // Subtasks
  getSubtasks(habitId: number, userId: string): Promise<Subtask[]>;
  getSubtaskById(id: number, userId: string): Promise<Subtask | undefined>;
  createSubtask(subtask: InsertSubtask): Promise<Subtask>;
  updateSubtask(id: number, subtask: Partial<InsertSubtask>, userId: string): Promise<Subtask>;
  deleteSubtask(id: number, userId: string): Promise<void>;

  // Gamification
  updateHabitProgress(habitId: number, completed: boolean, date: string, userId?: string, timeZone?: string): Promise<Habit>;
  levelUpHabit(habitId: number, userId: string, timeZone?: string): Promise<Habit>;
  awardBadge(habitId: number, badge: string, userId: string): Promise<Habit>;
  calculateTierPromotion(habitId: number, userId: string): Promise<Habit>;

  // Daily Entries
  getDailyEntry(date: string, userId: string): Promise<DailyEntry | undefined>;
  getDailyEntries(userId: string, startDate?: string, endDate?: string): Promise<DailyEntry[]>;
  createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  updateDailyEntry(date: string, entry: Partial<InsertDailyEntry>, userId: string): Promise<DailyEntry>;

  // Weekly Reviews
  getWeeklyReview(weekStartDate: string, userId: string): Promise<WeeklyReview | undefined>;
  getWeeklyReviews(userId: string): Promise<WeeklyReview[]>;
  getLatestWeeklyReview(userId: string): Promise<WeeklyReview | undefined>;
  createWeeklyReview(review: InsertWeeklyReview): Promise<WeeklyReview>;
  updateWeeklyReview(weekStartDate: string, review: Partial<InsertWeeklyReview>, userId: string): Promise<WeeklyReview>;

  // Settings
  getSetting(key: string, userId: string): Promise<Setting | undefined>;
  getSettings(userId: string): Promise<Setting[]>;
  setSetting(setting: InsertSetting): Promise<Setting>;

  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>, userId: string): Promise<Goal>;
  deleteGoal(id: number, userId: string): Promise<void>;

  // Chat messages
  getChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(userId: string): Promise<void>;

  // Achievements
  getAchievements(userId: string): Promise<Achievement[]>;
  unlockAchievement(id: number, userId: string): Promise<Achievement>;
  initializeAchievements(userId: string): Promise<void>;

  // Streaks
  getStreaks(userId: string): Promise<Streak[]>;
  getStreak(type: string, userId: string): Promise<Streak | undefined>;
  updateStreak(type: string, streak: Partial<InsertStreak>, userId: string): Promise<Streak>;
  calculateStreaks(date: string, userId: string): Promise<void>;

  // Data management
  resetAllData(): Promise<void>;
  resetUserData(userId: string): Promise<void>;

  // Challenges
  getDailyChallenges(userId: string, date?: string, timeZone?: string): Promise<Challenge[]>;
  completeChallenge(id: number, userId: string, completed?: boolean, date?: string, timeZone?: string): Promise<{ challenges: Challenge[]; progress?: { level: number; xp: number; xpToNext: number } }>;
  reshuffleChallenges(userId: string, date?: string, timeZone?: string): Promise<Challenge[]>;
}

export interface Challenge {
  id: number;
  name: string;
  emoji: string;
  xp: number;
  completed: boolean;
  date: string;
  type?: string;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeDefaults();
      this.initialized = true;
    }
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  private challengeSettingKey(date: string) {
    return `daily_challenges_${date}`;
  }

  private normalizeChallenges(raw: any[], date: string): Challenge[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((item, idx) => {
      if (typeof item === "string") {
        return { id: idx + 1, name: item, emoji: "✨", xp: 15, completed: false, date, type: "balanced" };
      }
      if (typeof item === "object" && item !== null) {
        const name = item.name || item.title || "New challenge";
        const emoji = item.emoji || "✨";
        const xpRaw = Number(item.xp);
        const xp = Number.isFinite(xpRaw) ? Math.max(5, Math.min(50, Math.round(xpRaw))) : 15;
        const type = item.type || item.category || "balanced";
        return { id: item.id || idx + 1, name, emoji, xp, completed: false, date, type };
      }
      return { id: idx + 1, name: "New challenge", emoji: "✨", xp: 10, completed: false, date, type: "balanced" };
    });
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Initialize achievements for new or existing users
    console.log(`User upserted: ${user.id}, initializing achievements`);
    await this.initializeAchievements(user.id);

    return user;
  }

  private SKILL_POINTS_BY_DIFFICULTY: Record<number, number> = {
    1: 0.2,
    2: 0.6,
    3: 1.0,
    4: 1.4,
    5: 2.0,
  };
  private HABIT_DECAY_GRACE_DAYS = 1;
  private HABIT_DECAY_MULTIPLIER = 0.25;

  private calculateUserProgressFromStats(stats: Record<string, number>, bonusXp = 0) {
    const baseStats = {
      strength: 10,
      agility: 10,
      intelligence: 10,
      vitality: 10,
      perception: 10,
    };
    const baseTotal = Object.values(baseStats).reduce((sum, value) => sum + value, 0);
    const statTotal = Object.keys(baseStats).reduce((sum, key) => {
      const value = typeof stats[key] === "number" ? stats[key] : baseStats[key as keyof typeof baseStats];
      return sum + value;
    }, 0);
    const totalXp = Math.max(0, Math.round((statTotal - baseTotal) * 10)) + Math.max(0, bonusXp);

    let level = 1;
    let xp = totalXp;
    let xpToNext = Math.max(1, level) * 100;
    while (xp >= xpToNext) {
      xp -= xpToNext;
      level += 1;
      xpToNext = Math.max(1, level) * 100;
    }

    return { level, xp, xpToNext };
  }

  private normalizeStatValue(value: number) {
    return Math.round(value * 10) / 10;
  }

  private addDays(dateStr: string, days: number): string {
    // Parse as UTC to avoid timezone issues
    const date = new Date(dateStr + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split("T")[0];
  }

  private compareDateStrings(a: string, b: string): number {
    // Parse as UTC to avoid timezone issues with date-only strings
    return new Date(a + 'T00:00:00Z').getTime() - new Date(b + 'T00:00:00Z').getTime();
  }

  private maxDateString(a: string, b: string): string {
    return this.compareDateStrings(a, b) >= 0 ? a : b;
  }

  private getSkillPointsForDifficulty(difficulty?: number | null) {
    const ratingRaw = typeof difficulty === "number" ? Math.round(difficulty) : 3;
    const rating = Math.max(1, Math.min(5, ratingRaw));
    return this.SKILL_POINTS_BY_DIFFICULTY[rating] ?? 1.0;
  }

  private async applySkillPointDelta(
    userId: string,
    tags: string[],
    delta: number,
    executor: DbExecutor = db,
    context?: { reason?: string; date?: string; recordEvenIfNoChange?: boolean }
  ): Promise<void> {
    if (!tags?.length || delta === 0) return;

    const [userRecord] = await executor
      .select({
        stats: users.stats,
        bonusXp: users.xp,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userRecord) return;

    type StatKey = "strength" | "agility" | "intelligence" | "vitality" | "perception";
    const statMap: Record<string, StatKey> = {
      STR: "strength",
      AGI: "agility",
      INT: "intelligence",
      VIT: "vitality",
      PER: "perception",
    };

    const nextStats = { ...(userRecord.stats as Record<string, number>) };
    const uniqueTags = Array.from(new Set(tags));
    const historyRows: Array<{
      userId: string;
      tag: string;
      delta: number;
      value: number;
      reason: string;
      date: string;
    }> = [];
    const reason = context?.reason ?? "adjustment";
    const entryDate = context?.date ?? getTodayKeyForZone("UTC");
    const recordEvenIfNoChange = context?.recordEvenIfNoChange ?? false;

    uniqueTags.forEach((tag) => {
      const statKey = statMap[tag];
      if (!statKey) return;
      const current = typeof nextStats[statKey] === "number" ? nextStats[statKey] : 10;
      const updated = this.normalizeStatValue(current + delta);
      const nextValue = Math.max(10, updated);
      const appliedDelta = this.normalizeStatValue(nextValue - current);
      nextStats[statKey] = nextValue;
      
      // Record history if there was a change OR if explicitly requested (for decay at floor)
      if (appliedDelta !== 0 || recordEvenIfNoChange) {
        historyRows.push({
          userId,
          tag,
          delta: appliedDelta !== 0 ? appliedDelta : delta, // Show intended delta if at floor
          value: nextValue,
          reason: appliedDelta === 0 && recordEvenIfNoChange ? `${reason} (at min)` : reason,
          date: entryDate,
        });
      }
    });

    const bonusXp = typeof userRecord.bonusXp === "number" ? Math.max(0, userRecord.bonusXp) : 0;
    const progress = this.calculateUserProgressFromStats(nextStats, bonusXp);

    await executor
      .update(users)
      .set({
        stats: nextStats,
        xp: bonusXp,
        level: progress.level,
        class: getRankForLevel(progress.level).name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    if (historyRows.length > 0) {
      await executor.insert(skillPointsHistory).values(historyRows);
    }
  }

  private async applyHabitDecay(habit: Habit, today: string): Promise<Habit> {
    if (!habit.lastCompleted) return habit;

    const decayEndDate = this.getPreviousDate(today);
    if (this.compareDateStrings(decayEndDate, habit.lastCompleted) <= 0) return habit;

    const decayStartDate = this.addDays(habit.lastCompleted, this.HABIT_DECAY_GRACE_DAYS + 1);
    const nextDecayDate = habit.lastDecayAt ? this.addDays(habit.lastDecayAt, 1) : decayStartDate;
    const effectiveStart = this.maxDateString(decayStartDate, nextDecayDate);

    if (this.compareDateStrings(effectiveStart, decayEndDate) > 0) return habit;

    const decayDays = this.getDaysBetween(effectiveStart, decayEndDate) + 1;
    if (decayDays <= 0) return habit;

    // Wrap all decay operations in a transaction for consistency
    const updated = await db.transaction(async (tx) => {
      if (habit.tags && habit.tags.length > 0) {
        const skillDeltaPerDay = this.getSkillPointsForDifficulty(habit.difficultyRating) * this.HABIT_DECAY_MULTIPLIER;
        
        // Apply decay for each individual day to create proper history entries
        for (let i = 0; i < decayDays; i++) {
          const decayDate = this.addDays(effectiveStart, i);
          await this.applySkillPointDelta(habit.userId, habit.tags, -skillDeltaPerDay, tx, {
            reason: "habit-decay",
            date: decayDate,
            recordEvenIfNoChange: true, // Record decay even when stats are at floor
          });
        }
      }

      const [updatedHabit] = await tx
        .update(habits)
        .set({ lastDecayAt: decayEndDate })
        .where(eq(habits.id, habit.id))
        .returning();

      return updatedHabit;
    });

    return updated || habit;
  }

  async getUserProgress(userId: string): Promise<{ level: number; xp: number; xpToNext: number } | undefined> {
    await this.ensureInitialized();
    const user = await this.getUser(userId);
    if (!user) return undefined;
    const bonusXp = typeof (user as any).xp === "number" ? Math.max(0, (user as any).xp) : 0;
    return this.calculateUserProgressFromStats(user.stats as Record<string, number>, bonusXp);
  }

  async getSkillPointsHistory(userId: string, startDate?: string, endDate?: string): Promise<SkillPointHistory[]> {
    await this.ensureInitialized();
    const whereConditions = [eq(skillPointsHistory.userId, userId)];

    if (startDate) {
      whereConditions.push(gte(skillPointsHistory.date, startDate));
    }

    if (endDate) {
      whereConditions.push(lte(skillPointsHistory.date, endDate));
    }

    return await db
      .select()
      .from(skillPointsHistory)
      .where(and(...whereConditions))
      .orderBy(desc(skillPointsHistory.date), desc(skillPointsHistory.createdAt), desc(skillPointsHistory.id));
  }

  private async initializeDefaults() {
    // Skip initialization for auth-enabled version
    // Initialization will happen per user
  }

  private async initializeDefaultHabits() {
    try {
      const existingHabits = await db.select().from(habits);
      if (existingHabits.length === 0) {
        const defaultHabits = [
          { name: 'Wake up on time', emoji: '⏰', order: 1, isActive: true },
          { name: 'Focus Session #1', emoji: '🎯', order: 2, isActive: true },
          { name: 'Workout/Exercise', emoji: '💪', order: 3, isActive: true },
          { name: 'Focus Session #2', emoji: '🎯', order: 4, isActive: true },
          { name: 'Review & wind-down', emoji: '🌙', order: 5, isActive: true },
        ];

        for (const habit of defaultHabits) {
          await db.insert(habits).values({
            ...habit,
            userId: 'default'
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize default habits:', error);
    }
  }

  // Habits
  async getHabits(userId: string, timeZone = "UTC"): Promise<Habit[]> {
    await this.ensureInitialized();
    const zone = normalizeTimeZone(timeZone);
    const userHabits = await db.select().from(habits).where(eq(habits.userId, userId)).orderBy(habits.order);

    // Check and reset streaks if habits haven't been completed recently
    const today = getTodayKeyForZone(zone);
    const yesterday = getYesterdayKey(zone);

    const updatedHabits = await Promise.all(userHabits.map(async (habit) => {
      let currentHabit = habit;
      // If the habit wasn't completed yesterday or today, the streak should be reset
      if (currentHabit.streak > 0 && currentHabit.lastCompleted !== today && currentHabit.lastCompleted !== yesterday) {
        // Reset the streak in the database
        const [updated] = await db
          .update(habits)
          .set({ streak: 0 })
          .where(eq(habits.id, currentHabit.id))
          .returning();
        currentHabit = updated || currentHabit;
      }

      return await this.applyHabitDecay(currentHabit, today);
    }));

    return updatedHabits;
  }

  async getHabitById(id: number, userId: string, timeZone = "UTC"): Promise<Habit | undefined> {
    await this.ensureInitialized();
    const zone = normalizeTimeZone(timeZone);
    const [habit] = await db.select().from(habits).where(and(eq(habits.id, id), eq(habits.userId, userId)));
    if (!habit) return undefined;

    // Check and reset streak if habit hasn't been completed recently
    const today = getTodayKeyForZone(zone);
    const yesterday = getYesterdayKey(zone);

    // If the habit wasn't completed yesterday or today, the streak should be reset
    let currentHabit = habit;
    if (currentHabit.streak > 0 && currentHabit.lastCompleted !== today && currentHabit.lastCompleted !== yesterday) {
      // Reset the streak in the database
      const [updated] = await db
        .update(habits)
        .set({ streak: 0 })
        .where(eq(habits.id, currentHabit.id))
        .returning();
      currentHabit = updated || currentHabit;
    }

    return await this.applyHabitDecay(currentHabit, today);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    await this.ensureInitialized();
    const [habit] = await db
      .insert(habits)
      .values(insertHabit)
      .returning();
    return habit;
  }

  async updateHabit(id: number, updateData: Partial<InsertHabit>, userId: string): Promise<Habit> {
    await this.ensureInitialized();
    const [habit] = await db
      .update(habits)
      .set(updateData)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();

    if (!habit) {
      throw new Error(`Habit with id ${id} not found`);
    }
    return habit;
  }

  async updateHabitDifficulty(id: number, difficulty: number, analysis: string, userId: string): Promise<Habit> {
    await this.ensureInitialized();
    const [habit] = await db
      .update(habits)
      .set({
        difficultyRating: difficulty,
        aiAnalysis: analysis,
        lastAnalyzed: new Date()
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();

    if (!habit) {
      throw new Error(`Habit with id ${id} not found`);
    }
    return habit;
  }

  async deleteHabit(id: number, userId: string): Promise<void> {
    await this.ensureInitialized();

    // Delete all subtasks associated with this habit first (with user verification)
    await db.delete(subtasks).where(and(eq(subtasks.habitId, id), eq(subtasks.userId, userId)));

    const result = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)));

    if (result.rowCount === 0) {
      throw new Error(`Habit with id ${id} not found`);
    }
  }

  // Subtasks
  async getSubtasks(habitId: number, userId: string): Promise<Subtask[]> {
    await this.ensureInitialized();

    // No need for extra habit ownership check - filtering by userId is sufficient
    return await db
      .select()
      .from(subtasks)
      .where(and(eq(subtasks.habitId, habitId), eq(subtasks.userId, userId)))
      .orderBy(subtasks.order);
  }

  async getSubtaskById(id: number, userId: string): Promise<Subtask | undefined> {
    await this.ensureInitialized();
    const [subtask] = await db
      .select()
      .from(subtasks)
      .where(and(eq(subtasks.id, id), eq(subtasks.userId, userId)));
    return subtask || undefined;
  }

  async createSubtask(insertSubtask: InsertSubtask): Promise<Subtask> {
    await this.ensureInitialized();

    // Verify habit ownership using existing method
    const habit = await this.getHabitById(insertSubtask.habitId, insertSubtask.userId);
    if (!habit) {
      throw new Error(`Habit with id ${insertSubtask.habitId} not found or access denied`);
    }

    const [subtask] = await db
      .insert(subtasks)
      .values(insertSubtask)
      .returning();
    return subtask;
  }

  async updateSubtask(id: number, updateData: Partial<InsertSubtask>, userId: string): Promise<Subtask> {
    await this.ensureInitialized();

    // Never allow changing userId - remove it from update data if present
    const { userId: _, ...safeUpdateData } = updateData;

    const [subtask] = await db
      .update(subtasks)
      .set(safeUpdateData)
      .where(and(eq(subtasks.id, id), eq(subtasks.userId, userId)))
      .returning();

    if (!subtask) {
      throw new Error(`Subtask with id ${id} not found or access denied`);
    }
    return subtask;
  }

  async deleteSubtask(id: number, userId: string): Promise<void> {
    await this.ensureInitialized();
    const result = await db
      .delete(subtasks)
      .where(and(eq(subtasks.id, id), eq(subtasks.userId, userId)));

    if (result.rowCount === 0) {
      throw new Error(`Subtask with id ${id} not found or access denied`);
    }
  }

  // Daily Entries
  async getDailyEntry(date: string, userId: string): Promise<DailyEntry | undefined> {
    await this.ensureInitialized();
    const [entry] = await db
      .select()
      .from(dailyEntries)
      .where(and(eq(dailyEntries.date, date), eq(dailyEntries.userId, userId)));
    return entry || undefined;
  }

  async getDailyEntries(userId: string, startDate?: string, endDate?: string): Promise<DailyEntry[]> {
    await this.ensureInitialized();

    let whereConditions = [eq(dailyEntries.userId, userId)];

    if (startDate) {
      whereConditions.push(gte(dailyEntries.date, startDate));
    }

    if (endDate) {
      whereConditions.push(lte(dailyEntries.date, endDate));
    }

    return await db
      .select()
      .from(dailyEntries)
      .where(and(...whereConditions))
      .orderBy(dailyEntries.date);
  }

  async createDailyEntry(insertEntry: InsertDailyEntry): Promise<DailyEntry> {
    await this.ensureInitialized();
    try {
      console.log('Creating daily entry with data:', insertEntry);
      const [entry] = await db
        .insert(dailyEntries)
        .values(insertEntry)
        .returning();
      console.log('Daily entry created in database:', entry);

      // Calculate streaks when day is completed
      if (insertEntry.isCompleted === true) {
        console.log('Day completed, calculating streaks...');
        await this.calculateStreaks(insertEntry.date, insertEntry.userId);
      }

      return entry;
    } catch (error) {
      console.error('Database error creating daily entry:', error);
      throw error;
    }
  }

  async updateDailyEntry(date: string, updateData: Partial<InsertDailyEntry>, userId: string): Promise<DailyEntry> {
    await this.ensureInitialized();
    try {
      console.log('Updating daily entry for date:', date, 'user:', userId, 'with data:', updateData);
      const [entry] = await db
        .update(dailyEntries)
        .set({ ...updateData, updatedAt: new Date() })
        .where(and(eq(dailyEntries.date, date), eq(dailyEntries.userId, userId)))
        .returning();

      if (!entry) {
        throw new Error(`Daily entry for date ${date} not found`);
      }
      console.log('Daily entry updated in database:', entry);

      // Only calculate streaks and achievements when day is actually completed, not on every update
      if (updateData.isCompleted === true) {
        console.log('Day completed, calculating streaks and achievements...');
        // Run streak calculation and achievement checking in parallel
        await Promise.all([
          this.calculateStreaks(date, userId),
          this.checkAchievements(0, entry) // Pass 0 as placeholder, will get actual streak inside
        ]);
      }

      return entry;
    } catch (error) {
      console.error('Database error updating daily entry:', error);
      throw error;
    }
  }

  // Weekly Reviews
  async getWeeklyReview(weekStartDate: string, userId: string): Promise<WeeklyReview | undefined> {
    const [review] = await db
      .select()
      .from(weeklyReviews)
      .where(and(eq(weeklyReviews.weekStartDate, weekStartDate), eq(weeklyReviews.userId, userId)));
    return review || undefined;
  }

  async getWeeklyReviews(userId: string): Promise<WeeklyReview[]> {
    return await db
      .select()
      .from(weeklyReviews)
      .where(eq(weeklyReviews.userId, userId))
      .orderBy(weeklyReviews.weekStartDate);
  }

  async getLatestWeeklyReview(userId: string): Promise<WeeklyReview | undefined> {
    const [review] = await db
      .select()
      .from(weeklyReviews)
      .where(eq(weeklyReviews.userId, userId))
      .orderBy(desc(weeklyReviews.weekStartDate))
      .limit(1);
    return review || undefined;
  }

  async createWeeklyReview(insertReview: InsertWeeklyReview): Promise<WeeklyReview> {
    const [review] = await db
      .insert(weeklyReviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async updateWeeklyReview(weekStartDate: string, updateData: Partial<InsertWeeklyReview>, userId: string): Promise<WeeklyReview> {
    const [review] = await db
      .update(weeklyReviews)
      .set(updateData)
      .where(and(eq(weeklyReviews.weekStartDate, weekStartDate), eq(weeklyReviews.userId, userId)))
      .returning();

    if (!review) {
      throw new Error(`Weekly review for week ${weekStartDate} not found`);
    }
    return review;
  }

  // Settings
  async getSetting(key: string, userId: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(and(eq(settings.key, key), eq(settings.userId, userId)));
    return setting || undefined;
  }

  async getSettings(userId: string): Promise<Setting[]> {
    return await db.select().from(settings).where(eq(settings.userId, userId));
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = await this.getSetting(insertSetting.key, insertSetting.userId);

    if (existing) {
      const [setting] = await db
        .update(settings)
        .set({ value: insertSetting.value, updatedAt: new Date() })
        .where(and(eq(settings.key, insertSetting.key), eq(settings.userId, insertSetting.userId)))
        .returning();
      return setting;
    } else {
      const [setting] = await db
        .insert(settings)
        .values(insertSetting)
        .returning();
      return setting;
    }
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(goals.createdAt);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values(insertGoal)
      .returning();
    return goal;
  }

  async updateGoal(id: number, updateData: Partial<InsertGoal>, userId: string): Promise<Goal> {
    const [goal] = await db
      .update(goals)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();

    if (!goal) {
      throw new Error("Goal not found");
    }
    return goal;
  }

  async deleteGoal(id: number, userId: string): Promise<void> {
    await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, userId)));
  }

  // Chat messages
  async getChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
    return messages.reverse();
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async clearChatMessages(userId: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
  }

  // Achievements
  async getAchievements(userId: string): Promise<Achievement[]> {
    await this.ensureInitialized();

    // Check if achievements exist for this user
    const existingAchievements = await db.select().from(achievements).where(eq(achievements.userId, userId));
    if (existingAchievements.length === 0) {
      console.log(`Initializing achievements for user ${userId}`);
      await this.initializeAchievements(userId);
      return await db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(achievements.createdAt);
    }

    return existingAchievements.sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async unlockAchievement(id: number, userId: string): Promise<Achievement> {
    await this.ensureInitialized();

    // First check if the achievement exists for this user
    const existingAchievement = await db
      .select()
      .from(achievements)
      .where(and(eq(achievements.id, id), eq(achievements.userId, userId)))
      .limit(1);

    if (existingAchievement.length === 0) {
      console.warn(`Achievement with id ${id} not found for user ${userId}, skipping unlock`);
      return null as any; // Return null instead of throwing error
    }

    // If already unlocked, return it
    if (existingAchievement[0].isUnlocked) {
      return existingAchievement[0];
    }

    const [achievement] = await db
      .update(achievements)
      .set({ isUnlocked: true, unlockedAt: new Date() })
      .where(and(eq(achievements.id, id), eq(achievements.userId, userId)))
      .returning();

    return achievement;
  }

  async initializeAchievements(userId: string): Promise<void> {
    await this.ensureInitialized();

    // Check if achievements already exist for this specific user
    const existingAchievements = await db.select().from(achievements).where(eq(achievements.userId, userId));
    if (existingAchievements.length > 0) {
      console.log(`User ${userId} already has ${existingAchievements.length} achievements`);
      return;
    }

    console.log(`Creating default achievements for user ${userId}`);
    try {
        const defaultAchievements = [
          // Streak Achievements
          {
            type: 'streak',
            name: 'First Steps',
            description: 'Complete your first day',
            badge: 'sprout',
            requirement: 1,
          },
          {
            type: 'streak',
            name: 'Spark Starter',
            description: 'Maintain a 3-day streak',
            badge: 'spark',
            requirement: 3,
          },
          {
            type: 'streak',
            name: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            badge: 'shield',
            requirement: 7,
          },
          {
            type: 'streak',
            name: 'Momentum Master',
            description: 'Maintain a 14-day streak',
            badge: 'rocket',
            requirement: 14,
          },
          {
            type: 'streak',
            name: 'Peak Performer',
            description: 'Summit a 30-day streak',
            badge: 'mountain',
            requirement: 30,
          },
          {
            type: 'streak',
            name: 'Unstoppable Force',
            description: 'Maintain a 60-day streak',
            badge: 'muscle',
            requirement: 60,
          },
          {
            type: 'streak',
            name: 'Legend',
            description: 'Maintain a 100-day streak',
            badge: 'star',
            requirement: 100,
          },
          {
            type: 'streak',
            name: 'Mythic Rhythm',
            description: 'Maintain a 180-day streak',
            badge: 'crown',
            requirement: 180,
          },

          // Completion Achievements
          {
            type: 'completion',
            name: 'Perfect Day',
            description: 'Complete all habits in a day',
            badge: 'target',
            requirement: 100,
          },
          {
            type: 'completion',
            name: 'Near Perfect',
            description: 'Complete 90% of habits in a day',
            badge: 'sparkles',
            requirement: 90,
          },
          {
            type: 'completion',
            name: 'Flow State',
            description: 'Finish at least 85% of habits in a day',
            badge: 'infinity',
            requirement: 85,
          },
          {
            type: 'completion',
            name: 'Solid Progress',
            description: 'Complete 75% of habits in a day',
            badge: 'palette',
            requirement: 75,
          },

          // Consistency Achievements
          {
            type: 'consistency',
            name: 'Reflection Master',
            description: 'Complete 5 weekly reviews',
            badge: 'book',
            requirement: 5,
          },
          {
            type: 'consistency',
            name: 'Self-Aware',
            description: 'Complete 10 weekly reviews',
            badge: 'pen',
            requirement: 10,
          },
          {
            type: 'consistency',
            name: 'Wisdom Keeper',
            description: 'Complete 25 weekly reviews',
            badge: 'sunrise',
            requirement: 25,
          },

          // Milestone Achievements
          {
            type: 'milestone',
            name: 'Getting Into It',
            description: 'Complete 10 total days',
            badge: 'flag',
            requirement: 10,
          },
          {
            type: 'milestone',
            name: 'Dedicated',
            description: 'Complete 25 total days',
            badge: 'medal',
            requirement: 25,
          },
          {
            type: 'milestone',
            name: 'Half Century',
            description: 'Complete 50 total days',
            badge: 'sun',
            requirement: 50,
          },
          {
            type: 'milestone',
            name: 'Century Club',
            description: 'Complete 100 total days',
            badge: 'trophy',
            requirement: 100,
          },
          {
            type: 'milestone',
            name: 'Habit Master',
            description: 'Complete 250 total days',
            badge: 'crown',
            requirement: 250,
          },
          {
            type: 'milestone',
            name: 'Life Changer',
            description: 'Complete 365 total days',
            badge: 'spark',
            requirement: 365,
          },

          // Special Achievements
          {
            type: 'special',
            name: 'Note Taker',
            description: 'Add notes for 7 consecutive days',
            badge: 'book',
            requirement: 7,
          },
          {
            type: 'special',
            name: 'Habit Creator',
            description: 'Create 5 custom habits',
            badge: 'compass',
            requirement: 5,
          },
        ];

        for (const achievement of defaultAchievements) {
          await db.insert(achievements).values({
            userId,
            type: achievement.type,
            name: achievement.name,
            description: achievement.description,
            badge: achievement.badge,
            requirement: achievement.requirement,
            isUnlocked: false,
          });
        }
    } catch (error) {
      console.error('Failed to initialize achievements:', error);
    }
  }

  // Streaks
  async getStreaks(userId: string): Promise<Streak[]> {
    await this.ensureInitialized();
    return await db.select().from(streaks).where(eq(streaks.userId, userId)).orderBy(streaks.type);
  }

  async getStreak(type: string, userId: string): Promise<Streak | undefined> {
    await this.ensureInitialized();
    const [streak] = await db
      .select()
      .from(streaks)
      .where(and(eq(streaks.type, type), eq(streaks.userId, userId)));
    return streak || undefined;
  }

  async updateStreak(type: string, streakData: Partial<InsertStreak>, userId: string): Promise<Streak> {
    await this.ensureInitialized();
    const existing = await this.getStreak(type, userId);

    if (existing) {
      const [streak] = await db
        .update(streaks)
        .set({ ...streakData, updatedAt: new Date() })
        .where(and(eq(streaks.type, type), eq(streaks.userId, userId)))
        .returning();
      return streak;
    } else {
      const [streak] = await db
        .insert(streaks)
        .values({
          type,
          userId,
          ...streakData
        })
        .returning();
      return streak;
    }
  }

  async calculateStreaks(date: string, userId: string): Promise<void> {
    await this.ensureInitialized();
    try {
      // Get today's entry
      const todayEntry = await this.getDailyEntry(date, userId);
      if (!todayEntry || !todayEntry.isCompleted) return;

      // Calculate daily completion streak
      const dailyStreak = await this.getStreak('daily_completion', userId);
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = 1;

      if (dailyStreak && dailyStreak.lastActiveDate === yesterdayStr) {
        newCurrentStreak = dailyStreak.currentStreak + 1;
      }

      const newLongestStreak = Math.max(
        newCurrentStreak,
        dailyStreak?.longestStreak || 0
      );

      await this.updateStreak('daily_completion', {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: date,
      }, userId);

      // Check for achievement unlocks
      await this.checkAchievements(newCurrentStreak, todayEntry);

    } catch (error) {
      console.error('Failed to calculate streaks:', error);
    }
  }

  // Add gamification methods before checkAchievements
  async updateHabitProgress(habitId: number, completed: boolean, date: string, userId?: string, timeZone = "UTC"): Promise<Habit> {
    await this.ensureInitialized();
    const { updatedHabit, tierPromotionNeeded } = await db.transaction(async (tx) => {
      // Get habit with userId in single query if not provided
      let habit: Habit | undefined;
      if (userId) {
        [habit] = await tx
          .select()
          .from(habits)
          .where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
      } else {
        [habit] = await tx.select().from(habits).where(eq(habits.id, habitId));
        if (habit) {
          userId = habit.userId;
        }
      }

      if (!habit) {
        throw new Error(`Habit with id ${habitId} not found for user ${userId}`);
      }

      const effectiveUserId = userId || habit.userId;

      // Ensure we have a daily entry for this date and user
      const [existingEntry] = await tx
        .select()
        .from(dailyEntries)
        .where(and(eq(dailyEntries.date, date), eq(dailyEntries.userId, effectiveUserId)));

      const habitCompletions = (existingEntry?.habitCompletions as Record<string, boolean>) || {};
      const currentlyCompleted = !!habitCompletions[habitId.toString()];

      // If nothing changes, short-circuit (idempotent)
      if (currentlyCompleted === completed) {
        return { updatedHabit: habit, tierPromotionNeeded: false };
      }

      const updatedCompletions = { ...habitCompletions, [habitId]: completed };

      if (existingEntry) {
        await tx
          .update(dailyEntries)
          .set({
            habitCompletions: updatedCompletions,
            updatedAt: new Date(),
          })
          .where(and(eq(dailyEntries.id, existingEntry.id), eq(dailyEntries.userId, effectiveUserId)));
      } else {
        await tx.insert(dailyEntries).values({
          userId: effectiveUserId,
          date,
          habitCompletions: updatedCompletions,
          subtaskCompletions: {},
          punctualityScore: 3,
          adherenceScore: 3,
          notes: "",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      let newExperience = habit.experience;
      let newStreak = habit.streak;
      let newLongestStreak = habit.longestStreak;
      let newTotalCompletions = habit.totalCompletions;
      let newBadges = [...(habit.badges || [])];

      if (completed) {
        // Only award XP if transitioning from incomplete to complete
        const baseXP = 20;
        const difficultyMultiplier = (habit.difficultyRating || 3) * 0.3 + 0.4; // 0.7x to 1.9x
        const streakMultiplier = Math.min(1 + (habit.streak * 0.1), 2.0); // Up to 2x
        const earnedXP = Math.floor(baseXP * difficultyMultiplier * streakMultiplier);

        newExperience += earnedXP;
        newTotalCompletions += 1;

        // Update streak - build consecutive day chains
        const previousDate = this.getPreviousDate(date);
        if (habit.lastCompleted === previousDate) {
          newStreak += 1;
        } else if (habit.lastCompleted === date) {
          newStreak = habit.streak;
        } else {
          newStreak = 1;
        }

        newLongestStreak = Math.max(newLongestStreak, newStreak);

        // Award badges
        if (newTotalCompletions === 1 && !newBadges.includes("first_completion")) {
          newBadges.push("first_completion");
        }
        if (newStreak === 7 && !newBadges.includes("week_warrior")) {
          newBadges.push("week_warrior");
        }
        if (newStreak === 30 && !newBadges.includes("month_master")) {
          newBadges.push("month_master");
        }
        if (newStreak >= 5 && !newBadges.includes("streak_starter")) {
          newBadges.push("streak_starter");
        }
      } else {
        // Only adjust totals if transitioning from complete to incomplete
        newTotalCompletions = Math.max(0, newTotalCompletions - 1);

        // Reset streak if not completed today and yesterday
        if (habit.lastCompleted !== date && habit.lastCompleted !== this.getPreviousDate(date)) {
          newStreak = 0;
        }
      }

      const habitStartDate = habit.createdAt
        ? habit.createdAt.toISOString().split('T')[0]
        : date;
      const totalDays = this.getDaysBetween(habitStartDate, date) + 1;
      const completionRate = Math.min(100, Math.floor((newTotalCompletions / totalDays) * 100));

      if (habit.tags && habit.tags.length > 0) {
        const skillDelta = this.getSkillPointsForDifficulty(habit.difficultyRating);
        const delta = completed ? skillDelta : -skillDelta;
        await this.applySkillPointDelta(effectiveUserId, habit.tags, delta, tx, {
          reason: completed ? "habit-completion" : "habit-undo",
          date,
        });
      }

      const [updatedHabit] = await tx
        .update(habits)
        .set({
          experience: newExperience,
          streak: newStreak,
          longestStreak: newLongestStreak,
          totalCompletions: newTotalCompletions,
          completionRate,
          badges: newBadges,
          lastCompleted: completed ? date : habit.lastCompleted,
          lastDecayAt: completed ? date : habit.lastDecayAt,
        })
        .where(and(eq(habits.id, habitId), eq(habits.userId, effectiveUserId)))
        .returning();

      const tierPromotionNeeded = completed && newExperience % 100 < 20;

      return { updatedHabit: updatedHabit || habit, tierPromotionNeeded };
    });

    if (tierPromotionNeeded) {
      return await this.calculateTierPromotion(updatedHabit.id, updatedHabit.userId);
    }

    return updatedHabit;
  }

  async levelUpHabit(habitId: number, userId: string, timeZone = "UTC"): Promise<Habit> {
    await this.ensureInitialized();

    const habit = await this.getHabitById(habitId, userId);
    if (!habit) {
      throw new Error(`Habit with id ${habitId} not found`);
    }

    if (habit.experience < habit.experienceToNext) {
      throw new Error('Not enough experience to level up');
    }

    const newLevel = habit.level + 1;
    const remainingXP = habit.experience - habit.experienceToNext;
    const newXPToNext = this.calculateXPRequirement(newLevel, habit.difficultyRating);

    const [updatedHabit] = await db
      .update(habits)
      .set({
        level: newLevel,
        experience: remainingXP,
        experienceToNext: newXPToNext,
      })
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .returning();

    // Check for tier promotion after leveling up
    const tierPromotedHabit = await this.calculateTierPromotion(habitId, userId);

    if (tierPromotedHabit.tags && tierPromotedHabit.tags.length > 0) {
      await this.applySkillPointDelta(userId, tierPromotedHabit.tags, 1, db, {
        reason: "tier-promotion",
        date: getTodayKeyForZone(normalizeTimeZone(timeZone)),
      });
    }

    return tierPromotedHabit;
  }

  async awardBadge(habitId: number, badge: string, userId: string): Promise<Habit> {
    await this.ensureInitialized();

    const habit = await this.getHabitById(habitId, userId);
    if (!habit) {
      throw new Error(`Habit with id ${habitId} not found for user ${userId}`);
    }

    if ((habit.badges || []).includes(badge)) {
      return habit; // Badge already awarded
    }

    const newBadges = [...(habit.badges || []), badge];

    const [updatedHabit] = await db
      .update(habits)
      .set({ badges: newBadges })
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .returning();

    return updatedHabit || habit;
  }

  async calculateTierPromotion(habitId: number, userId: string): Promise<Habit> {
    await this.ensureInitialized();

    // Get the habit for the specific user
    const habit = await this.getHabitById(habitId, userId);
    if (!habit) {
      throw new Error(`Habit with id ${habitId} not found for user ${userId}`);
    }

    let newTier = habit.tier;
    const { level, completionRate, longestStreak, difficultyRating, totalCompletions } = habit;

    // Calculate consistency score (streak vs total completions ratio)
    const consistencyScore = totalCompletions > 0 ? Math.min((longestStreak / totalCompletions) * 100, 100) : 0;

    // Balanced tier promotion logic - more achievable but still meaningful
    // Diamond Tier - Master level with challenging habits
    if (level >= 15 &&
        completionRate >= 70 &&
        consistencyScore >= 50 &&
        longestStreak >= 21 &&
        (difficultyRating || 3) >= 4) {
      newTier = "diamond";
    }
    // Platinum Tier - Expert level with good performance
    else if (level >= 10 &&
             completionRate >= 60 &&
             consistencyScore >= 40 &&
             longestStreak >= 14 &&
        (difficultyRating || 3) >= 3) {
      newTier = "platinum";
    }
    // Gold Tier - Advanced level with solid progress
    else if (level >= 6 &&
             completionRate >= 50 &&
             consistencyScore >= 30 &&
             longestStreak >= 7) {
      newTier = "gold";
    }
    // Silver Tier - Developing consistency
    else if (level >= 3 &&
             completionRate >= 35 &&
             consistencyScore >= 20 &&
             longestStreak >= 3) {
      newTier = "silver";
    }
    // Bronze Tier - Starting level
    else {
      newTier = "bronze";
    }

    if (newTier !== habit.tier) {
      const [updatedHabit] = await db
        .update(habits)
        .set({ tier: newTier })
        .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
        .returning();

      return updatedHabit;
    }

    return habit;
  }

  private calculateXPRequirement(level: number, difficulty?: number | null): number {
    const baseXP = 100;
    const difficultyMultiplier = (difficulty || 3) * 0.2 + 0.6;
    return Math.floor(baseXP * Math.pow(1.2, level - 1) * difficultyMultiplier);
  }

  private getPreviousDate(dateStr: string): string {
    // Parse as UTC to avoid timezone issues
    const date = new Date(dateStr + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().split('T')[0];
  }

  private getDaysBetween(startDate: string, endDate: string): number {
    // Parse date strings as UTC to avoid timezone issues
    const start = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T00:00:00Z');
    const diffTime = end.getTime() - start.getTime();
    // Use Math.round to handle any floating point precision issues
    return Math.round(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
  }

  private ACHIEVEMENT_BASE_XP: Record<string, number> = {
    "First Steps": 50,
    "Spark Starter": 60,
    "Week Warrior": 100,
    "Momentum Master": 140,
    "Peak Performer": 180,
    "Unstoppable Force": 220,
    "Legend": 320,
    "Mythic Rhythm": 450,
    "Perfect Day": 180,
    "Near Perfect": 140,
    "Flow State": 160,
    "Solid Progress": 110,
    "Reflection Master": 90,
    "Self-Aware": 130,
    "Wisdom Keeper": 170,
    "Getting Into It": 80,
    "Dedicated": 120,
    "Half Century": 160,
    "Century Club": 220,
    "Habit Master": 300,
    "Life Changer": 380,
    "Note Taker": 90,
    "Habit Creator": 110,
  };

  private NON_REPEATABLE_ACHIEVEMENTS = new Set<string>(["First Steps", "Spark Starter"]);

  private async refreshAchievementTimestamp(id: number, userId: string) {
    await db
      .update(achievements)
      .set({ unlockedAt: new Date(), isUnlocked: true })
      .where(and(eq(achievements.id, id), eq(achievements.userId, userId)));
  }

  private async applyUserXpBonus(userId: string, xpDelta: number): Promise<void> {
    if (xpDelta === 0) return;

    const [userRecord] = await db
      .select({
        stats: users.stats,
        bonusXp: users.xp,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!userRecord) return;

    const currentBonus = typeof userRecord.bonusXp === "number" ? Math.max(0, userRecord.bonusXp) : 0;
    const nextBonus = Math.max(0, currentBonus + xpDelta);
    const progress = this.calculateUserProgressFromStats(userRecord.stats as Record<string, number>, nextBonus);

    await db
      .update(users)
      .set({
        xp: nextBonus,
        level: progress.level,
        class: getRankForLevel(progress.level).name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  private async checkAchievements(currentStreak: number, dailyEntry: DailyEntry): Promise<void> {
    const allAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, dailyEntry.userId));

    for (const achievement of allAchievements) {
      const repeatable = !this.NON_REPEATABLE_ACHIEVEMENTS.has(achievement.name);
      const alreadyUnlocked = achievement.isUnlocked;

      if (alreadyUnlocked && !repeatable) continue;

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'streak':
          shouldUnlock = currentStreak >= achievement.requirement;
          break;
        case 'completion':
          if (dailyEntry.habitCompletions) {
            const completionRate = Object.values(dailyEntry.habitCompletions as Record<string, boolean>)
              .filter(Boolean).length / Object.keys(dailyEntry.habitCompletions as Record<string, boolean>).length * 100;
            shouldUnlock = completionRate >= achievement.requirement;
          }
          break;
        case 'milestone': {
          const totalCompletedDays = await db
            .select()
            .from(dailyEntries)
            .where(and(eq(dailyEntries.isCompleted, true), eq(dailyEntries.userId, dailyEntry.userId)));
          shouldUnlock = totalCompletedDays.length >= achievement.requirement;
          break;
        }
      }

      if (shouldUnlock) {
        try {
          const isFirstCompletion = !alreadyUnlocked;
          const baseXp = this.ACHIEVEMENT_BASE_XP[achievement.name] ?? 100;
          const xpGain = isFirstCompletion ? baseXp : Math.floor(baseXp * 0.5);

          if (isFirstCompletion) {
            await this.unlockAchievement(achievement.id, dailyEntry.userId);
          } else if (repeatable) {
            await this.refreshAchievementTimestamp(achievement.id, dailyEntry.userId);
          }

          await this.applyUserXpBonus(dailyEntry.userId, xpGain);
        } catch (error) {
          console.warn(`Failed to unlock achievement ${achievement.id} for user ${dailyEntry.userId}:`, error);
          // Continue processing other achievements instead of failing completely
        }
      }
    }
  }

  async resetAllData(): Promise<void> {
    await this.ensureInitialized();
    try {
      // Delete all data from tables (in correct order due to foreign key constraints)
      await db.delete(dailyEntries);
      await db.delete(weeklyReviews);
      await db.delete(streaks);
      await db.delete(goals);
      await db.delete(chatMessages);
      await db.delete(skillPointsHistory);

      // Reset achievements to unlocked state
      await db.update(achievements).set({
        isUnlocked: false,
        unlockedAt: null
      });

      // Delete custom habits (keep default ones by checking if they exist in defaults)
      const defaultHabits = [
        "Wake up on time", "Exercise", "Healthy breakfast", "Drink water",
        "Read", "Meditate", "Work focus", "Limit screen time", "Sleep early", "Gratitude"
      ];

      const allHabits = await db.select().from(habits);
      for (const habit of allHabits) {
        if (!defaultHabits.includes(habit.name)) {
          await db.delete(habits).where(eq(habits.id, habit.id));
        }
      }

      // Delete custom settings (keep system ones)
      await db.delete(settings).where(not(eq(settings.key, 'theme')));

      console.log('All data reset successfully');
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw new Error('Failed to reset data');
    }
  }

  async resetUserData(userId: string): Promise<void> {
    await this.ensureInitialized();
    try {
      // Delete user's subtasks first (foreign key constraint)
      await db.delete(subtasks).where(eq(subtasks.userId, userId));

      // Delete user's data from tables (in correct order due to foreign key constraints)
      await db.delete(dailyEntries).where(eq(dailyEntries.userId, userId));
      await db.delete(weeklyReviews).where(eq(weeklyReviews.userId, userId));
      await db.delete(streaks).where(eq(streaks.userId, userId));
      await db.delete(goals).where(eq(goals.userId, userId));
      await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
      await db.delete(skillPointsHistory).where(eq(skillPointsHistory.userId, userId));

      // Remove achievements entirely
      await db.delete(achievements).where(eq(achievements.userId, userId));

      // Delete ALL user's habits (not just custom ones)
      await db.delete(habits).where(eq(habits.userId, userId));

      // Delete user's settings
      await db.delete(settings).where(eq(settings.userId, userId));

      // Finally remove the user record itself
      await db.delete(users).where(eq(users.id, userId));

      console.log(`All data for user ${userId} has been permanently deleted`);
    } catch (error) {
      console.error(`Failed to reset data for user ${userId}:`, error);
      throw new Error('Failed to reset user data');
    }
  }

  async getDailyChallenges(userId: string, date?: string, timeZone = "UTC"): Promise<Challenge[]> {
    await this.ensureInitialized();
    const zone = normalizeTimeZone(timeZone);
    const effectiveDate = date || getTodayKeyForZone(zone);
    const key = this.challengeSettingKey(effectiveDate);
    const existingSetting = await this.getSetting(key, userId);
    const difficultySetting = await this.getSetting("challengeDifficulty", userId);
    const typeSetting = await this.getSetting("challengeType", userId);
    const personalizationSetting = await this.getSetting("personalizationProfile", userId);
    const difficulty = Math.max(0, Math.min(100, Number(difficultySetting?.value) || 50));
    const challengeType = typeSetting?.value || "balanced";
    const personalization = personalizationSetting?.value || "";

    if (existingSetting && existingSetting.value) {
      try {
        const stored = JSON.parse(existingSetting.value) as Challenge[];
        if (Array.isArray(stored) && stored.length > 0) {
          return stored;
        }
      } catch (error) {
        console.warn("Failed to parse stored challenges, regenerating", error);
      }
    }

    // Generate new challenges
    const userHabits = await this.getHabits(userId, zone);
    const aiSuggestions = await generateHabitSuggestions(userHabits, { difficulty, type: challengeType, personalization });
    const challenges = this.normalizeChallenges(aiSuggestions, effectiveDate).slice(0, 5);

    await this.setSetting({
      key,
      userId,
      value: JSON.stringify(challenges),
    });

    return challenges;
  }

  async reshuffleChallenges(userId: string, date?: string, timeZone = "UTC"): Promise<Challenge[]> {
    await this.ensureInitialized();
    const zone = normalizeTimeZone(timeZone);
    const effectiveDate = date || getTodayKeyForZone(zone);
    const existing = await this.getDailyChallenges(userId, effectiveDate, zone);
    const completed = existing.filter((c) => c.completed);
    const maxId = existing.reduce((max, c) => Math.max(max, c.id || 0), 0);
    const difficultySetting = await this.getSetting("challengeDifficulty", userId);
    const typeSetting = await this.getSetting("challengeType", userId);
    const personalizationSetting = await this.getSetting("personalizationProfile", userId);
    const difficulty = Math.max(0, Math.min(100, Number(difficultySetting?.value) || 50));
    const challengeType = typeSetting?.value || "balanced";
    const personalization = personalizationSetting?.value || "";
    const userHabits = await this.getHabits(userId, zone);
    const aiSuggestions = await generateHabitSuggestions(userHabits, { difficulty, type: challengeType, force: true, personalization });
    const fresh = this.normalizeChallenges(aiSuggestions, effectiveDate);

    // Keep completed challenges, refresh the rest
    const usedNames = new Set(completed.map((c) => c.name.toLowerCase()));
    const remainingSlots = Math.max(0, 5 - completed.length);
    const newOnes = fresh
      .filter((c) => !usedNames.has(c.name.toLowerCase()))
      .slice(0, remainingSlots)
      .map((c, idx) => ({ ...c, id: maxId + idx + 1 }));

    const challenges = [...completed, ...newOnes];

    await this.setSetting({
      key: this.challengeSettingKey(effectiveDate),
      userId,
      value: JSON.stringify(challenges),
    });

    return challenges;
  }

  async completeChallenge(
    id: number | string,
    userId: string,
    completed = true,
    date?: string,
    timeZone = "UTC"
  ): Promise<{ challenges: Challenge[]; progress?: { level: number; xp: number; xpToNext: number } }> {
    await this.ensureInitialized();
    const zone = normalizeTimeZone(timeZone);
    const effectiveDate = date || getTodayKeyForZone(zone);
    const challenges = await this.getDailyChallenges(userId, effectiveDate, zone);
    const updated = challenges.map((challenge) => ({ ...challenge }));
    const target = updated.find((c) => c.id === id || String(c.id) === String(id));
    if (!target) {
      throw new Error("Challenge not found");
    }

    const wasCompleted = target.completed;
    target.completed = completed;

    if (completed !== wasCompleted) {
      const xpDelta = completed ? target.xp : -target.xp;
      await this.applyUserXpBonus(userId, xpDelta);
    }

    await this.setSetting({
      key: this.challengeSettingKey(effectiveDate),
      userId,
      value: JSON.stringify(updated),
    });

    const progress = await this.getUserProgress(userId);
    return { challenges: updated, progress };
  }
}

export const storage = new DatabaseStorage();
