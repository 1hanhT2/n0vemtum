import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHabitSchema, 
  insertDailyEntrySchema, 
  insertWeeklyReviewSchema,
  insertSettingSchema,
  insertAchievementSchema,
  insertStreakSchema,
  insertSubtaskSchema,
  insertGoalSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { z } from "zod";
import { generateHabitSuggestions, generateWeeklyInsights, generateMotivationalMessage, analyzeHabitDifficulty, generateAssistantReply } from "./ai";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { validateDateParam, validateNumericParam, sanitizeBody } from "./validation";

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

  app.get('/api/user/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      if (!progress) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });
  
  // Habits routes
  app.get("/api/habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getHabits(userId);
      res.json(habits);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habitData = insertHabitSchema.parse({ ...req.body, userId });
      const habit = await storage.createHabit(habitData);
      res.json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", details: error.errors });
      } else {
        console.error("Failed to create habit:", error);
        res.status(500).json({ message: "Failed to create habit" });
      }
    }
  });

  app.put("/api/habits/:id", isAuthenticated, validateNumericParam('id'), sanitizeBody, async (req: any, res) => {
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
  app.post("/api/habits/:id/level-up", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const habit = await storage.levelUpHabit(id, userId);
      res.json(habit);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to level up habit" });
    }
  });

  app.post("/api/habits/:id/progress", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { completed, date } = req.body;
      
      // Validate input
      if (typeof completed !== 'boolean' || typeof date !== 'string') {
        return res.status(400).json({ error: "Invalid input: completed must be boolean and date must be string" });
      }
      
      const habit = await storage.updateHabitProgress(id, completed, date, userId);
      const progress = await storage.getUserProgress(userId);
      if (!progress) {
        res.json(habit);
        return;
      }
      const user = await storage.getUser(userId);
      res.json({
        ...habit,
        userProgress: {
          level: progress.level,
          xp: progress.xp,
          xpToNext: progress.xpToNext,
        },
        user,
      });
    } catch (error) {
      console.error(`Habit progress update error for habit ${req.params.id}:`, error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update habit progress" });
    }
  });

  app.post("/api/habits/:id/badge", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { badge } = req.body;
      const habit = await storage.awardBadge(id, badge, userId);
      res.json(habit);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to award badge" });
    }
  });

  // Subtasks routes
  app.get("/api/subtasks/:habitId", isAuthenticated, async (req: any, res) => {
    try {
      const habitId = parseInt(req.params.habitId);
      const userId = req.user.claims.sub;
      const subtasks = await storage.getSubtasks(habitId, userId);
      res.json(subtasks);
    } catch (error) {
      if (error instanceof Error && error.message.includes('access denied')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to fetch subtasks" });
      }
    }
  });

  app.post("/api/subtasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subtaskData = insertSubtaskSchema.parse({ ...req.body, userId });
      const subtask = await storage.createSubtask(subtaskData);
      res.json(subtask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid subtask data", details: error.errors });
      } else if (error instanceof Error && error.message.includes('access denied')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create subtask" });
      }
    }
  });

  app.put("/api/subtasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Parse the request body but exclude sensitive fields
      const parsedData = insertSubtaskSchema.partial().parse(req.body);
      
      // Never allow changing userId - force it to authenticated user
      const { userId: _, habitId: reqHabitId, ...safeData } = parsedData;
      
      // Build the final update data
      const updateData: Partial<typeof parsedData> = { ...safeData };
      
      // If habitId is being changed, verify the new habit belongs to the user
      if (reqHabitId !== undefined) {
        const habit = await storage.getHabitById(reqHabitId, userId);
        if (!habit) {
          res.status(403).json({ error: "Cannot move subtask to a habit you don't own" });
          return;
        }
        updateData.habitId = reqHabitId;
      }
      
      const subtask = await storage.updateSubtask(id, updateData, userId);
      res.json(subtask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid subtask data", details: error.errors });
      } else if (error instanceof Error && error.message.includes('access denied')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(404).json({ error: "Subtask not found" });
      }
    }
  });

  app.delete("/api/subtasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.deleteSubtask(id, userId);
      res.json({ message: "Subtask deleted successfully" });
    } catch (error) {
      if (error instanceof Error && error.message.includes('access denied')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(404).json({ error: "Subtask not found" });
      }
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

  app.get("/api/daily-entries/:date", isAuthenticated, validateDateParam('date'), async (req: any, res) => {
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

  app.post("/api/daily-entries", isAuthenticated, sanitizeBody, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log('Creating daily entry for user:', userId, 'with data:', req.body);
      const entryData = insertDailyEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.createDailyEntry(entryData);
      console.log('Daily entry created successfully:', entry.id);
      res.json(entry);
    } catch (error) {
      console.error("Create daily entry error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid daily entry data", details: error.errors });
      } else {
        res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create daily entry" });
      }
    }
  });

  app.put("/api/daily-entries/:date", isAuthenticated, validateDateParam('date'), sanitizeBody, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.params;
      console.log('Updating daily entry for user:', userId, 'date:', date, 'with data:', req.body);
      const updateData = insertDailyEntrySchema.partial().parse(req.body);
      const entry = await storage.updateDailyEntry(date, updateData, userId);
      console.log('Daily entry updated successfully:', entry.id);
      res.json(entry);
    } catch (error) {
      console.error(`Update daily entry error for date ${req.params.date}:`, error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid daily entry data", details: error.errors });
      } else {
        res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update daily entry" });
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

  app.post("/api/weekly-reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertWeeklyReviewSchema.parse({ ...req.body, userId });
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

  app.put("/api/weekly-reviews/:weekStartDate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { weekStartDate } = req.params;
      const reviewData = insertWeeklyReviewSchema.partial().parse(req.body);
      const review = await storage.updateWeeklyReview(weekStartDate, reviewData, userId);
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
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getSettings(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { key } = req.params;
      const setting = await storage.getSetting(key, userId);
      if (!setting) {
        res.status(404).json({ error: "Setting not found" });
        return;
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settingData = insertSettingSchema.parse({ ...req.body, userId });
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

  // Goals routes
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, sanitizeBody, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertGoalSchema.parse({ ...req.body, userId });
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid goal data", details: error.errors });
      } else {
        console.error("Failed to create goal:", error);
        res.status(500).json({ error: "Failed to create goal" });
      }
    }
  });

  app.put("/api/goals/:id", isAuthenticated, validateNumericParam('id'), sanitizeBody, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const parsed = insertGoalSchema.partial().parse(req.body);
      const { userId: _ignored, ...goalData } = parsed;
      const goal = await storage.updateGoal(id, goalData, userId);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid goal data", details: error.errors });
      } else {
        console.error("Failed to update goal:", error);
        res.status(404).json({ error: "Goal not found" });
      }
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, validateNumericParam('id'), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.deleteGoal(id, userId);
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      console.error("Failed to delete goal:", error);
      res.status(404).json({ error: "Goal not found" });
    }
  });

  // Assistant chat routes
  app.get("/api/assistant/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
      const messages = await storage.getChatMessages(userId, Number.isFinite(limit) ? limit : 50);
      res.json(messages);
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/assistant/messages", isAuthenticated, sanitizeBody, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }

      const userMessageData = insertChatMessageSchema.parse({
        userId,
        role: "user",
        content,
      });
      const userMessage = await storage.createChatMessage(userMessageData);

      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const [habits, goals, dailyEntries, chatHistory, user] = await Promise.all([
        storage.getHabits(userId),
        storage.getGoals(userId),
        storage.getDailyEntries(userId, startDate, endDate),
        storage.getChatMessages(userId, 20),
        storage.getUser(userId),
      ]);

      const assistantReply = await generateAssistantReply({
        message: content,
        chatHistory,
        habits,
        goals,
        dailyEntries,
        user,
      });

      const assistantMessageData = insertChatMessageSchema.parse({
        userId,
        role: "assistant",
        content: assistantReply,
      });
      const assistantMessage = await storage.createChatMessage(assistantMessageData);

      res.json({ userMessage, assistantMessage });
    } catch (error) {
      console.error("Failed to send assistant message:", error);
      res.status(500).json({ error: "Failed to send assistant message" });
    }
  });

  app.delete("/api/assistant/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearChatMessages(userId);
      res.json({ message: "Chat history cleared" });
    } catch (error) {
      console.error("Failed to clear chat history:", error);
      res.status(500).json({ error: "Failed to clear chat history" });
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
  app.post("/api/reset-data", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.resetUserData(userId);
      
      // Destroy the session to log out the user
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });
      
      res.clearCookie('pushfoward.sid');
      res.clearCookie('connect.sid'); // Clear both possible cookie names
      res.json({ message: "Data reset successfully and user logged out" });
    } catch (error) {
      console.error("Failed to reset data:", error);
      res.status(500).json({ error: "Failed to reset data" });
    }
  });

  // AI-powered routes
  app.get("/api/ai/habit-suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getHabits(userId);
      const suggestions = await generateHabitSuggestions(habits);
      res.json(suggestions);
    } catch (error) {
      console.error('AI habit suggestions error:', error);
      res.status(500).json({ error: "Failed to generate habit suggestions" });
    }
  });

  app.post("/api/ai/weekly-insights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.body;
      const [dailyEntries, habits] = await Promise.all([
        storage.getDailyEntries(userId, startDate, endDate),
        storage.getHabits(userId)
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

  app.post("/api/ai/analyze-habit-difficulty/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habitId = parseInt(req.params.id);
      const habit = await storage.getHabitById(habitId, userId);
      
      if (!habit) {
        res.status(404).json({ error: "Habit not found" });
        return;
      }

      // Get user's completion data for this habit (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      const dailyEntries = await storage.getDailyEntries(userId, startDate);
      const completionData = dailyEntries.map(entry => ({
        date: entry.date,
        completed: (entry.habitCompletions as Record<number, boolean>)?.[habitId] || false
      }));

      const analysis = await analyzeHabitDifficulty(habit, completionData);
      
      // Update the habit with the analysis
      await storage.updateHabitDifficulty(habitId, analysis.difficulty, analysis.analysis, userId);
      
      res.json(analysis);
    } catch (error) {
      console.error("Failed to analyze habit difficulty:", error);
      res.status(500).json({ error: "Failed to analyze habit difficulty" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
