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
    initBreakSelector();
    renderHistory();
    initResultsModal();
    initUserProfile();
    initSearch();

    // Fetch daily AI wellness tip on load
    getWellnessTip().then(tip => {
        const tipEl = document.getElementById('hero-reminder-text');
        if (tipEl) tipEl.textContent = tip;
    });

    const checkinForm = document.getElementById('checkin-form');
    if (checkinForm) checkinForm.addEventListener('submit', handleCheckin);

    // History Popup Listeners
    const historyPopup = document.getElementById('history-popup');
    if (historyPopup) {
        historyPopup.querySelector('.history-popup-close')?.addEventListener('click', () => {
            historyPopup.classList.add('hidden');
        });
        historyPopup.querySelector('.history-popup-backdrop')?.addEventListener('click', () => {
            historyPopup.classList.add('hidden');
        });
    }
});

// --- RESULTS MODAL (legacy fallback) ---
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

// --- STUDY SESSIONS ---
function initStudySessions() {
    const addButton = document.getElementById("btn-add-session");
    if (!addButton) return;

    addButton.addEventListener("click", () => {
        const list = document.getElementById("session-list");
        const index = list.querySelectorAll(".session-row").length;

        const row = document.createElement("div");
        row.className = "session-row";
        row.setAttribute("data-index", index);
        row.innerHTML = `
            <input type="text" class="session-subject input-field" placeholder="Subject (e.g. Math)" />
            <div class="hours-unit-wrapper">
                <input type="number" class="session-hours input-field" placeholder="Time" min="0" step="0.5" />
                <div class="unit-toggle">
                    <button type="button" class="unit-btn active" data-unit="hours">hrs</button>
                    <button type="button" class="unit-btn" data-unit="minutes">min</button>
                </div>
            </div>
            <select class="session-break input-field">
                <option value="">Breaks?</option>
                <option value="yes">Yes</option>
                <option value="short">Short</option>
                <option value="no">No</option>
            </select>
            <button type="button" class="btn-icon btn-remove-session" aria-label="Remove session">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
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

        updateRemoveButtonsVisibility();
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

    updateRemoveButtonsVisibility();
}

function initBreakSelector() {
    const buttons = document.querySelectorAll('.break-btn');
    const input = document.getElementById('days-break');
    if (!buttons.length || !input) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            input.value = btn.dataset.value;
        });
    });

    input.addEventListener('input', () => {
        buttons.forEach(b => b.classList.remove('active'));
    });
}

function updateRemoveButtonsVisibility() {
    const rows = document.querySelectorAll(".session-row");
    rows.forEach(row => {
        const removeBtn = row.querySelector(".btn-remove-session");
        if (removeBtn) {
            removeBtn.style.display = rows.length > 1 ? "flex" : "none";
        }
    });
}

function removeSession(btn) {
    const row = btn.closest(".session-row");
    const list = document.getElementById("session-list");
    if (list.querySelectorAll(".session-row").length > 1) {
        row.remove();
        updateRemoveButtonsVisibility();
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

    const studyData = collectStudySessions();
    const sleepHours = parseFloat(document.getElementById('sleep-hours').value);
    const pendingTasks = parseInt(document.getElementById('pending-tasks').value);
    const daysSinceBreak = parseInt(document.getElementById('days-break').value);
    const emotionLabel = selectedEmotion;

    let studyHours = studyData.sessions.reduce((sum, s) => sum + s.hours, 0);
    studyHours = Math.round(studyHours * 10000) / 10000;

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

    const loadingSpinner = document.getElementById('loading-section');
    const submitBtn = document.querySelector('.btn-submit');
    const statusCard = document.getElementById('status-card');
    const resultsContainer = document.getElementById('results-container');

    if (statusCard) statusCard.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    try {
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

        const productivity = calculateProductivityScore({
            study: studyHours,
            tasks: pendingTasks,
            sessions: studyData.sessions,
            burnoutScore: score,
            sleep: sleepHours,
            stressValue: stressValue
        });

        const aiAdvice = await getGroqAdvice(emotionLabel, stressValue, score, {
            sleepHours, studyHours, pendingTasks, daysSinceBreak
        }, studyData);

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

        // Parse AI response
        const scheduleSplit = aiAdvice.split("SCHEDULE:");
        const adviceMessage = scheduleSplit[0].trim();
        const scheduleRaw = scheduleSplit[1] ? scheduleSplit[1].split("HABIT_FEEDBACK:")[0].trim() : null;
        const habitFeedback = aiAdvice.includes("HABIT_FEEDBACK:")
            ? aiAdvice.split("HABIT_FEEDBACK:")[1].trim()
            : null;

        // Render results (new inline layout)
        if (resultsContainer) {
            resultsContainer.classList.remove('hidden');

            let scheduleHTML = '';
            if (scheduleRaw) {
                const lines = scheduleRaw.split("\n").filter(l => l.trim());
                scheduleHTML = `
                    <div class="card schedule-card">
                        <p class="schedule-label">
                            <span class="label-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="8"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </span>
                            YOUR RECOVERY SCHEDULE
                        </p>
                        <ul class="schedule-list">
                            ${lines.map(l => `<li>${l.trim()}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            let habitHTML = '';
            if (habitFeedback) {
                const paragraphs = habitFeedback.split("\n").filter(l => l.trim()).map(l => `<p>${l}</p>`).join('');
                habitHTML = `
                    <div class="card habit-card">
                        <p class="habit-label">
                            <span class="label-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 19.5a2.5 2.5 0 0 1 2.5-2.5h11a2.5 2.5 0 0 1 2.5 2.5"></path>
                                    <path d="M4 6.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6.5v11"></path>
                                    <path d="M4 9.5h16"></path>
                                </svg>
                            </span>
                            STUDY HABIT ANALYSIS
                        </p>
                        <div class="habit-feedback-text">${paragraphs}</div>
                    </div>
                `;
            }

            resultsContainer.innerHTML = `
                <div class="productivity-section">
                    <h3>Academic Productivity</h3>
                    <div id="results-productivity-container" class="productivity-container-large"></div>
                </div>

                <div class="result-card result-${level.toLowerCase()} ${colorClass}">
                    <div class="score-number">${score}</div>
                    <div class="score-label">${level} BURNOUT RISK</div>
                    <div class="score-message">${message}</div>
                </div>

                <div class="advice-card">
                    <div class="advice-label">AI Advisor Insight</div>
                    <div class="advice-text">${adviceMessage}</div>
                </div>

                ${scheduleHTML}
                ${habitHTML}
            `;

            renderProductivityCircle(productivity, 'results-productivity-container', emotionLabel);
        } else {
            // Fallback to legacy modal rendering
            const aiAdviceTextEl = document.getElementById("ai-advice-text");
            const scheduleBoxEl = document.getElementById("schedule-box");
            const scheduleListEl = document.getElementById("schedule-list");
            const habitBoxEl = document.getElementById("habit-feedback-box");
            const habitTextEl = document.getElementById("habit-feedback-text");

            if (aiAdviceTextEl) aiAdviceTextEl.textContent = adviceMessage;

            if (scheduleRaw && scheduleBoxEl && scheduleListEl) {
                const lines = scheduleRaw.split("\n").filter(line => line.trim() !== "");
                scheduleListEl.innerHTML = "";
                lines.forEach(line => {
                    const li = document.createElement("li");
                    li.textContent = line.trim();
                    scheduleListEl.appendChild(li);
                });
                scheduleBoxEl.classList.remove("hidden");
            } else if (scheduleBoxEl) {
                scheduleBoxEl.classList.add("hidden");
            }

            if (habitFeedback && habitBoxEl && habitTextEl) {
                habitTextEl.innerHTML = habitFeedback.split("\n").filter(line => line.trim()).map(line => `<p>${line}</p>`).join("");
                habitBoxEl.classList.remove("hidden");
            } else if (habitBoxEl) {
                habitBoxEl.classList.add("hidden");
            }

            const scoreNumEl = document.getElementById('score-number');
            const scoreLabelEl = document.getElementById('score-label');
            const scoreMsgEl = document.getElementById('score-message');
            const scoreCardEl = document.getElementById('score-result-card');

            if (scoreNumEl) scoreNumEl.textContent = score;
            if (scoreLabelEl) scoreLabelEl.textContent = `${level} BURNOUT RISK`;
            if (scoreMsgEl) scoreMsgEl.textContent = message;
            if (scoreCardEl) scoreCardEl.className = `result-card result-${level.toLowerCase()} ${colorClass}`;

            renderProductivityCircle(productivity, 'results-productivity-container', emotionLabel);
            openResultsModal();
        }

        renderHistory();

    } catch (error) {
        console.error("Check-in failed:", error);
        alert("Something went wrong. Please try again.");
        if (statusCard) statusCard.classList.remove('hidden');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        loadingSpinner.classList.add('hidden');
    }
}

// --- HISTORY ---
async function renderHistory() {
    const historyList = document.getElementById('history-list');
    const historyCount = document.getElementById('history-count');
    const history = await getHistory();

    if (historyCount) historyCount.textContent = history.length;

    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>No check-ins yet</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = '';
    history.forEach(entry => {
        const { colorClass } = getScoreLevel(entry.score);

        const div = document.createElement('div');
        div.className = 'history-item';

        div.innerHTML = `
            <div class="history-header">
                <div class="history-date-group">
                    <div class="history-date">${entry.date}</div>
                    <div class="history-time">${entry.time || ''}</div>
                </div>
                <div class="history-meta">
                    <div class="history-emotion-tag tag-${entry.emotion.toLowerCase()}">${entry.emotion}</div>
                    <div class="history-score ${colorClass}">${entry.score} / 100</div>
                </div>
            </div>
        `;

        div.addEventListener('click', () => showHistoryPopup(entry));
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
        <div id="history-productivity-detail"></div>
        ${entry.aiAdvice ? `<div class="history-popup-detail"><strong>AI insight:</strong> ${entry.aiAdvice}</div>` : ''}
    `;

    renderProductivityCircle(entry.productivity || 0, 'history-productivity-container', entry.emotion);
    popup.classList.remove('hidden');
}

function formatDuration(hours) {
    if (hours === 0) return "0 hrs";
    if (hours < 1) return Math.round(hours * 60) + " mins";
    return (Math.round(hours * 10) / 10) + " hrs";
}

function getProductivityLabel(percent) {
    if (percent >= 60) return "Peak Performance";
    if (percent >= 30) return "Moderate Efficiency";
    return "Impaired Function";
}

function getProductivityMessage(percent, emotion) {
    // Emotion-specific logic
    if (emotion === "Stressed" && percent >= 30 && percent < 60) {
        return "Your stress level is elevating this fatigue — calming activities would help more than another study session.";
    }
    if (emotion === "Exhausted" && percent < 30) {
        return "Being exhausted means your body is forcing a shutdown. Listen to it.";
    }
    if (emotion === "Overwhelmed" && percent < 30) {
        return "Overwhelm is your brain's emergency brake. Step away from everything for a while.";
    }
    if (emotion === "Energetic" && percent >= 60) {
        return "Your energy matches your capacity — this is the sweet spot.";
    }

    // Default messages
    if (percent >= 60) {
        return "Your mind is sharp and ready. You can tackle complex problems, learn new concepts quickly, and maintain deep focus. Make the most of this peak state — it's the right time for challenging work.";
    }
    if (percent >= 30) {
        return "You can still get things done, but your mental stamina is wearing thin. It's like running with a small stone in your shoe — manageable now, but painful if you keep going. Take strategic breaks before fatigue wins.";
    }
    return "Your cognitive resources are critically low. Studying right now is like pouring water into a cracked cup — nothing sticks. Please stop and rest. Your brain needs recovery, not more input.";
}

function renderProductivityCircle(percent, containerId, emotion = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const isLarge = container.classList.contains('productivity-container-large');
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    // Determine color class based on productivity level
    let levelClass = 'low';
    if (percent >= 60) levelClass = 'high';
    else if (percent >= 30) levelClass = 'moderate';

    const label = getProductivityLabel(percent);
    const message = getProductivityMessage(percent, emotion);

    container.innerHTML = `
        <div class="productivity-circle-wrapper">
            <svg class="productivity-circle" viewBox="0 0 100 100">
                <circle class="bg" cx="50" cy="50" r="${radius}" />
                <circle class="meter" cx="50" cy="50" r="${radius}"
                    style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};" />
            </svg>
            <div class="percent ${levelClass}">${percent}%</div>
        </div>
    `;

    if (isLarge) {
        const section = container.parentElement;
        // Clean up any existing labels/messages to prevent duplicates
        section.querySelectorAll('.productivity-label, .productivity-message').forEach(el => el.remove());
        
        const labelEl = document.createElement('div');
        labelEl.className = `productivity-label ${levelClass}`;
        labelEl.textContent = label;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'productivity-message';
        messageEl.textContent = message;
        
        section.appendChild(labelEl);
        section.appendChild(messageEl);
    }

    // Handle history popup detail if needed
    if (containerId === 'history-productivity-container') {
        const detailEl = document.getElementById('history-productivity-detail');
        if (detailEl) {
            detailEl.innerHTML = `
                <div class="history-popup-productivity-detail">
                    <span class="productivity-mini-label ${levelClass}">${label}</span>
                    <p class="productivity-mini-message">${message}</p>
                </div>
            `;
        }
    }
}

function initUserProfile() {
    const nameEls = document.querySelectorAll('.profile-chip p, .topbar h1');
    const avatarEl = document.querySelector('.profile-avatar');
    const savedName = localStorage.getItem('nightr41d_user_name') || "John Doe";
    updateNameUI(savedName);

    const profileChip = document.querySelector('.profile-chip');
    if (profileChip) {
        profileChip.style.cursor = 'pointer';
        profileChip.addEventListener('click', () => {
            const newName = prompt("Enter your name:", localStorage.getItem('nightr41d_user_name') || "John Doe");
            if (newName && newName.trim()) {
                localStorage.setItem('nightr41d_user_name', newName.trim());
                updateNameUI(newName.trim());
            }
        });
    }

    function updateNameUI(name) {
        nameEls.forEach(el => {
            if (el.tagName === 'H1') {
                el.textContent = `Welcome back, ${name.split(' ')[0]}!`;
            } else {
                el.textContent = name;
            }
        });
        if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
    }
}

function initSearch() {
    const searchInput = document.querySelector('.search-wrapper input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                alert(`Search for "${searchInput.value}" is not available in the demo version.`);
                searchInput.value = '';
            }
        });
    }
}