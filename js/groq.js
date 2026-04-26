/**
 * NightR41d.exe — Groq AI Integration
 * Generates personalized burnout prevention advice + recovery schedule + habit feedback.
 */

// Using Groq API for personalized advice (Remember to keep your API key secret!)
const GROQ_API_KEY = "i have my api on it but git is strict"; // PASTE_YOUR_KEY_HERE

/**
 * Builds a prompt for Groq AI based on student data.
 * @param {string} emotionLabel - The selected emotion (e.g. "Stressed")
 * @param {number} stressValue - Numeric stress value (1-10)
 * @param {number} score - Burnout score (0-100)
 * @param {Object} inputs - { sleepHours, studyHours, pendingTasks, daysSinceBreak }
 * @param {Object} studyData - { sessions: [], notes: "" }
 * @returns {string} - The complete prompt string
 */
export function buildPrompt(emotionLabel, stressValue, score, inputs, studyData = null) {
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = minutes < 30 ? 30 : 0;
    const roundedHours = minutes < 30 ? now.getHours() : now.getHours() + 1;
    const startTime = new Date(now);
    startTime.setHours(roundedHours, roundedMinutes, 0, 0);

    const formatTime = (date) => date.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: true
    });

    const currentTime = formatTime(now);
    const scheduleStart = formatTime(startTime);

    const scheduleRule = score >= 67
        ? `HIGH burnout (${score}/100). First 2 hours must be full rest — no studying. Be firm but warm.`
        : score >= 34
            ? `MODERATE burnout (${score}/100). One solid rest block then ease back into light study.`
            : `LOW burnout (${score}/100). Short breaks between focused sessions to maintain energy.`;

    // Build study session summary if provided
    let studyContext = "";
    let habitSection = "";

    if (studyData && studyData.sessions && studyData.sessions.length > 0) {
        const sessionLines = studyData.sessions.map(s =>
            `- ${s.subject}: ${s.rawValue} ${s.unit} (${s.hours.toFixed(2)} hrs), breaks: ${s.breakTaken}`
        ).join("\n");

        studyContext = `
What they actually studied today:
${sessionLines}
${studyData.notes ? `Student notes: "${studyData.notes}"` : ""}
`;

        habitSection = `
PART 3 — STUDY HABIT ANALYSIS:
Based on their study sessions above, give honest and specific feedback on their study habits (4-5 sentences).
- Were their study methods healthy or harmful?
- Did their break behavior contribute to their burnout score?
- What specific habit should they change starting tomorrow?
- Be direct but encouraging — like a mentor, not a judge
- Reference their actual subjects and hours, not generic advice

Format exactly as:
HABIT_FEEDBACK:
[your habit analysis here as plain sentences, no bullet points]
`;
    }

    return `You are a warm and emotionally intelligent student wellness advisor who has personally experienced burnout. You understand that the time of day matters just as much as the numbers when giving advice to a tired student.
Student checked in at ${currentTime} feeling "${emotionLabel}". Burnout score: ${score}/100.
Their situation: Sleep last night was ${inputs.sleepHours} hours. Study time today was ${inputs.studyHours} hours. Pending tasks: ${inputs.pendingTasks}. Days since last full break: ${inputs.daysSinceBreak}.
${studyContext}
${scheduleRule}
TIME-AWARE BEHAVIOR RULES: You must detect what period of day it is based on the check-in time and adjust your entire tone, advice, and schedule accordingly. If the check-in time is between 9:00 PM and 5:00 AM, this is considered NIGHT MODE. In night mode, do not encourage the student to study more or be productive. Instead, gently wind them down. Acknowledge that their brain needs rest, not more input. Your schedule must include sleep preparation steps, relaxation, and a firm but caring push toward sleeping at a reasonable time. Avoid scheduling any study or task review after 11:00 PM. If the check-in time is between 5:00 AM and 12:00 PM, this is MORNING MODE. In morning mode, be energizing but grounded. Help them plan a focused and healthy day ahead based on their data. Encourage momentum but remind them about breaks. If the check-in time is between 12:00 PM and 9:00 PM, this is DAYTIME MODE. In daytime mode, balance productivity with recovery. Use their burnout score to decide how much to push or pull back. High burnout means rest first, low burnout means structured study with breaks.

PART 1 — Personal message (4 to 6 sentences): Validate their emotion using their actual numbers. Be honest about what their score means for their body and mind right now. Give them one real mindset shift they need to hear. Sound like a caring friend, not a robot. If it is night time, acknowledge that staying up late is already part of the problem and say it with warmth not judgment.

PART 2 — Recovery or productivity schedule starting at ${scheduleStart}, every 30 minutes, exactly 6 slots. Each action must be a full descriptive sentence. Every slot must be different, never repeat. No single-word actions. If it is night time, the schedule must guide them toward sleep, not keep them awake. If it is morning or daytime, the schedule should reflect a healthy and realistic plan based on their score and data.

Format exactly as:
SCHEDULE:
[time]: [full sentence action]
[time]: [full sentence action]
[time]: [full sentence action]
[time]: [full sentence action]
[time]: [full sentence action]
[time]: [full sentence action]
${habitSection}
Total response under 400 words.`;
}

/**
 * Fetches advice from Groq AI.
 * @param {string} emotionLabel
 * @param {number} stressValue
 * @param {number} score
 * @param {Object} inputs
 * @param {Object} studyData
 * @returns {Promise<string>} - Raw AI response text
 */
export async function getGroqAdvice(emotionLabel, stressValue, score, inputs, studyData = null) {
    const prompt = buildPrompt(emotionLabel, stressValue, score, inputs, studyData);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1000,
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

/**
 * Fetches a random wellness or academic tip from Groq AI.
 * @returns {Promise<string>} - The dynamic wellness tip.
 */
export async function getWellnessTip() {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{
                    role: "user",
                    content: `You're a chill, relatable friend texting a student in the morning. Write ONE short wellness reminder that sounds like a real person — casual, warm, and a little conversational. Avoid inspirational-poster language, avoid words like "triumph", "testament", "resilience", "navigate", or "unfolds". Keep it simple and honest, like something you'd actually say to a friend who's stressed about school. 1-2 sentences max. No quotation marks, no labels, no intro — just say it directly.`
                }],
                max_tokens: 80,
                temperature: 0.9
            })
        });
        const result = await response.json();
        return result.choices[0].message.content.trim();
    } catch (error) {
        return "Your consistency matters more than your speed. Keep going, one step at a time. 💛";
    }
}