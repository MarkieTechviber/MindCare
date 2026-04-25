/**
 * NightR41d.exe — Main Controller
 * Connects UI events to logic, AI, and database modules.
 */

import { emotionToValue, calculateBurnoutScore, getScoreLevel } from './score.js';
import { getGroqAdvice } from './groq.js';
import { saveCheckin, getHistory, clearHistory } from './firebase.js';

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
    updateStreak();
    
    // Listen for form submission
    const checkinForm = document.getElementById('checkin-form');
    checkinForm.addEventListener('submit', handleCheckin);

    // Listen for clear history
    const clearBtn = document.getElementById('clear-history-btn');
    clearBtn.addEventListener('click', handleClearHistory);
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
    const sleep = parseFloat(document.getElementById('sleep-hrs').value);
    const study = parseFloat(document.getElementById('study-hrs').value);
    const tasks = parseInt(document.getElementById('pending-tasks').value);
    const lastBreak = parseInt(document.getElementById('last-break').value);
    const emotionLabel = document.getElementById('selected-emotion-label').value;
    const emotionValue = parseInt(document.getElementById('selected-emotion-value').value);

    // Validate
    if (!emotionLabel) {
        alert("Please select how you are feeling!");
        return;
    }

    // 2. UI State: Loading
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultSection = document.getElementById('result-section');
    const submitBtn = document.getElementById('submit-btn');

    loadingSpinner.classList.remove('hidden');
    resultSection.classList.add('hidden');
    submitBtn.disabled = true;

    try {
        // 3. Process Logic
        const stressValue = emotionValue || emotionToValue(emotionLabel);
        const score = calculateBurnoutScore({ sleep, study, stressValue, tasks, lastBreak });
        const { level, message, colorClass } = getScoreLevel(score);

        // 4. Get AI Advice
        const aiAdvice = await getGroqAdvice({
            sleep, study, emotion: emotionLabel, stressValue, tasks, lastBreak, score, scoreLevel: level
        });

        // 5. Save to Firebase
        const checkinData = {
            date: new Date().toLocaleDateString(),
            sleep, study, emotion: emotionLabel, stressValue, tasks, lastBreak, score, aiAdvice
        };
        await saveCheckin(checkinData);

        // 6. Update UI
        document.getElementById('score-value').textContent = score;
        document.getElementById('score-level').textContent = level;
        document.getElementById('score-message').textContent = message;
        document.getElementById('ai-advice-text').textContent = aiAdvice;

        // Apply score color classes
        const scoreCard = document.getElementById('score-card');
        scoreCard.className = 'card ' + colorClass;
        
        const levelBadge = document.getElementById('score-level');
        levelBadge.className = colorClass;

        // 7. UI State: Success
        loadingSpinner.classList.add('hidden');
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });

        // 8. Refresh components
        renderHistory();
        updateStreak();

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
            <div class="history-date">${entry.date}</div>
            <div class="history-emotion history-${entry.emotion.toLowerCase()}">${entry.emotion}</div>
            <div class="history-score ${colorClass}">${entry.score} / 100</div>
        `;
        historyList.appendChild(div);
    });
}

// --- STREAK ---
async function updateStreak() {
    const history = await getHistory();
    const streakCount = document.getElementById('streak-count');
    
    if (history.length === 0) {
        streakCount.textContent = '0';
        return;
    }

    let streak = 0;
    const today = new Date().toLocaleDateString();
    
    // Simplistic streak logic for hackathon (consecutive entries in history)
    // In a real app, you'd check day differences
    for (let i = 0; i < history.length; i++) {
        streak++;
    }
    
    streakCount.textContent = streak;
}

// --- CLEAR HISTORY ---
async function handleClearHistory() {
    if (confirm("Are you sure you want to clear all your history?")) {
        const success = await clearHistory();
        if (success) {
            renderHistory();
            updateStreak();
        }
    }
}
