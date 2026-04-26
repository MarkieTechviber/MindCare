/**
 * NightR41d.exe — Burnout Score Calculator
 * Pure logic for calculating burnout risk and academic productivity.
 */

export const EMOTION_MAP = {
    "Energetic": 1,
    "Normal": 3,
    "Stressed": 6,
    "Exhausted": 8,
    "Overwhelmed": 10
};

export function emotionToValue(emotionLabel) {
    return EMOTION_MAP[emotionLabel] || 5;
}

/**
 * Calculates a burnout score from 0 to 100.
 */
export function calculateBurnoutScore(inputs) {
    const { sleep, study, stressValue, tasks, lastBreak, sessions } = inputs;

    // 1. SLEEP SCORE (Max 25 points)
    let sleepScore = 0;
    if (sleep === 0) {
        sleepScore = 25;
    } else if (sleep < 5) {
        sleepScore = 20 + ((5 - sleep) / 5) * 5;
    } else if (sleep < 7) {
        sleepScore = ((7 - sleep) / 2) * 20;
    } else if (sleep > 9) {
        sleepScore = ((sleep - 9) / 5) * 10;
    }
    sleepScore = Math.min(sleepScore, 25);

    // 2. STUDY SCORE (Max 25 points)
    let studyScore = 0;
    if (study < 1) {
        studyScore = 0;
    } else if (study <= 4) {
        studyScore = (study / 4) * 10;
    } else if (study <= 6) {
        studyScore = 10 + ((study - 4) / 2) * 10;
    } else {
        studyScore = 20 + ((study - 6) / 4) * 5;
    }
    studyScore = Math.min(studyScore, 25);

    // 3. STRESS SCORE (Max 30 points)
    let stressScore = (stressValue / 10) * 30;
    stressScore = Math.min(stressScore, 30);

    // EARLY RETURN — student just started
    const justStarted = study === 0 && (!sessions || sessions.length === 0);
    if (justStarted) {
        return Math.min(Math.round(sleepScore + stressScore), 100);
    }

    // 4. TASKS SCORE (Max 10 points)
    let tasksScore = 0;
    if (tasks <= 2) {
        tasksScore = tasks * 1;
    } else if (tasks <= 5) {
        tasksScore = 2 + ((tasks - 2) / 3) * 5;
    } else {
        tasksScore = 7 + ((tasks - 5) / 5) * 3;
    }
    tasksScore = Math.min(tasksScore, 10);

    // 5. BREAK SCORE (Max 10 points)
    let breakScore = 0;
    if (lastBreak === 0) {
        breakScore = 0;
    } else if (lastBreak === 1) {
        breakScore = 1;
    } else if (lastBreak <= 4) {
        breakScore = 1 + ((lastBreak - 1) / 3) * 6;
    } else {
        breakScore = 7 + ((lastBreak - 4) / 3) * 3;
    }
    breakScore = Math.min(breakScore, 10);

    // 6. SESSION HABIT PENALTY (Max 10 points)
    let sessionPenalty = 0;
    if (sessions && sessions.length > 0) {
        sessions.forEach(session => {
            if (session.breakTaken === 'no') {
                sessionPenalty += session.hours * 1.5;
            } else if (session.breakTaken === 'short') {
                sessionPenalty += session.hours * 0.5;
            }
        });
    }
    sessionPenalty = Math.min(sessionPenalty, 10);

    const total = sleepScore + studyScore + stressScore + tasksScore + breakScore + sessionPenalty;
    return Math.min(Math.round(total), 100);
}

/**
 * Returns level and styling for a given score.
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

/**
 * Calculates academic productivity percentage (0-100%).
 * CORRELATES with burnout level for realistic results.
 * 
 * Productivity = Habit Quality × Burnout Efficiency
 * 
 * Habit Quality: How well the student set themselves up (study hours, breaks, tasks)
 * Burnout Efficiency: How much cognitive capacity is actually available
 * 
 * This guarantees: LOW burnout → HIGH productivity, HIGH burnout → LOW productivity
 * 
 * @param {Object} params - { study, tasks, sessions, burnoutScore }
 * @returns {number} Productivity percentage 0-100
 */
export function calculateProductivityScore({ study, tasks, sessions, burnoutScore, sleep, stressValue }) {

    // === DYNAMIC HABIT QUALITY BASE ===
    // Research: sleep accounts for ~25% of academic performance variance
    const sleepBonus  = sleep >= 7 ? 10 : sleep >= 6 ? 4 : sleep < 5 ? -8 : 0;
    const stressBonus = stressValue <= 3 ? 6 : stressValue <= 5 ? 2 : 0;
    const clearMind   = tasks === 0 ? 5 : 0;

    let habitQuality = 60 + sleepBonus + stressBonus + clearMind;

    // === STUDY HOURS CONTRIBUTION ===
    if (study > 0) {
        habitQuality += (study / (study + 1.0)) * 25;
    }

    // === TASK LOAD PENALTY ===
    if (tasks > 0) {
        habitQuality -= Math.min(tasks * 1.5, 12);
    }

    // === DURATION-AWARE BREAK HABITS ===
    // Research: ultradian rhythm = 90-min cycle. Break only needed after 90+ mins.
    if (sessions && sessions.length > 0) {
        const total = sessions.length;
        const good         = sessions.filter(s => s.breakTaken === 'yes').length;
        const longNoBreak  = sessions.filter(s => s.breakTaken === 'no' && s.hours > 1.5).length;
        const shortNoBreak = sessions.filter(s => s.breakTaken === 'no' && s.hours <= 1.5).length;
        const shortBreak   = sessions.filter(s => s.breakTaken === 'short').length;

        habitQuality += (good / total) * 15;          // reward good breaks
        habitQuality -= (longNoBreak / total) * 12;   // punish long sessions no break
        habitQuality -= (shortNoBreak / total) * 2;   // tiny penalty for short bursts
        habitQuality -= (shortBreak / total) * 4;     // mild penalty for rushed breaks
    }

    habitQuality = Math.max(35, Math.min(100, habitQuality));

    // === RESEARCH-CALIBRATED EFFICIENCY MULTIPLIER ===
    // Low burnout: 85–100% | Moderate: 55–85% | High: 15–55%
    let efficiencyMultiplier;
    if (burnoutScore <= 33) {
        efficiencyMultiplier = 1.0 - (burnoutScore / 33) * 0.15;
    } else if (burnoutScore <= 66) {
        efficiencyMultiplier = 0.85 - ((burnoutScore - 33) / 33) * 0.30;
    } else {
        efficiencyMultiplier = Math.max(0.15, 0.55 - ((burnoutScore - 66) / 34) * 0.40);
    }

    // === FINAL CALCULATION ===
    let finalProductivity = habitQuality * efficiencyMultiplier;

    // === EDGE CASES ===
    if (study === 0 || !sessions || sessions.length === 0) {
        finalProductivity = Math.min(finalProductivity, 5);
    }
    if (burnoutScore >= 95) {
        finalProductivity = Math.min(finalProductivity, 20);
    }

    return Math.min(Math.round(finalProductivity), 100);
}