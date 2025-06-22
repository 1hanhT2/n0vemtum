import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHabitSchema, 
  insertDailyEntrySchema, 
  insertWeeklyReviewSchema,
  insertSettingSchema 
} from "@shared/schema";
import { z } from "zod";
import { generateHabitSuggestions, generateWeeklyInsights, generateMotivationalMessage } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Habits routes
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
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

  app.put("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const habitData = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(id, habitData);
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid habit data", details: error.errors });
      } else {
        res.status(404).json({ error: "Habit not found" });
      }
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteHabit(id);
      res.json({ message: "Habit deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: "Habit not found" });
    }
  });

  // Daily entries routes
  app.get("/api/daily-entries", async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      const entries = await storage.getDailyEntries(
        start_date as string, 
        end_date as string
      );
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily entries" });
    }
  });

  app.get("/api/daily-entries/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const entry = await storage.getDailyEntry(date);
      if (!entry) {
        res.status(404).json({ error: "Daily entry not found" });
        return;
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily entry" });
    }
  });

  app.post("/api/daily-entries", async (req, res) => {
    try {
      const entryData = insertDailyEntrySchema.parse(req.body);
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

  app.put("/api/daily-entries/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const entryData = insertDailyEntrySchema.partial().parse(req.body);
      const entry = await storage.updateDailyEntry(date, entryData);
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
  app.get("/api/weekly-reviews", async (req, res) => {
    try {
      const reviews = await storage.getWeeklyReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly reviews" });
    }
  });

  app.get("/api/weekly-reviews/:weekStartDate", async (req, res) => {
    try {
      const { weekStartDate } = req.params;
      const review = await storage.getWeeklyReview(weekStartDate);
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

  const httpServer = createServer(app);
  return httpServer;
}
