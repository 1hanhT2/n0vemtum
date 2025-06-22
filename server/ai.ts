import type { Habit, DailyEntry, WeeklyReview } from "@shared/schema";

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callOpenRouter(prompt: string): Promise<string> {
  const freeModels = [
    "microsoft/phi-3-mini-128k-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free", 
    "google/gemma-2-9b-it:free",
    "mistralai/mistral-7b-instruct:free"
  ];

  for (const model of freeModels) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data: OpenRouterResponse = await response.json();
        return data.choices[0]?.message?.content || "";
      }
    } catch (error) {
      continue; // Try next model
    }
  }
  
  throw new Error("All free models unavailable");
}

export async function generateHabitSuggestions(existingHabits: Habit[]): Promise<string[]> {
  const habitNames = existingHabits.map(h => h.name).join(", ");
  
  const prompt = `You are a productivity and wellness expert. Given these existing habits: ${habitNames}

Suggest 3-5 complementary habits that would enhance this routine. Focus on:
- Habits that fill gaps in the current routine
- Evidence-based practices for productivity and well-being
- Realistic daily habits that take 5-30 minutes

Return only a JSON array of habit objects with "name" and "emoji" fields, no other text.
Example: [{"name": "Morning meditation", "emoji": "🧘"}]`;

  // For now, use curated suggestions until free models are confirmed working
  return getDefaultHabitSuggestions(existingHabits);
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

  const prompt = `You are a habit and productivity coach. Analyze this week's data:

${JSON.stringify(completionData, null, 2)}

Provide insights in exactly this format:
{
  "patterns": "Brief observation about patterns in the data",
  "strengths": "What went well this week",
  "improvements": "Specific actionable suggestions for next week",
  "motivation": "Encouraging message based on progress"
}

Keep each field to 2-3 sentences maximum. Be specific and actionable.`;

  try {
    const response = await callOpenRouter(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating weekly insights:', error);
    return JSON.stringify({
      patterns: "Unable to analyze patterns at this time.",
      strengths: "Keep building your habits consistently.",
      improvements: "Focus on maintaining your current routine.",
      motivation: "Every small step counts towards your goals."
    });
  }
}

export async function generateMotivationalMessage(
  completionRate: number,
  currentStreak: number
): Promise<string> {
  const prompt = `You are a motivational habit coach. Create an encouraging message for someone with:
- Completion rate: ${completionRate}%
- Current streak: ${currentStreak} days

Write a brief, personalized motivational message (1-2 sentences) that:
- Acknowledges their current progress
- Provides specific encouragement
- Maintains a positive, supportive tone

Return only the message text, no quotes or formatting.`;

  try {
    const response = await callOpenRouter(prompt);
    return response.trim();
  } catch (error) {
    console.error('Error generating motivational message:', error);
    return "You're building great habits! Keep up the momentum.";
  }
}