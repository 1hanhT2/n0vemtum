import {
  habits,
  dailyEntries,
  weeklyReviews,
  settings,
  achievements,
  streaks,
  users,
  subtasks,
  type Habit,
  type InsertHabit,
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
import { db } from "./db";
import { eq, and, gte, lte, not } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Habits
  getHabits(userId: string): Promise<Habit[]>;
  getHabitById(id: number, userId: string): Promise<Habit | undefined>;
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
  updateHabitProgress(habitId: number, completed: boolean, date: string, userId?: string): Promise<Habit>;
  levelUpHabit(habitId: number, userId: string): Promise<Habit>;
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
  createWeeklyReview(review: InsertWeeklyReview): Promise<WeeklyReview>;
  updateWeeklyReview(weekStartDate: string, review: Partial<InsertWeeklyReview>, userId: string): Promise<WeeklyReview>;

  // Settings
  getSetting(key: string, userId: string): Promise<Setting | undefined>;
  getSettings(userId: string): Promise<Setting[]>;
  setSetting(setting: InsertSetting): Promise<Setting>;

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
  clearMonthData(userId: string, month: string): Promise<void>; // Added for clearing month data
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
  async getHabits(userId: string): Promise<Habit[]> {
    await this.ensureInitialized();
    const userHabits = await db.select().from(habits).where(eq(habits.userId, userId)).orderBy(habits.order);

    // Check and reset streaks if habits haven't been completed recently
    const today = new Date().toISOString().split('T')[0];
    const yesterday = this.getPreviousDate(today);

    const updatedHabits = await Promise.all(userHabits.map(async (habit) => {
      // If the habit wasn't completed yesterday or today, the streak should be reset
      if (habit.streak > 0 && habit.lastCompleted !== today && habit.lastCompleted !== yesterday) {
        // Reset the streak in the database
        const [updated] = await db
          .update(habits)
          .set({ streak: 0 })
          .where(eq(habits.id, habit.id))
          .returning();
        return updated;
      }
      return habit;
    }));

    return updatedHabits;
  }

  async getHabitById(id: number, userId: string): Promise<Habit | undefined> {
    await this.ensureInitialized();
    const [habit] = await db.select().from(habits).where(and(eq(habits.id, id), eq(habits.userId, userId)));
    if (!habit) return undefined;

    // Check and reset streak if habit hasn't been completed recently
    const today = new Date().toISOString().split('T')[0];
    const yesterday = this.getPreviousDate(today);

    // If the habit wasn't completed yesterday or today, the streak should be reset
    if (habit.streak > 0 && habit.lastCompleted !== today && habit.lastCompleted !== yesterday) {
      // Reset the streak in the database
      const [updated] = await db
        .update(habits)
        .set({ streak: 0 })
        .where(eq(habits.id, habit.id))
        .returning();
      return updated;
    }

    return habit;
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
            badge: '🌱',
            requirement: 1,
          },
          {
            type: 'streak',
            name: 'Getting Started',
            description: 'Maintain a 3-day streak',
            badge: '🔥',
            requirement: 3,
          },
          {
            type: 'streak',
            name: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            badge: '⚡',
            requirement: 7,
          },
          {
            type: 'streak',
            name: 'Momentum Master',
            description: 'Maintain a 14-day streak',
            badge: '🚀',
            requirement: 14,
          },
          {
            type: 'streak',
            name: 'Habit Hero',
            description: 'Maintain a 30-day streak',
            badge: '🏆',
            requirement: 30,
          },
          {
            type: 'streak',
            name: 'Unstoppable Force',
            description: 'Maintain a 60-day streak',
            badge: '💪',
            requirement: 60,
          },
          {
            type: 'streak',
            name: 'Legend',
            description: 'Maintain a 100-day streak',
            badge: '🌟',
            requirement: 100,
          },

          // Completion Achievements
          {
            type: 'completion',
            name: 'Perfect Day',
            description: 'Complete all habits in a day',
            badge: '⭐',
            requirement: 100,
          },
          {
            type: 'completion',
            name: 'Near Perfect',
            description: 'Complete 90% of habits in a day',
            badge: '🎯',
            requirement: 90,
          },
          {
            type: 'completion',
            name: 'Good Progress',
            description: 'Complete 75% of habits in a day',
            badge: '✅',
            requirement: 75,
          },

          // Consistency Achievements
          {
            type: 'consistency',
            name: 'Reflection Master',
            description: 'Complete 5 weekly reviews',
            badge: '📝',
            requirement: 5,
          },
          {
            type: 'consistency',
            name: 'Self-Aware',
            description: 'Complete 10 weekly reviews',
            badge: '🔍',
            requirement: 10,
          },
          {
            type: 'consistency',
            name: 'Wisdom Keeper',
            description: 'Complete 25 weekly reviews',
            badge: '🧠',
            requirement: 25,
          },

          // Milestone Achievements
          {
            type: 'milestone',
            name: 'Getting Into It',
            description: 'Complete 10 total days',
            badge: '🎪',
            requirement: 10,
          },
          {
            type: 'milestone',
            name: 'Dedicated',
            description: 'Complete 25 total days',
            badge: '💝',
            requirement: 25,
          },
          {
            type: 'milestone',
            name: 'Half Century',
            description: 'Complete 50 total days',
            badge: '🏅',
            requirement: 50,
          },
          {
            type: 'milestone',
            name: 'Century Club',
            description: 'Complete 100 total days',
            badge: '💯',
            requirement: 100,
          },
          {
            type: 'milestone',
            name: 'Habit Master',
            description: 'Complete 250 total days',
            badge: '🎖️',
            requirement: 250,
          },
          {
            type: 'milestone',
            name: 'Life Changer',
            description: 'Complete 365 total days',
            badge: '🌈',
            requirement: 365,
          },

          // Special Achievements
          {
            type: 'special',
            name: 'Early Bird',
            description: 'Score 5/5 on punctuality',
            badge: '🐦',
            requirement: 5,
          },
          {
            type: 'special',
            name: 'Disciplined',
            description: 'Score 5/5 on adherence',
            badge: '⚖️',
            requirement: 5,
          },
          {
            type: 'special',
            name: 'Perfectionist',
            description: 'Score 5/5 on both metrics same day',
            badge: '💎',
            requirement: 1,
          },
          {
            type: 'special',
            name: 'Note Taker',
            description: 'Add notes for 7 consecutive days',
            badge: '📓',
            requirement: 7,
          },
          {
            type: 'special',
            name: 'Habit Creator',
            description: 'Create 5 custom habits',
            badge: '🛠️',
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
  async updateHabitProgress(habitId: number, completed: boolean, date: string, userId?: string): Promise<Habit> {
    await this.ensureInitialized();

    // Get habit with userId in single query if not provided
    let effectiveUserId: string;
    const habit = userId
      ? await this.getHabitById(habitId, userId)
      : await db.select().from(habits).where(eq(habits.id, habitId)).then(([h]) => {
          if (!h) throw new Error(`Habit with id ${habitId} not found`);
          userId = h.userId;
          return h;
        });

    if (!habit) {
      throw new Error(`Habit with id ${habitId} not found for user ${userId}`);
    }

    // Now we're guaranteed to have a userId
    effectiveUserId = userId || habit.userId;

    // Check current completion state for this date to prevent duplicate experience
    const dailyEntry = await this.getDailyEntry(date, effectiveUserId);
    const habitCompletions = dailyEntry?.habitCompletions as Record<string, boolean> || {};
    const currentlyCompleted = habitCompletions[habitId.toString()] || false;

    // Only process experience if state is actually changing
    const isStateChanging = currentlyCompleted !== completed;

    let newExperience = habit.experience;
    let newMasteryPoints = habit.masteryPoints;
    let newStreak = habit.streak;
    let newLongestStreak = habit.longestStreak;
    let newTotalCompletions = habit.totalCompletions;
    let newBadges = [...(habit.badges || [])];

    if (completed && isStateChanging) {
      // Only award XP if transitioning from incomplete to complete
      const baseXP = 20;
      const difficultyMultiplier = (habit.difficultyRating || 3) * 0.3 + 0.4; // 0.7x to 1.9x
      const streakMultiplier = Math.min(1 + (habit.streak * 0.1), 2.0); // Up to 2x
      const earnedXP = Math.floor(baseXP * difficultyMultiplier * streakMultiplier);

      newExperience += earnedXP;
      newMasteryPoints += Math.floor(earnedXP * 0.5);
      newTotalCompletions += 1;

      // Update streak - build consecutive day chains
      const previousDate = this.getPreviousDate(date);
      if (habit.lastCompleted === previousDate) {
        // Continuing a streak
        newStreak += 1;
      } else if (habit.lastCompleted === date) {
        // Same day completion, don't change streak
        newStreak = habit.streak;
      } else {
        // Starting a new streak
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
    } else if (!completed && isStateChanging) {
      // Only adjust totals if transitioning from complete to incomplete
      newTotalCompletions = Math.max(0, newTotalCompletions - 1);

      // Reset streak if not completed today and yesterday
      if (habit.lastCompleted !== date && habit.lastCompleted !== this.getPreviousDate(date)) {
        newStreak = 0;
      }
    }

    // Calculate completion rate
    // If createdAt is null, use the current date as fallback
    const habitStartDate = habit.createdAt
      ? habit.createdAt.toISOString().split('T')[0]
      : date;
    const totalDays = this.getDaysBetween(habitStartDate, date) + 1;
    const completionRate = Math.min(100, Math.floor((newTotalCompletions / totalDays) * 100));

    // Only update habit if state is actually changing to prevent unnecessary writes
    if (!isStateChanging) {
      return habit;
    }

    const [updatedHabit] = await db
      .update(habits)
      .set({
        experience: newExperience,
        masteryPoints: newMasteryPoints,
        streak: newStreak,
        longestStreak: newLongestStreak,
        totalCompletions: newTotalCompletions,
        completionRate,
        badges: newBadges,
        lastCompleted: completed ? date : habit.lastCompleted
      })
      .where(and(eq(habits.id, habitId), eq(habits.userId, effectiveUserId)))
      .returning();

    // Skip expensive tier promotion calculation on every update
    // Only check tier promotion on level boundaries (every 100 XP)
    if (completed && newExperience % 100 < 20) {
      return await this.calculateTierPromotion(habitId, effectiveUserId);
    }

    return updatedHabit;
  }

  async levelUpHabit(habitId: number, userId: string): Promise<Habit> {
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
        masteryPoints: habit.masteryPoints + (newLevel * 10)
      })
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .returning();

    // Check for tier promotion after leveling up
    const tierPromotedHabit = await this.calculateTierPromotion(habitId, userId);

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
    const { level, completionRate, longestStreak, masteryPoints, difficultyRating, totalCompletions } = habit;

    // Calculate consistency score (streak vs total completions ratio)
    const consistencyScore = totalCompletions > 0 ? Math.min((longestStreak / totalCompletions) * 100, 100) : 0;

    // Difficulty-adjusted requirements
    const difficultyMultiplier = (difficultyRating || 3) / 3; // 1.0 for difficulty 3, scales with actual difficulty

    // Balanced tier promotion logic - more achievable but still meaningful
    // Diamond Tier - Master level with challenging habits
    if (level >= 15 &&
        completionRate >= 70 &&
        consistencyScore >= 50 &&
        longestStreak >= 21 &&
        masteryPoints >= 800 &&
        (difficultyRating || 3) >= 4) {
      newTier = "diamond";
    }
    // Platinum Tier - Expert level with good performance
    else if (level >= 10 &&
             completionRate >= 60 &&
             consistencyScore >= 40 &&
             longestStreak >= 14 &&
             masteryPoints >= 400 &&
             (difficultyRating || 3) >= 3) {
      newTier = "platinum";
    }
    // Gold Tier - Advanced level with solid progress
    else if (level >= 6 &&
             completionRate >= 50 &&
             consistencyScore >= 30 &&
             longestStreak >= 7 &&
             masteryPoints >= 150) {
      newTier = "gold";
    }
    // Silver Tier - Developing consistency
    else if (level >= 3 &&
             completionRate >= 35 &&
             consistencyScore >= 20 &&
             longestStreak >= 3 &&
             masteryPoints >= 50) {
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
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  private getDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async checkAchievements(currentStreak: number, dailyEntry: DailyEntry): Promise<void> {
    const allAchievements = await db.select().from(achievements);

    for (const achievement of allAchievements) {
      if (achievement.isUnlocked) continue;

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
        case 'milestone':
          const totalCompletedDays = await db.select().from(dailyEntries).where(eq(dailyEntries.isCompleted, true));
          shouldUnlock = totalCompletedDays.length >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        try {
          await this.unlockAchievement(achievement.id, dailyEntry.userId);
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

      // Reset user's achievements to unlocked state
      await db.update(achievements)
        .set({
          isUnlocked: false,
          unlockedAt: null
        })
        .where(eq(achievements.userId, userId));

      // Delete ALL user's habits (not just custom ones)
      await db.delete(habits).where(eq(habits.userId, userId));

      // Delete user's settings
      await db.delete(settings).where(eq(settings.userId, userId));

      console.log(`All data for user ${userId} has been permanently deleted`);
    } catch (error) {
      console.error(`Failed to reset data for user ${userId}:`, error);
      throw new Error('Failed to reset user data');
    }
  }

  // New function to clear data for a specific month
  async clearMonthData(userId: string, month: string): Promise<void> {
    await this.ensureInitialized();
    try {
      // month is in 'YYYY-MM' format
      const startDate = `${month}-01`;
      const endDate = `${month}-${new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0).getDate()}`;

      // Delete entries within the specified month
      await db.delete(dailyEntries).where(
        and(
          eq(dailyEntries.userId, userId),
          gte(dailyEntries.date, startDate),
          lte(dailyEntries.date, endDate)
        )
      );

      // Optionally, you might want to clear weekly reviews or other data that spans months.
      // For now, we'll focus on dailyEntries as per the request's implication.

      console.log(`Cleared data for user ${userId} for the month of ${month}`);
    } catch (error) {
      console.error(`Failed to clear data for user ${userId} for month ${month}:`, error);
      throw new Error('Failed to clear month data');
    }
  }
}

export const storage = new DatabaseStorage();