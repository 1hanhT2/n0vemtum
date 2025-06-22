import { 
  habits, 
  dailyEntries, 
  weeklyReviews, 
  settings,
  achievements,
  streaks,
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
  type InsertStreak
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Habits
  getHabits(): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit>;
  deleteHabit(id: number): Promise<void>;

  // Daily Entries
  getDailyEntry(date: string): Promise<DailyEntry | undefined>;
  getDailyEntries(startDate?: string, endDate?: string): Promise<DailyEntry[]>;
  createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntry>;
  updateDailyEntry(date: string, entry: Partial<InsertDailyEntry>): Promise<DailyEntry>;

  // Weekly Reviews
  getWeeklyReview(weekStartDate: string): Promise<WeeklyReview | undefined>;
  getWeeklyReviews(): Promise<WeeklyReview[]>;
  createWeeklyReview(review: InsertWeeklyReview): Promise<WeeklyReview>;
  updateWeeklyReview(weekStartDate: string, review: Partial<InsertWeeklyReview>): Promise<WeeklyReview>;

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(): Promise<Setting[]>;
  setSetting(setting: InsertSetting): Promise<Setting>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  unlockAchievement(id: number): Promise<Achievement>;
  initializeAchievements(): Promise<void>;

  // Streaks
  getStreaks(): Promise<Streak[]>;
  getStreak(type: string): Promise<Streak | undefined>;
  updateStreak(type: string, streak: Partial<InsertStreak>): Promise<Streak>;
  calculateStreaks(date: string): Promise<void>;

  // Data management
  resetAllData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeDefaults();
      this.initialized = true;
    }
  }

  private async initializeDefaults() {
    await this.initializeDefaultHabits();
    await this.initializeAchievements();
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
          await db.insert(habits).values(habit);
        }
      }
    } catch (error) {
      console.error('Failed to initialize default habits:', error);
    }
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    await this.ensureInitialized();
    return await db.select().from(habits).orderBy(habits.order);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    await this.ensureInitialized();
    const [habit] = await db
      .insert(habits)
      .values(insertHabit)
      .returning();
    return habit;
  }

  async updateHabit(id: number, updateData: Partial<InsertHabit>): Promise<Habit> {
    await this.ensureInitialized();
    const [habit] = await db
      .update(habits)
      .set(updateData)
      .where(eq(habits.id, id))
      .returning();
    
    if (!habit) {
      throw new Error(`Habit with id ${id} not found`);
    }
    return habit;
  }

  async deleteHabit(id: number): Promise<void> {
    await this.ensureInitialized();
    const result = await db
      .delete(habits)
      .where(eq(habits.id, id));
    
    if (result.rowCount === 0) {
      throw new Error(`Habit with id ${id} not found`);
    }
  }

  // Daily Entries
  async getDailyEntry(date: string): Promise<DailyEntry | undefined> {
    await this.ensureInitialized();
    const [entry] = await db
      .select()
      .from(dailyEntries)
      .where(eq(dailyEntries.date, date));
    return entry || undefined;
  }

  async getDailyEntries(startDate?: string, endDate?: string): Promise<DailyEntry[]> {
    await this.ensureInitialized();
    let query = db.select().from(dailyEntries);
    
    if (startDate && endDate) {
      query = query.where(and(
        gte(dailyEntries.date, startDate),
        lte(dailyEntries.date, endDate)
      ));
    } else if (startDate) {
      query = query.where(gte(dailyEntries.date, startDate));
    } else if (endDate) {
      query = query.where(lte(dailyEntries.date, endDate));
    }
    
    return await query.orderBy(dailyEntries.date);
  }

  async createDailyEntry(insertEntry: InsertDailyEntry): Promise<DailyEntry> {
    await this.ensureInitialized();
    const [entry] = await db
      .insert(dailyEntries)
      .values(insertEntry)
      .returning();

    // Calculate streaks when day is completed
    if (insertEntry.isCompleted === true) {
      await this.calculateStreaks(insertEntry.date);
    }

    return entry;
  }

  async updateDailyEntry(date: string, updateData: Partial<InsertDailyEntry>): Promise<DailyEntry> {
    await this.ensureInitialized();
    const [entry] = await db
      .update(dailyEntries)
      .set(updateData)
      .where(eq(dailyEntries.date, date))
      .returning();
    
    if (!entry) {
      throw new Error(`Daily entry for date ${date} not found`);
    }

    // Calculate streaks when day is completed
    if (updateData.isCompleted === true) {
      await this.calculateStreaks(date);
    }

    return entry;
  }

  // Weekly Reviews
  async getWeeklyReview(weekStartDate: string): Promise<WeeklyReview | undefined> {
    const [review] = await db
      .select()
      .from(weeklyReviews)
      .where(eq(weeklyReviews.weekStartDate, weekStartDate));
    return review || undefined;
  }

  async getWeeklyReviews(): Promise<WeeklyReview[]> {
    return await db
      .select()
      .from(weeklyReviews)
      .orderBy(weeklyReviews.weekStartDate);
  }

  async createWeeklyReview(insertReview: InsertWeeklyReview): Promise<WeeklyReview> {
    const [review] = await db
      .insert(weeklyReviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async updateWeeklyReview(weekStartDate: string, updateData: Partial<InsertWeeklyReview>): Promise<WeeklyReview> {
    const [review] = await db
      .update(weeklyReviews)
      .set(updateData)
      .where(eq(weeklyReviews.weekStartDate, weekStartDate))
      .returning();
    
    if (!review) {
      throw new Error(`Weekly review for week ${weekStartDate} not found`);
    }
    return review;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return setting || undefined;
  }

  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = await this.getSetting(insertSetting.key);
    
    if (existing) {
      const [setting] = await db
        .update(settings)
        .set({ value: insertSetting.value, updatedAt: new Date() })
        .where(eq(settings.key, insertSetting.key))
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
  async getAchievements(): Promise<Achievement[]> {
    await this.ensureInitialized();
    return await db.select().from(achievements).orderBy(achievements.createdAt);
  }

  async unlockAchievement(id: number): Promise<Achievement> {
    await this.ensureInitialized();
    const [achievement] = await db
      .update(achievements)
      .set({ isUnlocked: true, unlockedAt: new Date() })
      .where(eq(achievements.id, id))
      .returning();
    
    if (!achievement) {
      throw new Error(`Achievement with id ${id} not found`);
    }
    return achievement;
  }

  async initializeAchievements(): Promise<void> {
    try {
      const existingAchievements = await db.select().from(achievements);
      if (existingAchievements.length === 0) {
        const defaultAchievements = [
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
            type: 'completion',
            name: 'Perfect Day',
            description: 'Complete all habits in a day',
            badge: '⭐',
            requirement: 100,
          },
          {
            type: 'consistency',
            name: 'Weekly Champion',
            description: 'Complete 5 weekly reviews',
            badge: '👑',
            requirement: 5,
          },
          {
            type: 'milestone',
            name: 'Century Club',
            description: 'Complete 100 total days',
            badge: '💯',
            requirement: 100,
          },
        ];

        for (const achievement of defaultAchievements) {
          await db.insert(achievements).values(achievement);
        }
      }
    } catch (error) {
      console.error('Failed to initialize achievements:', error);
    }
  }

  // Streaks
  async getStreaks(): Promise<Streak[]> {
    await this.ensureInitialized();
    return await db.select().from(streaks).orderBy(streaks.type);
  }

  async getStreak(type: string): Promise<Streak | undefined> {
    await this.ensureInitialized();
    const [streak] = await db
      .select()
      .from(streaks)
      .where(eq(streaks.type, type));
    return streak || undefined;
  }

  async updateStreak(type: string, streakData: Partial<InsertStreak>): Promise<Streak> {
    await this.ensureInitialized();
    const existing = await this.getStreak(type);
    
    if (existing) {
      const [streak] = await db
        .update(streaks)
        .set({ ...streakData, updatedAt: new Date() })
        .where(eq(streaks.type, type))
        .returning();
      return streak;
    } else {
      const [streak] = await db
        .insert(streaks)
        .values({ type, ...streakData })
        .returning();
      return streak;
    }
  }

  async calculateStreaks(date: string): Promise<void> {
    await this.ensureInitialized();
    try {
      // Get today's entry
      const todayEntry = await this.getDailyEntry(date);
      if (!todayEntry || !todayEntry.isCompleted) return;

      // Calculate daily completion streak
      const dailyStreak = await this.getStreak('daily_completion');
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
      });

      // Check for achievement unlocks
      await this.checkAchievements(newCurrentStreak, todayEntry);
      
    } catch (error) {
      console.error('Failed to calculate streaks:', error);
    }
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
        await this.unlockAchievement(achievement.id);
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
      await db.delete(settings).where(ne(settings.key, 'theme'));
      
      console.log('All data reset successfully');
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw new Error('Failed to reset data');
    }
  }
}

export const storage = new DatabaseStorage();
