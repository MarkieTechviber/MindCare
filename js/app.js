/**
 * NightR41d.exe — Main Controller
 * Connects UI events to logic, AI, and database modules.
 */

import { emotionToValue, calculateBurnoutScore, getScoreLevel, calculateProductivityScore } from './score.js';
import { getGroqAdvice, getWellnessTip } from './groq.js';
import { saveCheckin, getHistory } from './firebase.js';

let selectedEmotion = null;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initEmotionSelector();
    initStudySessions();
    renderHistory();
    initResultsModal();

    // Fetch daily AI wellness tip on load
    getWellnessTip().then(tip => {
        document.getElementById('hero-reminder-text').textContent = tip;
    });

    // Listen for form submission
    const checkinForm = document.getElementById('checkin-form');
    checkinForm.addEventListener('submit', handleCheckin);
});

// --- RESULTS MODAL ---
function initResultsModal() {
    const closeBtn = document.getElementById('results-modal-close');
    const backdrop = document.getElementById('results-modal-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', closeResultsModal);
    if (backdrop) backdrop.addEventListener('click', closeResultsModal);
}

function openResultsModal() {
    const modal = document.getElementById('results-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeResultsModal() {
    const modal = document.getElementById('results-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

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
                <div class="hours-unit-wrapper">
                    <input type="number" class="session-hours" placeholder="Value" min="0" step="0.5" />
                    <div class="unit-toggle">
                        <button type="button" class="unit-btn active" data-unit="hours">hrs</button>
                        <button type="button" class="unit-btn" data-unit="minutes">min</button>
                    </div>
                </div>
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

        row.querySelector(".btn-remove-session").addEventListener("click", function () {
            removeSession(this);
        });

        row.querySelectorAll(".unit-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                row.querySelectorAll(".unit-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
            });
        });
    });

    document.querySelectorAll(".btn-remove-session").forEach(btn => {
        btn.addEventListener("click", function () {
            removeSession(this);
        });
    });

    document.querySelectorAll(".session-row").forEach(row => {
        row.querySelectorAll(".unit-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                row.querySelectorAll(".unit-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
            });
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
        const rawValue = parseFloat(row.querySelector(".session-hours").value);
        const activeUnitBtn = row.querySelector(".unit-btn.active");
        const unit = activeUnitBtn ? activeUnitBtn.getAttribute("data-unit") : "hours";
        const hours = unit === "minutes" ? rawValue / 60 : rawValue;
        const breakTaken = row.querySelector(".session-break").value;

        if (subject && !isNaN(rawValue)) {
            sessions.push({ subject, hours, rawValue, unit, breakTaken: breakTaken || "unknown" });
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
    const studyData = collectStudySessions();
    const sleepHours = parseFloat(document.getElementById('sleep-hours').value);
    const pendingTasks = parseInt(document.getElementById('pending-tasks').value);
    const daysSinceBreak = parseInt(document.getElementById('days-break').value);
    const emotionLabel = selectedEmotion;

    // Calculate total study hours from sessions
    let studyHours = studyData.sessions.reduce((sum, s) => sum + s.hours, 0);
    // Round to 4 decimal places to avoid floating point artifacts
    studyHours = Math.round(studyHours * 10000) / 10000;


    // 2. Validate
    if (!emotionLabel) {
        alert("Please select how you are feeling!");
        return;
    }

    if (studyData.sessions.length === 0) {
        alert("Please log at least one study session!");
        return;
    }

    if (isNaN(sleepHours) || isNaN(pendingTasks) || isNaN(daysSinceBreak)) {
        alert("Please fill in all required fields with valid numbers!");
        return;
    }

    // 3. UI State: Loading
    const loadingSpinner = document.getElementById('loading-section');
    const submitBtn = document.querySelector('.btn-submit');

    loadingSpinner.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
        // 4. Calculate Score
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

        // 4.5 Calculate Productivity
        const productivity = calculateProductivityScore({
            study: studyHours,
            tasks: pendingTasks,
            sessions: studyData.sessions
        });


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
            productivity,
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
        scoreCard.className = `result-card result-${level.toLowerCase()} ${colorClass}`;

        // 9. UI State: Show modal
        loadingSpinner.classList.add('hidden');
        renderProductivityCircle(productivity, 'results-productivity-container');
        openResultsModal();


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
        const { colorClass } = getScoreLevel(entry.score);

        const div = document.createElement('div');
        div.className = 'history-item';

        div.innerHTML = `
            <div class="history-header">
                <div class="history-date">${entry.date}<span class="history-time">${entry.time || ''}</span></div>
                <div class="history-emotion-tag tag-${entry.emotion.toLowerCase()}">${entry.emotion}</div>
                <div class="history-score ${colorClass}">${entry.score} / 100</div>
            </div>
        `;

        div.addEventListener('click', () => {
            showHistoryPopup(entry);
        });

        historyList.appendChild(div);
    });

}

function showHistoryPopup(entry) {
    const popup = document.getElementById('history-popup');
    const popupBody = document.getElementById('history-popup-body');
    if (!popup || !popupBody) return;

    popupBody.innerHTML = `
        <div class="history-popup-row"><span>Date</span><strong>${entry.date}</strong></div>
        <div class="history-popup-row"><span>Time</span><strong>${entry.time || '—'}</strong></div>
        <div class="history-popup-row"><span>Emotion</span><strong>${entry.emotion}</strong></div>
        <div class="history-popup-row"><span>Score</span><strong>${entry.score} / 100</strong></div>
        <div class="history-popup-row"><span>Sleep</span><strong>${entry.sleep} hrs</strong></div>
        <div class="history-popup-row"><span>Study</span><strong>${formatDuration(entry.study)}</strong></div>
        <div class="history-popup-row"><span>Pending tasks</span><strong>${entry.tasks}</strong></div>
        <div class="history-popup-row"><span>Days since break</span><strong>${entry.lastBreak}</strong></div>
        <div class="history-popup-row"><span>Burnout level</span><strong>${getScoreLevel(entry.score).level}</strong></div>
        <div class="history-popup-productivity">
            <span>Academic Productivity</span>
            <div id="history-productivity-container" class="productivity-container-small"></div>
        </div>
        ${entry.aiAdvice ? `<div class="history-popup-detail"><strong>AI insight:</strong> ${entry.aiAdvice}</div>` : ''}
    `;

    renderProductivityCircle(entry.productivity || 0, 'history-productivity-container');
    popup.classList.remove('hidden');
}

/**
 * Formats duration in hours to a readable string
 */
function formatDuration(hours) {
    if (hours === 0) return "0 hrs";
    if (hours < 1) {
        return Math.round(hours * 60) + " mins";
    }
    return (Math.round(hours * 10) / 10) + " hrs";
}

/**
 * Renders the circular productivity UI
 */
function renderProductivityCircle(percent, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    container.innerHTML = `
        <div class="productivity-circle-wrapper">
            <svg class="productivity-circle" viewBox="0 0 100 100">
                <circle class="bg" cx="50" cy="50" r="${radius}" />
                <circle class="meter" cx="50" cy="50" r="${radius}" 
                    style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};" />
            </svg>
            <div class="percent">${percent}%</div>
        </div>
    `;
}


const historyPopup = document.getElementById('history-popup');
if (historyPopup) {
    historyPopup.querySelector('.history-popup-close')?.addEventListener('click', () => {
        historyPopup.classList.add('hidden');
    });
    historyPopup.querySelector('.history-popup-backdrop')?.addEventListener('click', () => {
        historyPopup.classList.add('hidden');
    });
}
