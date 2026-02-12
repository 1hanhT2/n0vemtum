import type { Habit, DailyEntry, WeeklyReview, Goal, ChatMessage, User } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import { aiCache } from "./cache";
import { type GeminiModelId } from "@shared/ai-models";

// Gemini configuration
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const MAX_PERSONALIZATION_LENGTH = 800;

function extractInsight(text: string, key: string): string | null {
  const regex = new RegExp(`"${key}":\\s*"([^"]*)"`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

type GeminiTask =
  | "chat"
  | "simple"
  | "difficulty"
  | "analysis"
  | "default";

const modelPriority: Record<GeminiTask, GeminiModelId[]> = {
  chat: [
    "gemini-3-pro-preview",
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ],
  simple: [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3-flash-preview",
    "gemini-3-pro-preview",
  ],
  difficulty: [
    "gemini-2.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash-lite",
    "gemini-3-pro-preview",
  ],
  analysis: [
    "gemini-2.5-flash",
    "gemini-3-flash-preview",
    "gemini-2.5-flash-lite",
    "gemini-3-pro-preview",
  ],
  default: [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3-pro-preview",
  ],
};

async function callGemini(
  prompt: string,
  kind: GeminiTask = "default",
  options?: { preferredModel?: GeminiModelId }
): Promise<string> {
  const models = modelPriority[kind] || modelPriority.default;
  const orderedModels = options?.preferredModel
    ? [options.preferredModel, ...models.filter((model) => model !== options.preferredModel)]
    : models;

  for (const model of orderedModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      if (response.text) {
        console.log(`Successfully used Gemini model: ${model}`);
        return response.text;
      }
    } catch (error) {
      console.log(`Gemini model ${model} failed:`, error);
      continue;
    }
  }
  
  throw new Error("All Gemini models unavailable");
}

function formatPersonalizationContext(personalization?: string) {
  if (!personalization) return "";
  const trimmed = personalization.trim();
  if (!trimmed) return "";
  const clipped = trimmed.length > MAX_PERSONALIZATION_LENGTH
    ? trimmed.slice(0, MAX_PERSONALIZATION_LENGTH)
    : trimmed;
  return `PERSONAL CONTEXT (user-provided, follow when relevant, do not invent details beyond this):\n${clipped}\n`;
}

export async function generateHabitSuggestions(
  existingHabits: Habit[],
  options?: {
    difficulty?: number;
    type?: string;
    force?: boolean;
    personalization?: string;
    preferredModel?: GeminiModelId;
  }
): Promise<any[]> {
  // Create cache key based on habit names
  const habitNames = existingHabits.map(h => h.name).sort().join(", ");
  const difficulty = Math.max(0, Math.min(100, Number(options?.difficulty ?? 50)));
  const type = (options?.type || "balanced").toLowerCase();
  const personalization = options?.personalization?.trim() || "";
  const personalizationToken = personalization ? personalization.slice(0, 120) : "";
  const cacheKey = `habit-suggestions:${habitNames}:diff:${difficulty}:type:${type}${personalizationToken ? `:personal:${personalizationToken}` : ""}`;
  const personalizationBlock = formatPersonalizationContext(personalization);
  
  // Check cache first unless forcing a refresh
  if (!options?.force) {
    const cached = aiCache.get<string[]>(cacheKey);
    if (cached) {
      console.log('Returning cached habit suggestions');
      return cached;
    }
  }
  
  const prompt = `Given existing habits: ${habitNames}
User preference: difficulty ${difficulty}/100, type: ${type}.
${personalizationBlock}

Generate 3-5 short, specific one-off challenges that complement the existing habits and match the requested type. Avoid duplicating the listed habits. Calibrate intensity and XP to the difficulty: low difficulty = gentle/low XP; high difficulty = tougher/higher XP. Keep each challenge concise (max 12 words), measurable, and actionable for today.

Output ONLY a valid JSON array. No explanations, no markdown, just the JSON:

[{"name": "short specific challenge", "emoji": "emoji", "xp": 20, "type": "physical"}]

Examples of good suggestions:
- {"name": "10-min brisk walk outside", "emoji": "🚶", "xp": 20, "type": "physical"}
- {"name": "Drink water at 8 AM", "emoji": "💧", "xp": 12, "type": "wellness"}
- {"name": "5-min evening stretch", "emoji": "🤸", "xp": 18, "type": "physical"}
- {"name": "Read 1 page of a book", "emoji": "📚", "xp": 15, "type": "mental"}`;

  try {
    const response = await callGemini(prompt, "simple", { preferredModel: options?.preferredModel });
    // Extract JSON array from any text response - handle multiline arrays
    const arrayMatch = response.match(/\[[\s\S]*?\]/);
    if (!arrayMatch) {
      // Try to find array without brackets if response is clean JSON
      if (response.trim().startsWith('[') && response.trim().endsWith(']')) {
        const suggestions = JSON.parse(response.trim());
        return Array.isArray(suggestions) ? suggestions : getDefaultHabitSuggestions(existingHabits);
      }
      return getDefaultHabitSuggestions(existingHabits);
    }
    
    const jsonString = arrayMatch[0];
    const suggestions = JSON.parse(jsonString);
    const normalized = normalizeSuggestions(suggestions);
    const result = normalized.length > 0 ? normalized : getDefaultHabitSuggestions(existingHabits);
    
    // Cache the result for 30 minutes (skip if force-refresh)
    if (!options?.force) {
      aiCache.set(cacheKey, result, 30);
    }
    return result;
  } catch (error) {
    console.error('Error generating habit suggestions:', error);
    // Fallback to curated suggestions if API fails
    return getDefaultHabitSuggestions(existingHabits);
  }
}

function getDefaultHabitSuggestions(existingHabits: Habit[]): any[] {
  const allSuggestions = [
    {"name": "Drink water at wake-up", "emoji": "💧", "xp": 12},
    {"name": "10-min morning meditation", "emoji": "🧘", "xp": 18},
    {"name": "Write 3 gratitude notes", "emoji": "📝", "xp": 15},
    {"name": "5-min bedtime stretches", "emoji": "🤸", "xp": 16},
    {"name": "Read 1 page daily", "emoji": "📚", "xp": 14},
    {"name": "15-min lunch walk", "emoji": "🚶", "xp": 20},
    {"name": "3-min deep breathing", "emoji": "🫁", "xp": 10},
    {"name": "Listen to podcast", "emoji": "🎧", "xp": 12},
    {"name": "Digital sunset at 9 PM", "emoji": "📱", "xp": 18},
    {"name": "Plan tomorrow at night", "emoji": "📅", "xp": 16}
  ];
  
  const existingNames = existingHabits.map(h => h.name.toLowerCase());
  return allSuggestions.filter(suggestion => 
    !existingNames.some(name => 
      name.includes(suggestion.name.toLowerCase().split(' ')[0])
    )
  ).slice(0, 5);
}

function normalizeSuggestions(raw: any[]): any[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") {
      return { name: item, emoji: "✨", xp: 15 };
    }
    if (typeof item === "object" && item !== null) {
      const name = item.name || item.title || "New challenge";
      const emoji = item.emoji || "✨";
      const xp = Number(item.xp);
      const safeXp = Number.isFinite(xp) ? Math.max(5, Math.min(50, Math.round(xp))) : 15;
      return { name, emoji, xp: safeXp };
    }
    return null;
  }).filter(Boolean);
}

type WeeklyInsights = {
  patterns: string;
  strengths: string;
  improvements: string;
  motivation: string;
  scheduleSupport: string;
  scheduleRisk: string;
  nextActions: string[];
};

function getCompletionRateForEntry(entry: DailyEntry, habitCount: number): number {
  if (habitCount <= 0) return 0;
  const completedHabits = Object.values(entry.habitCompletions as Record<string, boolean>).filter(Boolean).length;
  return (completedHabits / habitCount) * 100;
}

function getWeekdayLabel(dateKey: string): string {
  const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const date = new Date(`${dateKey}T00:00:00Z`);
  const index = Number.isNaN(date.getTime()) ? 0 : date.getUTCDay();
  return labels[index] || "Monday";
}

function buildFallbackWeeklyInsights(dailyEntries: DailyEntry[], habits: Habit[]): WeeklyInsights {
  const safeHabitCount = Math.max(1, habits.length);
  const completionRate = dailyEntries.length > 0
    ? dailyEntries.reduce((sum, entry) => sum + getCompletionRateForEntry(entry, safeHabitCount), 0) / dailyEntries.length
    : 0;

  const weekdayStats = new Map<string, { total: number; count: number }>();
  dailyEntries.forEach((entry) => {
    const label = getWeekdayLabel(entry.date);
    const current = weekdayStats.get(label) || { total: 0, count: 0 };
    current.total += getCompletionRateForEntry(entry, safeHabitCount);
    current.count += 1;
    weekdayStats.set(label, current);
  });

  const rankedDays = Array.from(weekdayStats.entries())
    .map(([day, stats]) => ({
      day,
      avg: stats.count > 0 ? stats.total / stats.count : 0,
    }))
    .sort((a, b) => b.avg - a.avg);

  const supportDay = rankedDays[0];
  const riskDay = rankedDays[rankedDays.length - 1];

  const scheduleSupport = supportDay
    ? `${supportDay.day} is your strongest execution window (${Math.round(supportDay.avg)}% completion).`
    : "Your best execution window is still forming. Keep logging daily entries for clearer signals.";
  const scheduleRisk = riskDay
    ? `${riskDay.day} shows the most breakdown risk (${Math.round(riskDay.avg)}% completion).`
    : "No clear breakdown window yet. Watch for days where routines slip after schedule changes.";

  const nextActions: string[] = [];
  if (completionRate < 60) {
    nextActions.push("Reduce one low-performing habit to a 5-minute minimum version.");
  } else {
    nextActions.push("Keep current scope and add one consistency trigger to your weakest habit.");
  }

  if (riskDay) {
    nextActions.push(`Protect ${riskDay.day} with a fixed start time and backup routine.`);
  }

  if (supportDay && (!riskDay || supportDay.day !== riskDay.day)) {
    nextActions.push(`Anchor your hardest habit on ${supportDay.day}, your strongest day.`);
  }

  while (nextActions.length < 3) {
    nextActions.push("Review daily notes and remove one friction point before next week.");
  }

  return {
    patterns: completionRate > 80
      ? "Strong consistency pattern observed in your habit tracking."
      : "Completion varies across the week, with room to stabilize your routine.",
    strengths: completionRate > 60
      ? "You are building positive momentum with regular habit execution."
      : "You are maintaining enough activity to build a stronger baseline next week.",
    improvements: "Focus on one bottleneck window and simplify habit scope on lower-energy days.",
    motivation: completionRate > 70
      ? "Your system is compounding. Keep the loop tight and consistent."
      : "Progress is still compounding. Small daily wins will stabilize momentum.",
    scheduleSupport,
    scheduleRisk,
    nextActions: nextActions.slice(0, 3),
  };
}

function normalizeWeeklyInsights(raw: unknown, fallback: WeeklyInsights): WeeklyInsights {
  const source = (typeof raw === "object" && raw !== null) ? (raw as Record<string, unknown>) : {};
  const nextActionsRaw = Array.isArray(source.nextActions) ? source.nextActions : [];
  const nextActions = nextActionsRaw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  const readText = (key: keyof WeeklyInsights): string => {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    return fallback[key] as string;
  };

  return {
    patterns: readText("patterns"),
    strengths: readText("strengths"),
    improvements: readText("improvements"),
    motivation: readText("motivation"),
    scheduleSupport: readText("scheduleSupport"),
    scheduleRisk: readText("scheduleRisk"),
    nextActions: nextActions.length > 0 ? nextActions : fallback.nextActions,
  };
}

export async function generateWeeklyInsights(
  dailyEntries: DailyEntry[], 
  habits: Habit[],
  personalization?: string,
  preferredModel?: GeminiModelId
): Promise<WeeklyInsights> {
  const fallbackInsights = buildFallbackWeeklyInsights(dailyEntries, habits);
  const personalizationBlock = formatPersonalizationContext(personalization);
  const completionData = dailyEntries.map(entry => ({
    date: entry.date,
    score: (entry.punctualityScore + entry.adherenceScore) / 2,
    completedHabits: Object.values(entry.habitCompletions as Record<string, boolean>).filter(Boolean).length,
    totalHabits: habits.length,
    notes: entry.notes
  }));

  // Extract and format notes for analysis
  const notesData = dailyEntries
    .filter(entry => entry.notes && entry.notes.trim().length > 0)
    .map(entry => `${entry.date}: "${entry.notes}"`)
    .join('\n');

  const prompt = `${personalizationBlock}Analyze habit tracking data and daily reflections:

COMPLETION DATA: ${JSON.stringify(completionData)}

DAILY NOTES & REFLECTIONS:
${notesData || 'No daily notes recorded this period.'}

HABITS BEING TRACKED: ${habits.map(h => `${h.emoji} ${h.name}`).join(', ')}

Provide insights that incorporate both quantitative data and qualitative notes. Reference specific insights from the user's own reflections when available.
Highlight where the schedule helps execution and where it breaks down.

Output ONLY valid JSON with insights:

{
  "patterns": "pattern observation incorporating notes context",
  "strengths": "what went well based on data and notes",
  "improvements": "actionable suggestions informed by reflections",
  "motivation": "encouraging message that acknowledges their thoughts",
  "scheduleSupport": "specific schedule window that supports execution",
  "scheduleRisk": "specific schedule window that sabotages execution",
  "nextActions": [
    "concrete action with clear behavior change",
    "concrete action with timing or constraint",
    "concrete action that reduces friction"
  ]
}`;

  try {
    const response = await callGemini(prompt, "analysis", { preferredModel });
    // Clean up the response by removing markdown code blocks
    const cleanedResponse = response.replace(/```json\s*|\s*```/g, '').trim();
    
    // Try to extract and parse JSON
    const objectMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        const parsed = JSON.parse(objectMatch[0]);
        return normalizeWeeklyInsights(parsed, fallbackInsights);
      } catch (parseError) {
        // If JSON parsing fails, create structured response from text
        const insights = {
          patterns: extractInsight(response, 'patterns'),
          strengths: extractInsight(response, 'strengths'),
          improvements: extractInsight(response, 'improvements'),
          motivation: extractInsight(response, 'motivation'),
          scheduleSupport: extractInsight(response, 'scheduleSupport'),
          scheduleRisk: extractInsight(response, 'scheduleRisk'),
        };
        return normalizeWeeklyInsights(insights, fallbackInsights);
      }
    }
    throw new Error('No insights found');
  } catch (error) {
    console.error('Error generating weekly insights:', error);
    return fallbackInsights;
  }
}

export async function analyzeHabitDifficulty(
  habit: any,
  userCompletionData?: any[],
  personalization?: string,
  preferredModel?: GeminiModelId
): Promise<{
  difficulty: number;
  analysis: string;
}> {
  const personalizationKey = personalization?.trim() ? personalization.trim().slice(0, 120) : "";
  const cacheKey = `difficulty_${habit.id}_${habit.name}${personalizationKey ? `:${personalizationKey}` : ""}`;
  const cached = aiCache.get<{ difficulty: number; analysis: string }>(cacheKey);
  
  if (cached) {
    console.log('Returning cached difficulty analysis');
    return cached;
  }

  try {
    const completionContext = userCompletionData && userCompletionData.length > 0 
      ? `User completion data shows ${userCompletionData.filter(d => d.completed).length}/${userCompletionData.length} successful completions.`
      : 'No completion history available yet.';

    const personalizationBlock = formatPersonalizationContext(personalization);
    const prompt = `${personalizationBlock}Analyze the difficulty of this habit and provide a rating.

Habit: "${habit.emoji} ${habit.name}"
${completionContext}

Use this 1-5 star scale (pick the closest match):
1 star (Very Easy): <=5 minutes, minimal effort, no prep, low friction, easy to start.
2 stars (Easy): 5-15 minutes, light effort, simple steps, minor friction.
3 stars (Moderate): 15-30 minutes, sustained focus/effort, moderate friction or consistency demands.
4 stars (Hard): 30-60 minutes, high effort or coordination, significant barriers or setup.
5 stars (Very Hard): 60+ minutes, high intensity/complexity, strong barriers, high skill or dependency.

Consider factors like:
- Time commitment required
- Physical or mental effort needed
- Frequency and consistency demands
- Environmental dependencies
- Skill requirements
- Motivation sustainability
- Completion history (if low success rate, lean higher)

Respond with JSON format:
{
  "difficulty": [1-5 integer where 1=very easy, 5=very difficult],
  "analysis": "[Brief 2-3 sentence explanation of the difficulty rating and key factors]"
}`;

    const response = await callGemini(prompt, "difficulty", { preferredModel });
    
    try {
      // Clean up the response by removing markdown code blocks
      const cleanedResponse = response.replace(/```json\s*|\s*```/g, '').trim();
      const result = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (typeof result.difficulty === 'number' && 
          result.difficulty >= 1 && 
          result.difficulty <= 5 &&
          typeof result.analysis === 'string') {
        
        aiCache.set(cacheKey, result, 60 * 24); // Cache for 24 hours
        return result;
      }
    } catch (parseError) {
      console.error('Failed to parse AI difficulty response:', parseError);
    }
    
    // Fallback analysis based on habit patterns
    return getHeuristicDifficulty(habit);
    
  } catch (error) {
    console.error('Failed to analyze habit difficulty:', error);
    return getHeuristicDifficulty(habit);
  }
}

function getHeuristicDifficulty(habit: any): { difficulty: number; analysis: string } {
  const name = habit.name.toLowerCase();
  
  // Physical activities - generally higher difficulty
  if (name.includes('exercise') || name.includes('workout') || name.includes('run') || 
      name.includes('gym') || name.includes('sport')) {
    return {
      difficulty: 4,
      analysis: "Physical activities require consistent energy and motivation. Weather, fatigue, and schedule conflicts can create barriers."
    };
  }
  
  // Time-intensive habits
  if (name.includes('read') || name.includes('study') || name.includes('learn')) {
    return {
      difficulty: 3,
      analysis: "Learning-based habits need sustained attention and time commitment. Progress may feel slow initially but compounds over time."
    };
  }
  
  // Social or external dependencies
  if (name.includes('call') || name.includes('meet') || name.includes('social')) {
    return {
      difficulty: 4,
      analysis: "Social habits depend on others' availability and external coordination, making consistency more challenging."
    };
  }
  
  // Simple daily maintenance
  if (name.includes('water') || name.includes('vitamin') || name.includes('brush')) {
    return {
      difficulty: 2,
      analysis: "Basic maintenance habits are low-effort but require consistent memory and routine integration."
    };
  }
  
  // Sleep-related
  if (name.includes('sleep') || name.includes('wake') || name.includes('bed')) {
    return {
      difficulty: 3,
      analysis: "Sleep habits affect and are affected by your entire daily rhythm. Changes require patience and consistency."
    };
  }
  
  // Mindfulness and mental habits
  if (name.includes('meditat') || name.includes('mindful') || name.includes('gratitude')) {
    return {
      difficulty: 3,
      analysis: "Mental habits require discipline and inner focus. Benefits are often internal and may take time to notice."
    };
  }
  
  // Default for unknown habits
  return {
    difficulty: 3,
    analysis: "Difficulty varies based on personal circumstances, motivation, and how well this habit fits into your current routine."
  };
}

export async function generateMotivationalMessage(
  completionRate: number,
  currentStreak: number
): Promise<string> {
  // Round completion rate to reduce cache misses
  const roundedRate = Math.round(completionRate * 100) / 100;
  const cacheKey = `motivation:${roundedRate}:${currentStreak}`;
  
  // Check cache first
  const cached = aiCache.get<string>(cacheKey);
  if (cached) {
    console.log('Returning cached motivational message');
    return cached;
  }
  
  // Generate contextual motivational messages based on performance
  if (completionRate >= 90) {
    const messages = [
      `Outstanding ${roundedRate}% completion rate! Your ${currentStreak}-day streak shows incredible dedication.`,
      `Exceptional consistency at ${roundedRate}%! You're building rock-solid habits with this ${currentStreak}-day streak.`,
      `Amazing ${roundedRate}% performance! Your ${currentStreak} days of commitment are paying off beautifully.`
    ];
    const result = messages[Math.floor(Math.random() * messages.length)];
    
    // Cache for 10 minutes
    aiCache.set(cacheKey, result, 10);
    return result;
  } else if (completionRate >= 70) {
    const messages = [
      `Strong ${completionRate}% completion rate! Your ${currentStreak}-day streak proves you're on the right track.`,
      `Great progress at ${completionRate}%! Keep building on this ${currentStreak}-day momentum.`,
      `Solid ${completionRate}% consistency! Your ${currentStreak} days show real commitment to growth.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else if (completionRate >= 50) {
    const messages = [
      `Making progress at ${completionRate}%! Every day in your ${currentStreak}-day streak counts toward building lasting habits.`,
      `Building momentum with ${completionRate}% completion! Your ${currentStreak} days of effort are valuable stepping stones.`,
      `Growing stronger at ${completionRate}%! These ${currentStreak} days are proof you can build positive routines.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else {
    const messages = [
      `Every step counts! Your ${currentStreak} days show you're committed to positive change.`,
      `Starting strong with ${currentStreak} days! Consistency is more important than perfection.`,
      `Building new habits takes time. Your ${currentStreak}-day effort shows you're on the right path.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export async function generateAssistantReply(args: {
  message: string;
  chatHistory: ChatMessage[];
  habits: Habit[];
  goals: Goal[];
  dailyEntries: DailyEntry[];
  user?: User;
  weeklyReview?: WeeklyReview | null;
  personalization?: string;
  preferredModel?: GeminiModelId;
}): Promise<string> {
  const { message, chatHistory, habits, goals, dailyEntries, user, weeklyReview, personalization, preferredModel } = args;
  const tagSummary: Record<string, number> = {
    STR: 0,
    AGI: 0,
    INT: 0,
    VIT: 0,
    PER: 0,
  };

  const habitLookup = new Map<number, Habit>();
  habits.forEach((habit) => habitLookup.set(habit.id, habit));

  dailyEntries.forEach((entry) => {
    const completions = entry.habitCompletions as Record<string, boolean>;
    Object.entries(completions || {}).forEach(([habitId, completed]) => {
      if (!completed) return;
      const habit = habitLookup.get(Number(habitId));
      if (!habit || !habit.tags?.length) return;
      habit.tags.forEach((tag) => {
        tagSummary[tag] = (tagSummary[tag] || 0) + 1;
      });
    });
  });

  const recentNotes = dailyEntries
    .filter((entry) => entry.notes && entry.notes.trim().length > 0)
    .slice(-5)
    .map((entry) => `${entry.date}: ${entry.notes}`)
    .join("\n");

  const habitList = habits
    .map((habit) => `${habit.emoji} ${habit.name} [${habit.tags?.length ? habit.tags.join(",") : "untagged"}]`)
    .join("\n");

  const goalList = goals
    .map((goal) => `${goal.tag} ${goal.period} target ${goal.targetCount}`)
    .join("\n");

  const reflectionBlock = weeklyReview
    ? `Weekly Reflection (${weeklyReview.weekStartDate}):
- Accomplishment: ${weeklyReview.accomplishment || "None"}
- Breakdown: ${weeklyReview.breakdown || "None"}
- Adjustment: ${weeklyReview.adjustment || "None"}
- AI Insights: ${weeklyReview.aiInsights ? JSON.stringify(weeklyReview.aiInsights) : "None"}`
    : "Weekly Reflection: None saved yet.";

  const history = chatHistory
    .slice(-10)
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  const stats = user?.stats ? JSON.stringify(user.stats) : "unknown";

  const personalizationBlock = formatPersonalizationContext(personalization);
  const prompt = `You are a focused habit coach in a gamified tracker.
Use the user's data to answer. Keep replies concise, practical, and supportive.
If the user asks for analysis, cite patterns from notes/completions.

${personalizationBlock}
USER STATS: ${stats}
HABITS (with tags): 
${habitList || "None"}
GOALS:
${goalList || "None"}
TAG COMPLETION SUMMARY (last 14 days): ${JSON.stringify(tagSummary)}
WEEKLY REVIEW & REFLECTIONS:
${reflectionBlock}
RECENT NOTES:
${recentNotes || "None"}

CHAT HISTORY:
${history || "None"}

USER MESSAGE: ${message}

Answer in plain text. Offer up to 3 bullet suggestions when appropriate.`;

  const response = await callGemini(prompt, "chat", { preferredModel });
  return response.trim();
}
