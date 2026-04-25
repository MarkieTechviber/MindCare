/**
 * NightR41d.exe — Main Controller
 * Connects UI events to logic, AI, and database modules.
 */

import { emotionToValue, calculateBurnoutScore, getScoreLevel } from './score.js';
import { getGroqAdvice, getWellnessTip } from './groq.js';
import { saveCheckin, getHistory, deleteCheckin } from './firebase.js';

let selectedEmotion = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initEmotionSelector();
    initStudySessions();
    renderHistory();

    // Fetch daily AI wellness tip on load
    getWellnessTip().then(tip => {
        document.getElementById('wellness-tip-text').textContent = tip;
        document.getElementById('wellness-tip-box').classList.remove('hidden');
    });

    // Listen for form submission
    const checkinForm = document.getElementById('checkin-form');
    checkinForm.addEventListener('submit', handleCheckin);
});

function initStudySessions() {
    document.getElementById("btn-add-session").addEventListener("click", () => {
        const list = document.getElementById("session-list");
        const index = list.querySelectorAll(".session-row").length;
        
        const row = document.createElement("div");
        row.className = "session-row";
        row.setAttribute("data-index", index);
        row.innerHTML = `
            <div class="session-fields">
                <input type="text" class="session-subject" placeholder="Subject (e.g. Math)" />
                <input type="number" class="session-hours" placeholder="Hrs" min="0" max="24" step="0.5" />
                <select class="session-break">
                    <option value="">Breaks?</option>
                    <option value="yes">Yes</option>
                    <option value="short">Short</option>
                    <option value="no">No</option>
                </select>
                <button type="button" class="btn-remove-session">✕</button>
            </div>
        `;
        list.appendChild(row);
        
        row.querySelector(".btn-remove-session").addEventListener("click", function() {
            removeSession(this);
        });
    });

    document.querySelectorAll(".btn-remove-session").forEach(btn => {
        btn.addEventListener("click", function() {
            removeSession(this);
        });
    });
}

function removeSession(btn) {
    const row = btn.closest(".session-row");
    const list = document.getElementById("session-list");
    if (list.querySelectorAll(".session-row").length > 1) {
        row.remove();
    }
}

function collectStudySessions() {
    const rows = document.querySelectorAll(".session-row");
    const sessions = [];

    rows.forEach(row => {
        const subject = row.querySelector(".session-subject").value.trim();
        const hours = parseFloat(row.querySelector(".session-hours").value);
        const breakTaken = row.querySelector(".session-break").value;

        if (subject && !isNaN(hours)) {
            sessions.push({ subject, hours, breakTaken: breakTaken || "unknown" });
        }
    });

    const notes = document.getElementById("study-notes").value.trim();
    return { sessions, notes };
}

// --- EMOTION SELECTOR ---
function initEmotionSelector() {
    const emotionButtons = document.querySelectorAll(".emotion-btn");
    emotionButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            emotionButtons.forEach(b => {
                b.classList.remove("selected", "selected-energetic", "selected-normal", "selected-stressed", "selected-exhausted", "selected-overwhelmed");
            });
            const emotion = btn.getAttribute("data-emotion");
            btn.classList.add("selected", `selected-${emotion.toLowerCase()}`);
            selectedEmotion = emotion;
        });
    });
}

// --- FORM SUBMISSION ---
async function handleCheckin(e) {
    e.preventDefault();

    // 1. Gather Inputs
    const sleepHours = parseFloat(document.getElementById('sleep-hours').value);
    const studyHours = parseFloat(document.getElementById('study-hours').value);
    const pendingTasks = parseInt(document.getElementById('pending-tasks').value);
    const daysSinceBreak = parseInt(document.getElementById('days-break').value);
    const emotionLabel = selectedEmotion;

    // 2. Validate
    if (!emotionLabel) {
        alert("Please select how you are feeling!");
        return;
    }

    // 3. UI State: Loading
    const loadingSpinner = document.getElementById('loading-section');
    const resultSection = document.getElementById('results-section');
    const submitBtn = document.querySelector('.btn-submit');

    loadingSpinner.classList.remove('hidden');
    resultSection.classList.add('hidden');
    submitBtn.disabled = true;

    try {
        // 4. Calculate Score
        const studyData = collectStudySessions();
        const stressValue = emotionToValue(emotionLabel);
        const score = calculateBurnoutScore({
            sleep: sleepHours,
            study: studyHours,
            stressValue,
            tasks: pendingTasks,
            lastBreak: daysSinceBreak,
            sessions: studyData.sessions
        });
        const { level, message, colorClass } = getScoreLevel(score);

        // 5. Get AI Advice (separate args)
        const aiAdvice = await getGroqAdvice(emotionLabel, stressValue, score, {
            sleepHours, studyHours, pendingTasks, daysSinceBreak
        }, studyData);

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
        const habitBoxEl = document.getElementById("habit-feedback-box");
        const habitTextEl = document.getElementById("habit-feedback-text");

        // Split the response at "SCHEDULE:"
        const scheduleSplit = aiAdvice.split("SCHEDULE:");
        const adviceMessage = scheduleSplit[0].trim();
        const scheduleRaw = scheduleSplit[1] ? scheduleSplit[1].split("HABIT_FEEDBACK:")[0].trim() : null;
        const habitFeedback = aiAdvice.includes("HABIT_FEEDBACK:") 
            ? aiAdvice.split("HABIT_FEEDBACK:")[1].trim() 
            : null;

        aiAdviceTextEl.textContent = adviceMessage;

        // If schedule exists, render it
        if (scheduleRaw && scheduleBoxEl) {
            const lines = scheduleRaw.split("\n").filter(line => line.trim() !== "");
            scheduleListEl.innerHTML = "";
            lines.forEach(line => {
                const li = document.createElement("li");
                li.textContent = line.trim();
                scheduleListEl.appendChild(li);
            });
            scheduleBoxEl.classList.remove("hidden");
        } else {
            if (scheduleBoxEl) scheduleBoxEl.classList.add("hidden");
        }

        // If habit feedback exists, render it
        if (habitFeedback && habitBoxEl) {
            habitTextEl.innerHTML = habitFeedback
                .split("\n")
                .filter(line => line.trim())
                .map(line => `<p>${line}</p>`)
                .join("");
            habitBoxEl.classList.remove("hidden");
        } else {
            if (habitBoxEl) habitBoxEl.classList.add("hidden");
        }

        // 8. Update Score UI
        document.getElementById('score-number').textContent = score;
        document.getElementById('score-label').textContent = `${level} BURNOUT RISK`;
        document.getElementById('score-message').textContent = message;

        // Apply score color classes
        const scoreCard = document.getElementById('score-result-card');
        scoreCard.className = `card result-card result-${level.toLowerCase()} ${colorClass}`;

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
        div.className = 'history-item';
        
        // Extract a preview from the AI advice (first sentence)
        const advicePreview = entry.aiAdvice ? entry.aiAdvice.split('.')[0] + '.' : '';

        div.innerHTML = `
            <div>
                <div class="history-date">${entry.date} <span class="history-time">${entry.time || ''}</span></div>
                <div class="history-emotion-tag tag-${entry.emotion.toLowerCase()}">${entry.emotion}</div>
                <div class="history-score ${colorClass}">${entry.score} / 100</div>
                <button class="delete-history-btn" data-id="${entry.id}" title="Delete Check-in">✕</button>
            </div>
            ${advicePreview ? `<div class="history-advice-preview">"${advicePreview}"</div>` : ''}
        `;
        historyList.appendChild(div);
    });

    // Add event listeners for delete buttons
    const deleteBtns = historyList.querySelectorAll('.delete-history-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this check-in?')) {
                e.target.disabled = true;
                e.target.innerHTML = '<div class="spinner-small"></div>';
                const success = await deleteCheckin(id);
                if (success) {
                    renderHistory(); // Refresh the list
                } else {
                    alert('Failed to delete check-in. Please try again.');
                    e.target.disabled = false;
                    e.target.textContent = '✕';
                }
            }
        });
    });
}

