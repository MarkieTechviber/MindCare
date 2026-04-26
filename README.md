# Student Burnout Prevention System
### Team: NightR41d.exe | BSIT Sophomore | ACLC ICT Week 2026

![Hackathon](https://img.shields.io/badge/Hackathon-ICT%20Week%202026-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Project Overview
**NightR41d.exe** is a web-based Student Burnout Prevention System designed to help students monitor their academic stress levels. By conducting daily emotional and workload check-ins, the app provides AI-generated personalized advice to help prevent burnout before it happens.

---

## ✨ Features
- 🎭 **Emotion-based Stress Selector** — Intuitive selection from 🟢 Energetic to 🔥 Overwhelmed, with color-coded active state per emotion.
- 📊 **Burnout Score Calculator** — Real-time calculation with color-coded results (Green / Yellow / Red).
- 📈 **Academic Productivity Score** — A separate 0–100% metric showing how effective the student's study day was, displayed as an animated circular progress indicator.
- 🤖 **AI Advice (Groq + LLaMA 3.3)** — Personalized insights split into three distinct sections: AI Advisor Insight, Recovery Schedule, and Study Habit Analysis.
- 🕐 **Time-Aware Recovery Schedule** — The AI schedule dynamically adapts to the current time of day using a 5-zone classifier (Late Night, Early Night, Evening, Peak Study, Morning).
- ☁️ **Cloud Sync** — Check-in history is saved to and retrieved from Firebase Firestore, scoped per device using a unique device ID.
- 📂 **History Popup** — Clicking any history entry opens a detail popup showing all saved metrics including productivity score and AI insight.
- 👤 **User Profile** — Users can set and update their display name, stored in `localStorage`, shown in the top bar and profile chip.
- 💡 **Wellness Tip of the Day** — A dynamic AI-generated daily reminder fetched from Groq on page load.
- 🌱 **"Just Started Today" Quick-Select** — A convenience button that sets "days since last break" to 0 so new students aren't penalized unfairly.
- ⏱️ **Hours/Minutes Unit Toggle** — Each study session entry supports toggling between hours and minutes for flexible time input.
- 📝 **Study Notes Field** — Free-text field for students to describe their session experience, passed directly into the AI prompt for richer context.
- 🗂️ **Multi-Session Logging** — Students can log multiple study subjects in one check-in, each with their own duration and break behavior.

---

## 🛠 Tech Stack
| Component | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| **Database** | Firebase Firestore (via CDN) |
| **AI Engine** | Groq AI (Model: `llama-3.3-70b-versatile`) |
| **Design** | DM Sans & Space Mono (Google Fonts) |

---

## 📂 File Structure
```
.firebase/
├── hosting..cache          # Firebase hosting cache (auto-generated)
css/
└── style.css               # Global styles and design system
js/
├── app.js                  # Main controller (UI, events, rendering)
├── firebase.js             # Firestore integration (save, get, clear, delete)
├── groq.js                 # Groq AI integration (advice + wellness tip)
└── score.js                # Burnout score + productivity score logic
public/
├── 404.html                # Firebase hosting 404 fallback page
└── index.html              # Firebase-hosted copy of main interface
scratch/
├── test_logic_standalone.js   # Standalone time-zone schedule logic test
├── test_prompt_logic.js       # Full prompt builder test with mock dates
└── test_score.js              # Productivity score unit tests
.env                        # Local environment variables (not committed)
.env.example                # Environment variable template
.firebaserc                 # Firebase project alias config
.gitignore                  # Git ignore rules
firebase-debug.log          # Firebase CLI debug log (auto-generated)
firebase.json               # Firebase hosting & Firestore config
firestore.indexes.json      # Firestore composite index definitions
firestore.rules             # Firestore security rules
index.html                  # Main application entry point (local dev)
README.md                   # Project documentation
```

---

## 🚀 Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone https://github.com/MarkieTechviber/MindCare.git
   ```
2. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`.
   - Fill in your API keys for Firebase and Groq.
3. **Firebase Setup**:
   - Create a project at [firebase.google.com](https://firebase.google.com).
   - Enable Firestore in **test mode**.
   - Copy your app config into `js/firebase.js`.
4. **Groq Setup**:
   - Sign up at [console.groq.com](https://console.groq.com).
   - Generate an API key and paste it into `js/groq.js`.
5. **Launch**:
   - Open `index.html` in any modern browser. No build step or server required!

---

## ⚙️ How It Works
The app follows a **Human-to-Machine Pipeline**:

1. **Profile** — Student sets their name (saved to `localStorage`, shown in topbar and profile chip).
2. **Study Logging** — Student logs one or more study sessions (subject, duration in hrs/min, break type) and optional notes.
3. **Check-In Inputs** — Student fills in sleep hours, selects an emotion, and provides pending tasks and days since last break.
4. **Score Calculation** — `score.js` maps the emotion to a numeric stress value, then calculates a total burnout score (0–100) and a separate academic productivity score (0–100%).
5. **AI Generation** — A time-aware prompt is built in `groq.js` and sent to Groq AI. The response is parsed into three sections: Insight, Schedule, and Habit Feedback.
6. **Output** — Results are rendered inline in the page (or in a fallback modal) with color-coded score card, circular productivity indicator, recovery schedule, and habit analysis.
7. **Storage** — The full check-in record (including productivity and AI advice) is saved to Firestore under the device's unique ID.
8. **History** — The last 7 check-ins are displayed in the history list; clicking any entry opens a detail popup.

---

## 🎭 Emotion-to-Value Mapping
| Emotion | Stress Value |
|---|---|
| Energetic | 1 |
| Normal | 3 |
| Stressed | 6 |
| Exhausted | 8 |
| Overwhelmed | 10 |

---

## 📊 Burnout Score Ranges
| Score | Level | Action |
|---|---|---|
| 0 – 33 | LOW | Keep going! 🌱 |
| 34 – 66 | MODERATE | Take a break soon! ☕ |
| 67 – 100 | HIGH | Rest immediately! 🛑 |

---

## 🧮 Scoring Methodology (`score.js`)

The total burnout score is the **sum of 6 independent factors**, each capped at their maximum. A special **"just started" early return** applies when a student has 0 study hours and no sessions logged — only Sleep + Stress are counted, preventing unfair penalties for fresh students.

> **Total = Sleep + Study + Stress + Tasks + Break + Session Habit** (max 100)

---

### 1. 😴 Sleep Score — *Max 25 pts*
Ideal sleep is **7–9 hours**. Anything outside that range adds risk.

| Sleep (hrs) | Score |
|---|---|
| 0 hrs (no sleep) | 25 pts (max) |
| < 5 hrs | 20–25 pts (severe) |
| 5–7 hrs | 0–20 pts (moderate penalty) |
| 7–9 hrs | 0 pts ✅ (ideal) |
| > 9 hrs | 0–10 pts (light, oversleeping) |

---

### 2. 📚 Study Score — *Max 25 pts*
Under 1 hr = no risk. The **sweet spot is 2–4 hrs**. Over 6 hrs is dangerous.

| Study Time | Score |
|---|---|
| < 1 hr | ~0 pts ✅ |
| 1–4 hrs | 0–10 pts (healthy range) |
| 4–6 hrs | 10–20 pts (getting risky) |
| 6–10 hrs | 20–25 pts (high risk zone) |

---

### 3. 😤 Stress Score — *Max 30 pts*
Directly mapped from the selected emotion. **Highest weight factor** of all six.

| Emotion | Stress Value | Score |
|---|---|---|
| Energetic | 1 | 3 pts |
| Normal | 3 | 9 pts |
| Stressed | 6 | 18 pts |
| Exhausted | 8 | 24 pts |
| Overwhelmed | 10 | 30 pts |

Formula: `(stressValue / 10) × 30`

---

### 4. 📋 Tasks Score — *Max 10 pts*
| Pending Tasks | Score |
|---|---|
| 0–2 tasks | 0–2 pts |
| 3–5 tasks | 2–7 pts (building pressure) |
| 5+ tasks | 7–10 pts (near max quickly) |

---

### 5. 🛌 Break Score — *Max 10 pts*
How long since the student last took a **full rest day**.

| Days Since Break | Score |
|---|---|
| 0 days | 0 pts ✅ |
| 1 day | 1 pt (very light) |
| 2–4 days | 1–7 pts (rising risk) |
| 5+ days | 7–10 pts (serious) |

> 💡 The **"Just Started Today 🌱"** quick-select button sets this to 0 automatically.

---

### 6. ⏱️ Session Habit Penalty — *Max 10 pts*
Penalizes sessions where the student studied without proper breaks.

| Break Taken | Penalty per Hour |
|---|---|
| Proper breaks ✅ | 0 pts |
| Short breaks only | 0.5 pts |
| No breaks at all | 1.5 pts |

Cap: `Math.min(totalPenalty, 10)`

---

### ⚡ "Just Started" Early Return
If `study === 0` and no sessions are logged, only **Sleep + Stress** are summed. Tasks, break, and session penalties are all skipped.

---

## 📈 Productivity Score (`calculateProductivityScore`)

A separate metric (0–100%) reflecting *how academically effective* the study session was — not the same as burnout risk. Displayed as an animated SVG circular ring with a label and contextual message.

### Calculation Model
`Productivity = Habit Quality × Burnout Efficiency Multiplier`

**Habit Quality Base (starts at 60):**
| Factor | Effect |
|---|---|
| Sleep ≥ 7 hrs | +10 pts |
| Sleep ≥ 6 hrs | +4 pts |
| Sleep < 5 hrs | −8 pts |
| Stress ≤ 3 | +6 pts |
| Stress ≤ 5 | +2 pts |
| No pending tasks | +5 pts |
| Study hours | Diminishing returns curve, up to +25 pts |
| Each pending task | −1.5 pts, capped at −12 pts |
| Sessions w/ proper breaks | +up to 15 pts |
| Long sessions w/ no breaks | −up to 12 pts |
| Short sessions w/ no breaks | −up to 2 pts |
| Short breaks only | −up to 4 pts |

Habit Quality is clamped between **35 and 100**.

**Burnout Efficiency Multiplier:**
| Burnout Score | Multiplier Range |
|---|---|
| 0–33 (LOW) | 85–100% |
| 34–66 (MODERATE) | 55–85% |
| 67–100 (HIGH) | 15–55% |

**Edge Cases:**
- If `study === 0` or no sessions logged → productivity capped at **5%**
- If `burnoutScore >= 95` → productivity capped at **20%**

**Productivity Labels:**
| Productivity % | Label | Meaning |
|---|---|---|
| ≥ 60% | Peak Performance | Sharp, ready for complex tasks |
| 30–59% | Moderate Efficiency | Manageable but wearing thin |
| < 30% | Impaired Function | Critically low, rest required |

> Emotion-specific messages are also applied (e.g., "Exhausted" + <30% triggers a dedicated shutdown message).

---

## 🤖 AI Advice System (`groq.js`)

### Time-Aware Scheduling (5-Zone Classifier)
The `buildPrompt()` function reads the current hour and assigns one of 5 zones:

| Zone | Hours | Schedule Slots | Interval |
|---|---|---|---|
| Late Night | 11 PM – 5 AM | 3 slots | 15 min |
| Early Night | 9 PM – 11 PM | 4 slots | 20 min |
| Evening | 6 PM – 9 PM | 5 slots | 30 min |
| Peak Study | 11 AM – 6 PM | 6 slots | 45 min |
| Morning | 5 AM – 11 AM | 5 slots | 30 min |

**Late Night Hard Override** — When checked in between 11 PM and 5 AM, the AI is instructed to issue only a 3-step wind-down plan directing the student to sleep. No journaling, tea, music, or other wakefulness-extending activities are permitted.

**Schedule Start Rounding:**
- Late Night → rounded to the next 5-minute mark (urgency).
- All other zones → rounded to the next :00 or :30 mark (structured).

### AI Response Parsing
The raw AI response is split into three sections by the `app.js` controller:
1. **AI Advisor Insight** — Text before the `SCHEDULE:` marker.
2. **Recovery Schedule** — Content between `SCHEDULE:` and `HABIT_FEEDBACK:`.
3. **Study Habit Analysis** — Content after `HABIT_FEEDBACK:` (only present when study sessions were logged).

### Wellness Tip (`getWellnessTip`)
A separate Groq call on page load returns a single short wellness message displayed in the hero banner. The prompt explicitly avoids inspirational-poster language and aims for casual, human-sounding text.

---

## ☁️ Firebase Integration (`firebase.js`)

### Device-Based User Isolation
Each browser session is assigned a unique device ID generated via `crypto.randomUUID()` (with a manual UUID fallback for older browsers) and stored in `localStorage` under `nightr41d_device_id`. All Firestore data is stored under:

```
users/{deviceId}/checkins/{docId}
```

This ensures complete isolation between devices without requiring user authentication.

### Available Functions
| Function | Description |
|---|---|
| `saveCheckin(data)` | Saves a new check-in document with a server timestamp |
| `getHistory()` | Retrieves the last 7 check-ins ordered by timestamp descending |
| `clearHistory()` | Batch-deletes all check-ins for the current device |
| `deleteCheckin(id)` | Deletes a single check-in document by ID |

### Saved Check-In Record Structure
```json
{
  "date": "4/27/2026",
  "time": "02:30 PM",
  "sleep": 6,
  "study": 2.5,
  "emotion": "Stressed",
  "stressValue": 6,
  "tasks": 3,
  "lastBreak": 2,
  "score": 55,
  "productivity": 42,
  "aiAdvice": "...",
  "timestamp": "<Firestore ServerTimestamp>"
}
```

---

## 🧪 Test Files

| File | Location | Purpose |
|---|---|---|
| `test_logic_standalone.js` | `scratch/` | Standalone test for time-zone classification and schedule start calculation across 5 time cases — no imports required |
| `test_prompt_logic.js` | `scratch/` | Tests the full `buildPrompt()` function by mocking `Date` for each time zone and verifying schedule slot count, interval, start time, and detected mode |
| `test_score.js` | `scratch/` | Unit tests for `calculateProductivityScore()` across 5 cases covering low burnout, moderate burnout, high burnout, ideal conditions, and edge cases |

---

## 📝 System Description

The system is a daily burnout check-in designed to help students monitor not only how much they study, but also how they feel and behave while studying — forming a complete input-to-output flow that turns simple logs into meaningful insights and actionable guidance.

At the top, the **Daily Wellness Reminder** displays an AI-generated message fetched fresh on each page load, encouraging users to stay calm and focused. Below it, the **"What Did You Study Today?"** section lets users log multiple study activities by entering the subject, specifying duration in hours or minutes using a unit toggle, and selecting their break behavior from detailed options: "Yes – took proper breaks," "Short breaks only," or "No breaks at all." This allows the system to evaluate not just study duration but actual study quality. A free-text **Additional Notes** field lets students describe their experience in their own words, which is passed directly into the AI prompt for richer, more contextual advice.

The second input section collects sleep hours, current emotional state, number of pending tasks, and days since the last full break. The **"Just Started Today 🌱"** quick-select button makes it easy for students at the start of their day to correctly set the break field to zero.

After submission, the system calculates a **Burnout Score** (0–100) and a separate **Academic Productivity Score** (0–100%), both displayed with color-coded visual indicators. The productivity score is shown as an animated circular SVG ring with a label ("Peak Performance," "Moderate Efficiency," or "Impaired Function") and an emotion-aware contextual message.

The **AI Advisor Insight** explains the score in a warm, personalized tone. The **Recovery Schedule** provides a time-structured, zone-aware plan for the rest of the day. When study sessions are logged, a **Study Habit Analysis** section provides direct, mentor-style feedback on break behavior and subject-specific patterns.

All results are rendered inline on the page (with a fallback modal for legacy layouts). Every check-in is saved to Firebase Firestore, scoped to the device, and the last 7 entries appear in the **Recent Check-Ins** list. Clicking any history entry opens a popup showing the full record including the saved productivity score and AI insight.

A **User Profile** feature lets students set their display name, which appears in the top bar as a personalized greeting. The **Search Bar** is present in the UI as a placeholder for a future feature.

Altogether, this system is designed not just to measure burnout, but to predict, explain, and actively help reduce it through personalized feedback and structured daily guidance.

---

## 👥 Team Members
- **Mark Joshua Baluran** — Lead Developer (JS Logic, Firebase, Groq AI, Score Calculator, App Controller)
- **Jimmie Em Ilaguno** — UI Developer (CSS Design, Emotion Selector, Productivity Circle, Spinner)
- **Kielah Manlapid Pepito** — Documentation Specialist (README, Scripting, Demo)
- **Jhon Daryl Sawayan** — Dev Tester (Error Detection, Unnecessary Feature Filtering, Brainstormer)

---

## 📜 Attribution
- **Firebase** by Google
- **Groq AI** for lightning-fast inference
- **LLaMA 3.3 (70B Versatile)** by Meta AI

---

## 📄 License
This project is licensed under the MIT License.
