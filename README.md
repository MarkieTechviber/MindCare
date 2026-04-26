# Student Burnout Prevention System
### Team: NightR41d.exe | BSIT Sophomore | ACLC ICT Week 2026

![Hackathon](https://img.shields.io/badge/Hackathon-ICT%20Week%202026-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Project Overview
**NightR41d.exe** is a web-based Student Burnout Prevention System designed to help students monitor their academic stress levels. By conducting daily emotional and workload check-ins, the app provides AI-generated personalized advice to help prevent burnout before it happens.

## ✨ Features
- 🎭 **Emotion-based Stress Selector**: Intuitive selection from 🟢 Energetic to 🔥 Overwhelmed.
- 📊 **Burnout Score Calculator**: Real-time calculation with color-coded results (Green/Yellow/Red).
- 🤖 **AI Advice**: Personalized guidance powered by Groq AI (LLaMA 3).
- ☁️ **Cloud Sync**: History is saved and retrieved from Firebase Firestore.
- 💡 **Wellness Tip of the Day**: Daily inspiration for mental well-being.

## 🛠 Tech Stack
| Component | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| **Database** | Firebase Firestore (via CDN) |
| **AI Engine** | Groq AI (Model: llama-3.3-70b-versatile) |
| **Design** | DM Sans & Space Mono (Google Fonts) |

## 📂 File Structure
- `index.html`: Main application interface.
- `css/`: Styling directory.
  - `style.css`: Global styles and design system.
  - `components.css`: Component-specific styling.
- `js/`: Application logic directory.
  - `app.js`: Main controller.
  - `firebase.js`: Firestore integration.
  - `groq.js`: Groq AI integration.
  - `score.js`: Burnout score logic.
- `.env`: Environment variables (Local only).
- `README.md`: Project documentation.

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
   - Copy your app config to `.env`.
4. **Groq Setup**:
   - Sign up at [console.groq.com](https://console.groq.com).
   - Generate an API key and copy it to `.env`.
5. **Launch**:
   - Open `index.html` in any modern browser. No server required!

## ⚙️ How It Works
The app follows a **Human-to-Machine Pipeline**:
1. **Input**: Student selects an emotion and enters workload data.
2. **Processing**: Emotion is mapped to a numeric value. The `score.js` module calculates a total burnout score (0-100).
3. **AI Generation**: A custom prompt is sent to Groq AI based on the score and emotion.
4. **Output**: Personalized advice is displayed and the check-in is saved to Firestore.

### Emotion-to-Value Mapping
| Emotion | Value |
|---|---|
| Energetic | 1 |
| Normal | 3 |
| Stressed | 6 |
| Exhausted | 8 |
| Overwhelmed | 10 |

### Burnout Score Ranges
| Score | Level | Action |
|---|---|---|
| 0 - 33 | LOW | Keep going! 🌱 |
| 34 - 66 | MODERATE | Take a break soon! ☕ |
| 67 - 100 | HIGH | Rest immediately! 🛑 |

---

## 🧮 Scoring Methodology (`score.js`)

The total burnout score is the **sum of 6 independent factors**, each capped at their max. A special **"just started" guard** applies when a student has 0 study hours and no sessions logged — only Sleep + Stress are counted, so a fresh student isn't unfairly penalized.

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
| < 1 hr (e.g. 30 min) | ~0 pts ✅ |
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
Realistic for students — **5+ pending tasks** already feels crushing.

| Pending Tasks | Score |
|---|---|
| 0–2 tasks | 0–2 pts (barely anything) |
| 3–5 tasks | 2–7 pts (building pressure) |
| 5+ tasks | 7–10 pts (near max quickly) |

---

### 5. 🛌 Break Score — *Max 10 pts*
How long since the student last took a **full rest day**.

| Days Since Break | Score |
|---|---|
| 0 days (just started / just rested) | 0 pts ✅ |
| 1 day | 1 pt (very light) |
| 2–4 days | 1–7 pts (rising risk) |
| 5+ days | 7–10 pts (serious) |

> 💡 A **"Just Started Today 🌱"** quick-select button is available so new students can easily set this to 0 without confusion.

---

### 6. ⏱️ Session Habit Penalty — *Max 10 pts*
Penalizes sessions where the student studied without proper breaks.

| Break Taken | Penalty |
|---|---|
| Proper breaks ✅ | 0 pts per hour |
| Short breaks only | 0.5 pts per hour |
| No breaks at all | 1.5 pts per hour |

Cap: `Math.min(totalPenalty, 10)`

---

### ⚡ "Just Started" Early Return
If `study === 0` and no sessions are logged, the score is calculated using **only Sleep + Stress**. This prevents a fresh student from being falsely penalized for tasks and breaks they haven't accumulated yet.

---

### 📈 Productivity Score (`calculateProductivityScore`)
A separate metric (0–100%) reflecting *how academically effective* the day was — not the same as burnout risk.

| Factor | Effect |
|---|---|
| Study hours | Diminishing returns (curve peaks ~80% at 6 hrs) |
| Pending tasks | −3 pts per task, capped at −40 pts |
| Sessions w/ proper breaks | +up to 15 pts bonus |
| Sessions w/ no breaks | −up to 10 pts penalty |

---

## 📝 System Description

The system is a daily burnout check-in designed to help students monitor not only how much they study, but also how they feel and behave while studying, forming a complete input-to-output flow that turns simple logs into meaningful insights and guidance. At the top, the "Daily Wellness Reminder" serves as a gentle mental health prompt, encouraging users to stay calm, avoid overworking, and focus on one task at a time. Below it, the main section titled "What Did You Study Today?" allows users to log their study activities by entering the subject, specifying the duration in hours or minutes, and indicating whether they took breaks during their session, with more detailed options such as "Yes – took proper breaks," "Short breaks only," and "No breaks at all," which helps the system evaluate not just how long they studied but how healthy their study habits were. Users can add multiple subjects to reflect their full day and use the remove button to correct entries, while the "Additional Notes" section lets them describe their experience — such as feeling distracted, tired, or productive — providing deeper insight into their mental state beyond numerical data.

The system is further enhanced by additional inputs where the user provides personal and study-related data, and the system analyzes it to generate a burnout score, insights, and a recovery plan. At the top, the user is asked how many hours they slept, which is a key factor because lack of sleep is one of the strongest indicators of burnout and fatigue. Below that, the "How are you feeling right now?" section allows the user to select their current emotional state, such as energetic, normal, stressed, exhausted, or overwhelmed. This acts as a quick self-assessment and gives the system an immediate understanding of the user's mental condition. The next input asks for the number of pending tasks or assignments, which helps measure workload pressure, while the "days since you last took a full break" field tracks how long the user has gone without proper rest — another important burnout signal. To make this easier for students who are just beginning their day, a quick-select button labeled "Just Started Today 🌱" is available, automatically setting the value to zero so new students are not unfairly penalized. All of these inputs are combined when the user clicks "Calculate Burnout Risk," which triggers the system to evaluate their condition.

After submission, the system produces a burnout score using a clear scoring logic: scores from 0 to 33 indicate low burnout with the message "You are doing great, keep it up," 34 to 66 indicate moderate burnout with "Slow down and take a break soon," and 67 to 100 indicate high burnout with "Please stop and rest immediately." To make the system more user-friendly, results are color-coded, where green means low risk, yellow means moderate, and red means high risk. The system then provides an "AI Advisor Insight," which explains the reasoning behind the score by connecting the user's inputs, such as having enough sleep, low study time, and a positive mood, making the feedback feel personalized rather than generic. Following that, the system generates a "Recovery Schedule," which is a structured and time-based plan designed to guide the user through the rest of their day, including activities such as short walks, focused study sessions, snack breaks, longer rest periods, and relaxation activities, helping the user maintain a balance between productivity and recovery. The system also calculates a separate Productivity Score from 0 to 100 percent that reflects how effective the student's study session was, factoring in study hours, pending tasks, and break habits, giving a clearer picture of academic performance beyond just burnout risk. The "Study Habit Analysis" section further evaluates how the user studied, reinforcing good habits like taking breaks and suggesting improvements where needed. Students are also motivated through a daily check-in Streak Counter that rewards consistency over time. Finally, the "Recent Check-Ins" section keeps a history of previous entries, showing timestamps, moods, burnout scores, and short summaries along with a clear history button for resetting records, allowing users to track patterns over time. Altogether, this system is designed not just to measure burnout, but to predict, explain, and actively help reduce it through personalized feedback and structured daily guidance.

---

## 👥 Team Members
- **Mark Joshua Baluran** — Lead Developer (JS Logic, Firebase, Groq AI, Score Calculator)
- **Jimmie Em Ilaguno** — UI Developer (CSS Design, Emotion Selector, Spinner)
- **Kielah Manlapid Pepito** — Documentation Specialist (README, Scripting, Demo)
- **Jhon Daryl Sawayan** — Dev Tester (Error Detection, Unnecessary Feature Filtering, Brainstormer)

## 📜 Attribution
- **Firebase** by Google
- **Groq AI** for lightning-fast inference
- **LLaMA 3** by Meta AI

## 📄 License
This project is licensed under the MIT License.