import type { Habit, DailyEntry, WeeklyReview } from "@shared/schema";

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callOpenRouter(prompt: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "microsoft/phi-3-mini-128k-instruct:free",
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

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content || "";
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

  try {
    const response = await callOpenRouter(prompt);
    const suggestions = JSON.parse(response);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error('Error generating habit suggestions:', error);
    return [];
  }
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