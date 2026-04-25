/**
 * NightR41d.exe — Groq AI Integration
 * Generates personalized burnout prevention advice.
 */

// Replace with your real Groq API Key
const GROQ_API_KEY = "your_groq_api_key_here";

/**
 * Builds a prompt for Groq AI based on user data.
 * @param {Object} formData 
 * @returns {string}
 */
export function buildPrompt(formData) {
    const { sleep, study, emotion, score, scoreLevel } = formData;
    
    return `You are a caring mentor for a student. 
    The student is feeling ${emotion}. 
    They got ${sleep} hours of sleep and studied for ${study} hours today. 
    Their burnout score is ${score}/100, which is ${scoreLevel}.
    
    Generate 3-5 sentences of personalized, caring, and actionable advice.
    Match your tone to their emotion:
    - Energetic: encouraging, positive.
    - Normal: balanced, gentle.
    - Stressed: calm, supportive reminders.
    - Exhausted: firm but caring rest advice.
    - Overwhelmed: urgent care, normalize asking for help, very warm tone.
    
    Respond in the second person ("you"), avoid bullet points, and keep it under 100 words. 
    Do NOT introduce yourself, go straight to the advice.`;
}

/**
 * Fetches advice from Groq AI.
 * @param {Object} formData 
 * @returns {Promise<string>}
 */
export async function getGroqAdvice(formData) {
    const prompt = buildPrompt(formData);
    
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
                max_tokens: 200,
                temperature: 0.8
            })
        });

        const result = await response.json();
        return result.choices[0].message.content;
    } catch (error) {
        console.error("Error fetching Groq advice:", error);
        return "You're doing your best. Remember to rest, drink water, and be kind to yourself today. 💙";
    }
}
