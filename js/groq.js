/**
 * NightR41d.exe — Groq AI Integration
 * Generates personalized burnout prevention advice + recovery schedule.
 */

// Using Groq API for personalized advice
const GROQ_API_KEY = "YOUR_API_KEY_HERE";

/**
 * Builds a prompt for Groq AI based on student data.
 * @param {string} emotionLabel - The selected emotion (e.g. "Stressed")
 * @param {number} stressValue - Numeric stress value (1-10)
 * @param {number} score - Burnout score (0-100)
 * @param {Object} inputs - { sleepHours, studyHours, pendingTasks, daysSinceBreak }
 * @returns {string} - The complete prompt string
 */
export function buildPrompt(emotionLabel, stressValue, score, inputs) {
    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return `You are a burnout prevention advisor for students.
A student just completed their burnout check-in at ${currentTime}.
They are feeling "${emotionLabel}" (stress level ${stressValue}/10) with a burnout score of ${score}/100.

Their habits:
- Sleep: ${inputs.sleepHours} hours
- Study: ${inputs.studyHours} hours  
- Pending tasks: ${inputs.pendingTasks}
- Days since last break: ${inputs.daysSinceBreak}

Based on their burnout score and the current time (${currentTime}), generate TWO things:

1. A short 2-sentence caring message to the student (address them as "you", match tone to emotion).

2. A time-based recovery schedule starting from NOW. Format it EXACTLY like this with no extra text:
SCHEDULE:
[time]: [short action]
[time]: [short action]
[time]: [short action]
[time]: [short action]
[time]: [short action]

Rules for the schedule:
- Start the first slot 15-30 minutes from ${currentTime}
- If score is HIGH (67-100): prioritize complete rest, no studying, sleep early
- If score is MODERATE (34-66): mix rest and light study breaks
- If score is LOW (0-33): light schedule, encourage steady progress
- Each action should be short and human (e.g. "step away from the screen", "take a short walk", "drink water and breathe")
- End the schedule with sleep or wind-down if it's nighttime
- Keep the whole response under 150 words`;
}

/**
 * Fetches advice from Groq AI.
 * @param {string} emotionLabel
 * @param {number} stressValue
 * @param {number} score
 * @param {Object} inputs
 * @returns {Promise<string>} - Raw AI response text
 */
export async function getGroqAdvice(emotionLabel, stressValue, score, inputs) {
    const prompt = buildPrompt(emotionLabel, stressValue, score, inputs);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error) {
        console.error("Error fetching Groq advice:", error);
        return "You're doing your best. Remember to rest and be kind to yourself. 💙\n\nSCHEDULE:\nNow: Take a deep breath\nIn 30 mins: Drink water and stretch\nTonight: Sleep early";
    }
}

