/**
 * NightR41d.exe — Main Controller
 * Connects UI events to logic, AI, and database modules.
 */

import { emotionToValue, calculateBurnoutScore, getScoreLevel } from './score.js';
import { getGroqAdvice } from './groq.js';
import { saveCheckin, getHistory } from './firebase.js';

// --- WELLNESS TIPS ---
const WELLNESS_TIPS = [
    "Take a 5-minute screen break every hour to rest your eyes. 👀",
    "Stay hydrated! Your brain is 75% water. 💧",
    "A 15-minute power nap can reset your focus. 😴",
    "Try the 20-20-20 rule: Every 20 mins, look 20 feet away for 20 seconds. 🌿",
    "Write down three things you accomplished today, no matter how small. ✨",
    "Step outside for a few minutes of fresh air. It works wonders. 🚶‍♂️",
    "Stretch your neck and shoulders; they carry most of your study stress. 🧘‍♀️",
    "Deep breathing for 2 minutes can lower your cortisol levels. 🌬️",
    "Don't compare your progress to others. Your journey is unique. 💛",
    "It's okay to say no to extra tasks when you're feeling full. 🚫"
];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initWellnessTip();
    initEmotionSelector();
    renderHistory();

    // Listen for form submission
    const checkinForm = document.getElementById('checkin-form');
    checkinForm.addEventListener('submit', handleCheckin);
});

function initWellnessTip() {
    const tipContainer = document.querySelector('#wellness-tip p');
    const randomTip = WELLNESS_TIPS[Math.floor(Math.random() * WELLNESS_TIPS.length)];
    tipContainer.textContent = randomTip;
}

// --- EMOTION SELECTOR ---
function initEmotionSelector() {
    const buttons = document.querySelectorAll('.emotion-btn');
    const valueInput = document.getElementById('selected-emotion-value');
    const labelInput = document.getElementById('selected-emotion-label');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove selection from others
            buttons.forEach(b => b.classList.remove('selected'));
            // Select clicked
            btn.classList.add('selected');
            // Update hidden inputs
            valueInput.value = btn.dataset.value;
            labelInput.value = btn.dataset.label;
        });
    });
}

// --- FORM SUBMISSION ---
async function handleCheckin(e) {
    e.preventDefault();

    // 1. Gather Inputs
    const sleepHours = parseFloat(document.getElementById('sleep-hrs').value);
    const studyHours = parseFloat(document.getElementById('study-hrs').value);
    const pendingTasks = parseInt(document.getElementById('pending-tasks').value);
    const daysSinceBreak = parseInt(document.getElementById('last-break').value);
    const emotionLabel = document.getElementById('selected-emotion-label').value;
    const emotionValue = parseInt(document.getElementById('selected-emotion-value').value);

    // 2. Validate
    if (!emotionLabel) {
        alert("Please select how you are feeling!");
        return;
    }

    // 3. UI State: Loading
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultSection = document.getElementById('result-section');
    const submitBtn = document.getElementById('submit-btn');

    loadingSpinner.classList.remove('hidden');
    resultSection.classList.add('hidden');
    submitBtn.disabled = true;

    try {
        // 4. Calculate Score
        const stressValue = emotionValue || emotionToValue(emotionLabel);
        const score = calculateBurnoutScore({
            sleep: sleepHours,
            study: studyHours,
            stressValue,
            tasks: pendingTasks,
            lastBreak: daysSinceBreak
        });
        const { level, message, colorClass } = getScoreLevel(score);

        // 5. Get AI Advice (separate args)
        const aiAdvice = await getGroqAdvice(emotionLabel, stressValue, score, {
            sleepHours, studyHours, pendingTasks, daysSinceBreak
        });

        // 6. Save to Firebase
        const currentTime = new Date().toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit", hour12: true
        });
        const checkinData = {
            date: new Date().toLocaleDateString(),
            time: currentTime,
            sleep: sleepHours,
            study: studyHours,
            emotion: emotionLabel,
            stressValue,
            tasks: pendingTasks,
            lastBreak: daysSinceBreak,
            score,
            aiAdvice
        };
        await saveCheckin(checkinData);

        // 7. Parse AI response — split into advice message and schedule
        const aiAdviceTextEl = document.getElementById("ai-advice-text");
        const scheduleBoxEl = document.getElementById("schedule-box");
        const scheduleListEl = document.getElementById("schedule-list");

        // Split the response at "SCHEDULE:"
        const scheduleSplit = aiAdvice.split("SCHEDULE:");
        const adviceMessage = scheduleSplit[0].trim();
        const scheduleRaw = scheduleSplit[1] ? scheduleSplit[1].trim() : null;

        aiAdviceTextEl.textContent = adviceMessage;

        // If schedule exists, render it
        if (scheduleRaw && scheduleBoxEl) {
            const lines = scheduleRaw.split("\n").filter(line => line.trim() !== "");
            scheduleListEl.innerHTML = "";
            lines.forEach(line => {
                const parts = line.split(":").map(s => s.trim());
                // parts[0] = hour, parts[1] = minutes + rest of text (because time has colon too)
                // Better split: split at first " - " or just use the whole line
                const li = document.createElement("li");
                li.textContent = line.trim();
                scheduleListEl.appendChild(li);
            });
            scheduleBoxEl.classList.remove("hidden");
        }

        // 8. Update Score UI
        document.getElementById('score-value').textContent = score;
        document.getElementById('score-level').textContent = level;
        document.getElementById('score-message').textContent = message;

        // Apply score color classes
        const scoreCard = document.getElementById('score-card');
        scoreCard.className = 'card ' + colorClass;

        const levelBadge = document.getElementById('score-level');
        levelBadge.className = colorClass;

        // 9. UI State: Success
        loadingSpinner.classList.add('hidden');
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });

        // 10. Refresh history
        renderHistory();

    } catch (error) {
        console.error("Check-in failed:", error);
        alert("Something went wrong. Please try again.");
    } finally {
        submitBtn.disabled = false;
        loadingSpinner.classList.add('hidden');
    }
}

// --- HISTORY ---
async function renderHistory() {
    const historyList = document.getElementById('history-list');
    const history = await getHistory();

    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No check-ins yet. Start your first one above! 👆</div>';
        return;
    }

    historyList.innerHTML = '';
    history.forEach(entry => {
        const { level, colorClass } = getScoreLevel(entry.score);

        const div = document.createElement('div');
        div.className = 'history-entry';
        div.innerHTML = `
            <div class="history-date">${entry.date} <span class="history-time">${entry.time || ''}</span></div>
            <div class="history-emotion history-${entry.emotion.toLowerCase()}">${entry.emotion}</div>
            <div class="history-score ${colorClass}">${entry.score} / 100</div>
        `;
        historyList.appendChild(div);
    });
}

