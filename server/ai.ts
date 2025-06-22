import type { Habit, DailyEntry, WeeklyReview } from "@shared/schema";
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
    "gemini-2.5-flash",
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

Output ONLY a valid JSON array with 3-5 habit suggestions. No explanations, no markdown, just the JSON:

[{"name": "habit name", "emoji": "emoji"}]`;

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
    {"name": "Morning hydration", "emoji": "💧"},
    {"name": "5-minute meditation", "emoji": "🧘"},
    {"name": "Gratitude journaling", "emoji": "📝"},
    {"name": "Evening stretches", "emoji": "🤸"},
    {"name": "Read for 15 minutes", "emoji": "📚"},
    {"name": "Take nature walk", "emoji": "🚶"},
    {"name": "Deep breathing exercise", "emoji": "🫁"},
    {"name": "Listen to podcast", "emoji": "🎧"},
    {"name": "Digital sunset routine", "emoji": "📱"},
    {"name": "Plan tomorrow", "emoji": "📅"}
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

  const prompt = `Analyze habit data: ${JSON.stringify(completionData)}

Output ONLY valid JSON with insights:

{"patterns": "brief pattern observation", "strengths": "what went well", "improvements": "actionable suggestions", "motivation": "encouraging message"}`;

  try {
    const response = await callGemini(prompt);
    // Try to extract and parse JSON
    const objectMatch = response.match(/\{[\s\S]*\}/);
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