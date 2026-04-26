/**
 * NightR41d.exe — Groq AI Integration
 * Generates personalized burnout prevention advice + recovery schedule + habit feedback.
 */

// Using Groq API for personalized advice (Remember to keep your API key secret!)
const GROQ_API_KEY = "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"; // PASTE_YOUR_KEY_HERE

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
    const hour = now.getHours();
    
    // 5-Zone Time Classifier
    const isLateNight  = hour >= 23 || hour < 5;   // 11PM–5AM → SLEEP NOW
    const isEarlyNight = hour >= 21 && hour < 23;  // 9PM–11PM → wind down
    const isEvening    = hour >= 18 && hour < 21;  // 6PM–9PM  → light work
    const isPeakStudy  = hour >= 11 && hour < 18;  // 11AM–6PM → optimal study
    const isMorning    = hour >= 5  && hour < 11;  // 5AM–11AM → gentle start

    // Dynamic Schedule Parameters
    let scheduleSlots, scheduleInterval;
    if (isLateNight)       { scheduleSlots = 3; scheduleInterval = 15; }
    else if (isEarlyNight) { scheduleSlots = 4; scheduleInterval = 20; }
    else if (isEvening)    { scheduleSlots = 5; scheduleInterval = 30; }
    else if (isPeakStudy)  { scheduleSlots = 6; scheduleInterval = 45; }
    else                   { scheduleSlots = 5; scheduleInterval = 30; } // morning

    // Calculate Schedule Start (More immediate for Late Night)
    const minutes = now.getMinutes();
    let startTime = new Date(now);
    if (isLateNight) {
        // Round to next 5 minutes for urgency
        const roundedMins = Math.ceil(minutes / 5) * 5;
        startTime.setMinutes(roundedMins, 0, 0);
    } else {
        // Round to next 30 for daytime structure
        const roundedMins = minutes < 30 ? 30 : 0;
        const roundedHours = minutes < 30 ? hour : hour + 1;
        startTime.setHours(roundedHours, roundedMins, 0, 0);
    }

    const formatTime = (date) => date.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: true
    });

    const currentTime = formatTime(now);
    const scheduleStart = formatTime(startTime);

    // Zone-Specific AI Instructions
    let scheduleModeInstruction;
    if (isLateNight) {
        scheduleModeInstruction = `
HARD OVERRIDE — LATE NIGHT (${currentTime}):
Research shows 5AM is the absolute cognitive nadir (rated 20/100 by students).
Screen use within 1 hour of bed raises insomnia risk by 59% (Frontiers 2025).
The student MUST be asleep within 30–45 minutes. No exceptions.
Give exactly 3 steps at 15-minute intervals:
- Step 1: Put down all screens, dim lights immediately.
- Step 2: Physical wind-down only (wash face, stretch, get into bed).
- Step 3: Eyes closed. Sleep. The schedule ends here.
DO NOT suggest journaling, tea, music, or any activity that extends wakefulness.
Tone: warm, firm, like a friend who genuinely cares. Not preachy.`;
    } else if (isEarlyNight) {
        scheduleModeInstruction = `
EARLY NIGHT MODE (${currentTime}):
Melatonin is rising. The student should stop all new learning now.
Research: screens must stop 60 minutes before target sleep time.
Give exactly 4 steps at 20-minute intervals.
Allow light review only (no new material). End with screen-off and bed prep.
Suggest a realistic sleep time based on their sleep data.`;
    } else if (isEvening) {
        scheduleModeInstruction = `
EVENING MODE (${currentTime}):
Still within productive hours but winding down.
Research: late afternoon/early evening is optimal for review and integration.
Give exactly 5 steps at 30-minute intervals.
Light study or review is fine. Remind them to stop screens by 10PM.
Use burnout score — high burnout = rest now, low = one more light session.`;
    } else if (isPeakStudy) {
        scheduleModeInstruction = `
PEAK STUDY MODE (${currentTime}):
Research: 11AM–6PM is the optimal cognitive window for college students.
Give exactly 6 steps at 45-minute intervals with built-in break slots.
Encourage deep, focused study aligned with their burnout score.
High burnout = recovery first then study. Low burnout = full focus blocks.`;
    } else {
        scheduleModeInstruction = `
MORNING MODE (${currentTime}):
Brain is refreshed but may have morning grogginess for the first hour.
Research: students perform best after 11AM, so early morning = light warm-up.
Give exactly 5 steps at 30-minute intervals.
Start with light review, build toward focused work as the morning progresses.`;
    }

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

    // Build dynamic slot template
    const slotLines = Array.from(
        { length: scheduleSlots },
        () => `[time]: [full sentence action]`
    ).join("\n");

    return `You are a warm and emotionally intelligent student wellness advisor who has personally experienced burnout. You understand that the time of day matters just as much as the numbers when giving advice to a tired student.
Student checked in at ${currentTime} feeling "${emotionLabel}". Burnout score: ${score}/100.
Their situation: Sleep last night was ${inputs.sleepHours} hours. Study time today was ${inputs.studyHours} hours. Pending tasks: ${inputs.pendingTasks}. Days since last full break: ${inputs.daysSinceBreak}.
${studyContext}
${scheduleRule}

PART 1 — Personal message (4 to 6 sentences): Validate their emotion using their actual numbers. Be honest about what their score means for their body and mind right now. Give them one real mindset shift they need to hear. Sound like a caring friend, not a robot. If it is late night, remind them that their brain is at its cognitive low point and sleep is the only productive choice left.

PART 2 — Recovery or productivity schedule starting at ${scheduleStart}, every ${scheduleInterval} minutes, exactly ${scheduleSlots} slots. Each action must be a full descriptive sentence. Every slot must be different, never repeat. No single-word actions.
${scheduleModeInstruction}

Format exactly as:
SCHEDULE:
${slotLines}
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