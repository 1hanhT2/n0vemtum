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

export class MemStorage implements IStorage {
  private habits: Map<number, Habit>;
  private dailyEntries: Map<string, DailyEntry>;
  private weeklyReviews: Map<string, WeeklyReview>;
  private settings: Map<string, Setting>;
  private currentHabitId: number;
  private currentDailyEntryId: number;
  private currentWeeklyReviewId: number;
  private currentSettingId: number;

  constructor() {
    this.habits = new Map();
    this.dailyEntries = new Map();
    this.weeklyReviews = new Map();
    this.settings = new Map();
    this.currentHabitId = 1;
    this.currentDailyEntryId = 1;
    this.currentWeeklyReviewId = 1;
    this.currentSettingId = 1;

    // Initialize with default habits
    this.initializeDefaultHabits();
  }

  private async initializeDefaultHabits() {
    const defaultHabits = [
      { name: 'Wake up on time', emoji: '⏰', order: 1, isActive: true },
      { name: 'Focus Session #1', emoji: '🎯', order: 2, isActive: true },
      { name: 'Workout/Exercise', emoji: '💪', order: 3, isActive: true },
      { name: 'Focus Session #2', emoji: '🎯', order: 4, isActive: true },
      { name: 'Review & wind-down', emoji: '🌙', order: 5, isActive: true },
    ];

    for (const habit of defaultHabits) {
      await this.createHabit(habit);
    }
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values()).sort((a, b) => a.order - b.order);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.currentHabitId++;
    const habit: Habit = {
      ...insertHabit,
      id,
      createdAt: new Date(),
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, updateData: Partial<InsertHabit>): Promise<Habit> {
    const habit = this.habits.get(id);
    if (!habit) {
      throw new Error(`Habit with id ${id} not found`);
    }
    const updatedHabit = { ...habit, ...updateData };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<void> {
    if (!this.habits.has(id)) {
      throw new Error(`Habit with id ${id} not found`);
    }
    this.habits.delete(id);
  }

  // Daily Entries
  async getDailyEntry(date: string): Promise<DailyEntry | undefined> {
    return this.dailyEntries.get(date);
  }

  async getDailyEntries(startDate?: string, endDate?: string): Promise<DailyEntry[]> {
    let entries = Array.from(this.dailyEntries.values());
    
    if (startDate) {
      entries = entries.filter(entry => entry.date >= startDate);
    }
    if (endDate) {
      entries = entries.filter(entry => entry.date <= endDate);
    }
    
    return entries.sort((a, b) => a.date.localeCompare(b.date));
  }

  async createDailyEntry(insertEntry: InsertDailyEntry): Promise<DailyEntry> {
    const id = this.currentDailyEntryId++;
    const entry: DailyEntry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
    };
    this.dailyEntries.set(insertEntry.date, entry);
    return entry;
  }

  async updateDailyEntry(date: string, updateData: Partial<InsertDailyEntry>): Promise<DailyEntry> {
    const entry = this.dailyEntries.get(date);
    if (!entry) {
      throw new Error(`Daily entry for date ${date} not found`);
    }
    const updatedEntry = { ...entry, ...updateData };
    this.dailyEntries.set(date, updatedEntry);
    return updatedEntry;
  }

  // Weekly Reviews
  async getWeeklyReview(weekStartDate: string): Promise<WeeklyReview | undefined> {
    return this.weeklyReviews.get(weekStartDate);
  }

  async getWeeklyReviews(): Promise<WeeklyReview[]> {
    return Array.from(this.weeklyReviews.values()).sort((a, b) => 
      b.weekStartDate.localeCompare(a.weekStartDate)
    );
  }

  async createWeeklyReview(insertReview: InsertWeeklyReview): Promise<WeeklyReview> {
    const id = this.currentWeeklyReviewId++;
    const review: WeeklyReview = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.weeklyReviews.set(insertReview.weekStartDate, review);
    return review;
  }

  async updateWeeklyReview(weekStartDate: string, updateData: Partial<InsertWeeklyReview>): Promise<WeeklyReview> {
    const review = this.weeklyReviews.get(weekStartDate);
    if (!review) {
      throw new Error(`Weekly review for week ${weekStartDate} not found`);
    }
    const updatedReview = { ...review, ...updateData };
    this.weeklyReviews.set(weekStartDate, updatedReview);
    return updatedReview;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async getSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async setSetting(insertSetting: InsertSetting): Promise<Setting> {
    const existing = this.settings.get(insertSetting.key);
    if (existing) {
      const updated = { ...existing, value: insertSetting.value, updatedAt: new Date() };
      this.settings.set(insertSetting.key, updated);
      return updated;
    } else {
      const id = this.currentSettingId++;
      const setting: Setting = {
        ...insertSetting,
        id,
        updatedAt: new Date(),
      };
      this.settings.set(insertSetting.key, setting);
      return setting;
    }
  }
}

export const storage = new MemStorage();
