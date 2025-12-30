import type { Habit, DailyEntry, WeeklyReview, Goal, ChatMessage, User } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";
import { aiCache } from "./cache";

// Gemini configuration
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

function extractInsight(text: string, key: string): string | null {
  const regex = new RegExp(`"${key}":\\s*"([^"]*)"`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

async function callGemini(prompt: string): Promise<string> {
  const models = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash-lite-preview-06-17", 
    "gemini-2.0-flash"
  ];

  for (const model of models) {
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

export async function generateHabitSuggestions(existingHabits: Habit[]): Promise<string[]> {
  // Create cache key based on habit names
  const habitNames = existingHabits.map(h => h.name).sort().join(", ");
  const cacheKey = `habit-suggestions:${habitNames}`;
  
  // Check cache first
  const cached = aiCache.get<string[]>(cacheKey);
  if (cached) {
    console.log('Returning cached habit suggestions');
    return cached;
  }
  
  const prompt = `Given existing habits: ${habitNames}

Generate 3-5 short, specific habit suggestions that complement the existing habits. Keep them simple and actionable.

Output ONLY a valid JSON array. No explanations, no markdown, just the JSON:

[{"name": "short specific habit", "emoji": "emoji"}]

Examples of good suggestions:
- "10-min morning walk"
- "Drink water at 8 AM"
- "5-min evening stretch"
- "Read 1 page daily"`;

  try {
    const response = await callGemini(prompt);
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
    const result = Array.isArray(suggestions) ? suggestions : getDefaultHabitSuggestions(existingHabits);
    
    // Cache the result for 30 minutes
    aiCache.set(cacheKey, result, 30);
    return result;
  } catch (error) {
    console.error('Error generating habit suggestions:', error);
    // Fallback to curated suggestions if API fails
    return getDefaultHabitSuggestions(existingHabits);
  }
}

function getDefaultHabitSuggestions(existingHabits: Habit[]): any[] {
  const allSuggestions = [
    {"name": "Drink water at wake-up", "emoji": "💧"},
    {"name": "10-min morning meditation", "emoji": "🧘"},
    {"name": "Write 3 gratitude notes", "emoji": "📝"},
    {"name": "5-min bedtime stretches", "emoji": "🤸"},
    {"name": "Read 1 page daily", "emoji": "📚"},
    {"name": "15-min lunch walk", "emoji": "🚶"},
    {"name": "3-min deep breathing", "emoji": "🫁"},
    {"name": "Listen to podcast", "emoji": "🎧"},
    {"name": "Digital sunset at 9 PM", "emoji": "📱"},
    {"name": "Plan tomorrow at night", "emoji": "📅"}
  ];
  
  const existingNames = existingHabits.map(h => h.name.toLowerCase());
  return allSuggestions.filter(suggestion => 
    !existingNames.some(name => 
      name.includes(suggestion.name.toLowerCase().split(' ')[0])
    )
  ).slice(0, 5);
}

export async function generateWeeklyInsights(
  dailyEntries: DailyEntry[], 
  habits: Habit[]
): Promise<string> {
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

  const prompt = `Analyze habit tracking data and daily reflections:

COMPLETION DATA: ${JSON.stringify(completionData)}

DAILY NOTES & REFLECTIONS:
${notesData || 'No daily notes recorded this period.'}

HABITS BEING TRACKED: ${habits.map(h => `${h.emoji} ${h.name}`).join(', ')}

Provide insights that incorporate both quantitative data and qualitative notes. Reference specific insights from the user's own reflections when available.

Output ONLY valid JSON with insights:

{"patterns": "pattern observation incorporating notes context", "strengths": "what went well based on data and notes", "improvements": "actionable suggestions informed by reflections", "motivation": "encouraging message that acknowledges their thoughts"}`;

  try {
    const response = await callGemini(prompt);
    // Clean up the response by removing markdown code blocks
    const cleanedResponse = response.replace(/```json\s*|\s*```/g, '').trim();
    
    // Try to extract and parse JSON
    const objectMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (parseError) {
        // If JSON parsing fails, create structured response from text
        const insights = {
          patterns: extractInsight(response, 'patterns') || 'Consistent habit completion observed',
          strengths: extractInsight(response, 'strengths') || 'Good dedication to daily routines',
          improvements: extractInsight(response, 'improvements') || 'Continue building momentum',
          motivation: extractInsight(response, 'motivation') || 'Keep up the great work!'
        };
        return insights;
      }
    }
    throw new Error('No insights found');
  } catch (error) {
    console.error('Error generating weekly insights:', error);
    // Fallback to static insights if API fails
    const completionRate = dailyEntries.length > 0 
      ? (dailyEntries.reduce((sum, entry) => 
          sum + Object.values(entry.habitCompletions as Record<string, boolean>).filter(Boolean).length, 0
        ) / (dailyEntries.length * habits.length)) * 100 
      : 0;

    return JSON.stringify({
      patterns: completionRate > 80 
        ? "Strong consistency pattern observed in your habit tracking."
        : "Room for improvement in maintaining daily consistency.",
      strengths: completionRate > 60 
        ? "You're building positive momentum with regular habit completion."
        : "You're taking important steps toward building better habits.",
      improvements: "Focus on completing your habits at the same time each day to build stronger routines.",
      motivation: completionRate > 70 
        ? "Your dedication is paying off - keep up the excellent work!"
        : "Every day is a new opportunity to strengthen your habits."
    });
  }
}

export async function analyzeHabitDifficulty(habit: any, userCompletionData?: any[]): Promise<{
  difficulty: number;
  analysis: string;
}> {
  const cacheKey = `difficulty_${habit.id}_${habit.name}`;
  const cached = aiCache.get<{ difficulty: number; analysis: string }>(cacheKey);
  
  if (cached) {
    console.log('Returning cached difficulty analysis');
    return cached;
  }

  try {
    const completionContext = userCompletionData && userCompletionData.length > 0 
      ? `User completion data shows ${userCompletionData.filter(d => d.completed).length}/${userCompletionData.length} successful completions.`
      : 'No completion history available yet.';

    const prompt = `Analyze the difficulty of this habit and provide a rating:

Habit: "${habit.emoji} ${habit.name}"
${completionContext}

Consider factors like:
- Time commitment required
- Physical or mental effort needed
- Frequency and consistency demands
- Environmental dependencies
- Skill requirements
- Motivation sustainability

Respond with JSON format:
{
  "difficulty": [1-5 integer where 1=very easy, 5=very difficult],
  "analysis": "[Brief 2-3 sentence explanation of the difficulty rating and key factors]"
}`;

    const response = await callGemini(prompt);
    
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
}): Promise<string> {
  const { message, chatHistory, habits, goals, dailyEntries, user } = args;
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

  const history = chatHistory
    .slice(-10)
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  const stats = user?.stats ? JSON.stringify(user.stats) : "unknown";

  const prompt = `You are a focused habit coach in a gamified tracker.
Use the user's data to answer. Keep replies concise, practical, and supportive.
If the user asks for analysis, cite patterns from notes/completions.

USER STATS: ${stats}
HABITS (with tags): 
${habitList || "None"}
GOALS:
${goalList || "None"}
TAG COMPLETION SUMMARY (last 14 days): ${JSON.stringify(tagSummary)}
RECENT NOTES:
${recentNotes || "None"}

CHAT HISTORY:
${history || "None"}

USER MESSAGE: ${message}

Answer in plain text. Offer up to 3 bullet suggestions when appropriate.`;

  const response = await callGemini(prompt);
  return response.trim();
}
