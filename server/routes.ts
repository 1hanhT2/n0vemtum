import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHabitSchema, 
  insertDailyEntrySchema, 
  insertWeeklyReviewSchema,
  insertSettingSchema,
  insertAchievementSchema,
  insertStreakSchema
} from "@shared/schema";
import { z } from "zod";
import { generateHabitSuggestions, generateWeeklyInsights, generateMotivationalMessage, analyzeHabitDifficulty } from "./ai";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Habits routes
  app.get("/api/habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getHabits(userId);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(habitData);
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid habit data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create habit" });
      }
    }
  });

  app.put("/api/habits/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const habitData = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(id, habitData, userId);
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid habit data", details: error.errors });
      } else {
        res.status(404).json({ error: "Habit not found" });
      }
    }
  });

  app.delete("/api/habits/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.deleteHabit(id, userId);
      res.json({ message: "Habit deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: "Habit not found" });
    }
  });

  // Gamification routes
  app.post("/api/habits/:id/level-up", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habit = await storage.levelUpHabit(id);
      res.json(habit);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to level up habit" });
    }
  });

  app.post("/api/habits/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { completed, date } = req.body;
      const habit = await storage.updateHabitProgress(id, completed, date);
      
      // Check for tier promotion after progress update
      const promotedHabit = await storage.calculateTierPromotion(id);
      
      res.json(promotedHabit);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update habit progress" });
    }
  });

  app.post("/api/habits/:id/badge", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { badge } = req.body;
      const habit = await storage.awardBadge(id, badge);
      res.json(habit);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to award badge" });
    }
  });

  // Daily entries routes
  app.get("/api/daily-entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { start_date, end_date } = req.query;
      const entries = await storage.getDailyEntries(
        userId,
        start_date as string, 
        end_date as string
      );
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily entries" });
    }
  });

  app.get("/api/daily-entries/:date", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.params;
      const entry = await storage.getDailyEntry(date, userId);
      if (!entry) {
        res.status(404).json({ error: "Daily entry not found" });
        return;
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily entry" });
    }
  });

  app.post("/api/daily-entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertDailyEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createDailyEntry(entryData);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid daily entry data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create daily entry" });
      }
    }
  });

  app.put("/api/daily-entries/:date", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.params;
      const entryData = insertDailyEntrySchema.partial().parse(req.body);
      const entry = await storage.updateDailyEntry(date, entryData, userId);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid daily entry data", details: error.errors });
      } else {
        res.status(404).json({ error: "Daily entry not found" });
      }
    }
  });

  // Weekly reviews routes
  app.get("/api/weekly-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviews = await storage.getWeeklyReviews(userId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly reviews" });
    }
  });

  app.get("/api/weekly-reviews/:weekStartDate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { weekStartDate } = req.params;
      const review = await storage.getWeeklyReview(weekStartDate, userId);
      if (!review) {
        res.status(404).json({ error: "Weekly review not found" });
        return;
      }
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly review" });
    }
  });

  app.post("/api/weekly-reviews", async (req, res) => {
    try {
      const reviewData = insertWeeklyReviewSchema.parse(req.body);
      const review = await storage.createWeeklyReview(reviewData);
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid weekly review data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create weekly review" });
      }
    }
  });

  app.put("/api/weekly-reviews/:weekStartDate", async (req, res) => {
    try {
      const { weekStartDate } = req.params;
      const reviewData = insertWeeklyReviewSchema.partial().parse(req.body);
      const review = await storage.updateWeeklyReview(weekStartDate, reviewData);
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid weekly review data", details: error.errors });
      } else {
        res.status(404).json({ error: "Weekly review not found" });
      }
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSetting(key);
      if (!setting) {
        res.status(404).json({ error: "Setting not found" });
        return;
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const settingData = insertSettingSchema.parse(req.body);
      const setting = await storage.setSetting(settingData);
      res.json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid setting data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to save setting" });
      }
    }
  });

  // Achievements routes
  app.get("/api/achievements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements/:id/unlock", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const achievement = await storage.unlockAchievement(id, userId);
      res.json(achievement);
    } catch (error) {
      res.status(404).json({ error: "Achievement not found" });
    }
  });

  // Streaks routes
  app.get("/api/streaks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streaks = await storage.getStreaks(userId);
      res.json(streaks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch streaks" });
    }
  });

  app.get("/api/streaks/:type", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.params;
      const streak = await storage.getStreak(type, userId);
      if (!streak) {
        res.status(404).json({ error: "Streak not found" });
        return;
      }
      res.json(streak);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch streak" });
    }
  });

  // Data reset route
  app.post("/api/reset-data", async (req, res) => {
    try {
      await storage.resetAllData();
      res.json({ message: "Data reset successfully" });
    } catch (error) {
      console.error("Failed to reset data:", error);
      res.status(500).json({ error: "Failed to reset data" });
    }
  });

  // AI-powered routes
  app.get("/api/ai/habit-suggestions", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      const suggestions = await generateHabitSuggestions(habits);
      res.json(suggestions);
    } catch (error) {
      console.error('AI habit suggestions error:', error);
      res.status(500).json({ error: "Failed to generate habit suggestions" });
    }
  });

  app.post("/api/ai/weekly-insights", async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      const [dailyEntries, habits] = await Promise.all([
        storage.getDailyEntries(startDate, endDate),
        storage.getHabits()
      ]);
      
      const insights = await generateWeeklyInsights(dailyEntries, habits);
      res.json(insights);
    } catch (error) {
      console.error('AI weekly insights error:', error);
      res.status(500).json({ error: "Failed to generate weekly insights" });
    }
  });

  app.post("/api/ai/motivation", async (req, res) => {
    try {
      const { completionRate, currentStreak } = req.body;
      
      // Validate inputs
      if (typeof completionRate !== 'number' || typeof currentStreak !== 'number') {
        return res.status(400).json({ error: "Invalid completion rate or streak" });
      }
      
      const message = await generateMotivationalMessage(completionRate, currentStreak);
      res.json({ message });
    } catch (error) {
      console.error('AI motivation error:', error);
      res.status(500).json({ error: "Failed to generate motivational message" });
    }
  });

  app.post("/api/ai/analyze-habit-difficulty/:id", async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabitById(habitId);
      
      if (!habit) {
        res.status(404).json({ error: "Habit not found" });
        return;
      }

      // Get user's completion data for this habit (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      const dailyEntries = await storage.getDailyEntries(startDate);
      const completionData = dailyEntries.map(entry => ({
        date: entry.date,
        completed: entry.habitCompletions?.[habitId] || false
      }));

      const analysis = await analyzeHabitDifficulty(habit, completionData);
      
      // Update the habit with the analysis
      await storage.updateHabitDifficulty(habitId, analysis.difficulty, analysis.analysis);
      
      res.json(analysis);
    } catch (error) {
      console.error("Failed to analyze habit difficulty:", error);
      res.status(500).json({ error: "Failed to analyze habit difficulty" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
