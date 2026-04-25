/**
 * NightR41d.exe — Burnout Score Calculator
 * Pure logic for calculating burnout risk based on student inputs.
 */

/**
 * Map emotion labels to their numeric stress values
 */
export const EMOTION_MAP = {
    "Energetic": 1,
    "Normal": 3,
    "Stressed": 6,
    "Exhausted": 8,
    "Overwhelmed": 10
};

/**
 * Returns the numeric stress value for a given emotion label.
 * @param {string} emotionLabel 
 * @returns {number}
 */
export function emotionToValue(emotionLabel) {
    return EMOTION_MAP[emotionLabel] || 5;
}

/**
 * Calculates a burnout score from 0 to 100.
 * @param {Object} inputs - { sleep, study, stressValue, tasks, lastBreak }
 * @returns {number} - Rounded score between 0 and 100
 */
export function calculateBurnoutScore(inputs) {
    const { sleep, study, stressValue, tasks, lastBreak } = inputs;

    // 1. Sleep Score (Max 25 points)
    // Ideal: 7-9 hours. 
    let sleepScore = 0;
    if (sleep < 7) {
        sleepScore = ((7 - sleep) / 7) * 25;
    } else if (sleep > 9) {
        sleepScore = ((sleep - 9) / 5) * 25;
    }
    sleepScore = Math.min(sleepScore, 25);

    // 2. Study Score (Max 25 points)
    // Over 10 hours is high risk
    let studyScore = (study / 10) * 25;
    studyScore = Math.min(studyScore, 25);

    // 3. Stress Score (Max 30 points)
    // Stress value contributes the most
    let stressScore = (stressValue / 10) * 30;
    stressScore = Math.min(stressScore, 30);

    // 4. Tasks Score (Max 10 points)
    // 10 tasks = 10 points
    let tasksScore = (tasks / 10) * 10;
    tasksScore = Math.min(tasksScore, 10);

    // 5. Break Score (Max 10 points)
    // 7 days without break = 10 points
    let breakScore = (lastBreak / 7) * 10;
    breakScore = Math.min(breakScore, 10);

    const total = sleepScore + studyScore + stressScore + tasksScore + breakScore;
    return Math.min(Math.round(total), 100);
}

/**
 * Returns the level and styling information for a given score.
 * @param {number} score 
 * @returns {Object} - { level, message, colorClass }
 */
export function getScoreLevel(score) {
    if (score <= 33) {
        return {
            level: "LOW",
            message: "You are doing great! Keep it up! 🌱",
            colorClass: "score-low"
        };
    } else if (score <= 66) {
        return {
            level: "MODERATE",
            message: "Slow down and take a break soon! ☕",
            colorClass: "score-moderate"
        };
    } else {
        return {
            level: "HIGH",
            message: "Please stop and rest immediately! 🛑",
            colorClass: "score-high"
        };
    }
}
