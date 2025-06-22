import { 
  habits, 
  dailyEntries, 
  weeklyReviews, 
  settings,
  type Habit, 
  type InsertHabit,
  type DailyEntry,
  type InsertDailyEntry,
  type WeeklyReview,
  type InsertWeeklyReview,
  type Setting,
  type InsertSetting
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
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultHabits();
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
    return await db.select().from(habits).orderBy(habits.order);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await db
      .insert(habits)
      .values(insertHabit)
      .returning();
    return habit;
  }

  async updateHabit(id: number, updateData: Partial<InsertHabit>): Promise<Habit> {
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
    const result = await db
      .delete(habits)
      .where(eq(habits.id, id));
    
    if (result.rowCount === 0) {
      throw new Error(`Habit with id ${id} not found`);
    }
  }

  // Daily Entries
  async getDailyEntry(date: string): Promise<DailyEntry | undefined> {
    const [entry] = await db
      .select()
      .from(dailyEntries)
      .where(eq(dailyEntries.date, date));
    return entry || undefined;
  }

  async getDailyEntries(startDate?: string, endDate?: string): Promise<DailyEntry[]> {
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
    const [entry] = await db
      .insert(dailyEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async updateDailyEntry(date: string, updateData: Partial<InsertDailyEntry>): Promise<DailyEntry> {
    const [entry] = await db
      .update(dailyEntries)
      .set(updateData)
      .where(eq(dailyEntries.date, date))
      .returning();
    
    if (!entry) {
      throw new Error(`Daily entry for date ${date} not found`);
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
}

export const storage = new DatabaseStorage();
