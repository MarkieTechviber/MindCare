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
- 📅 **Weekly History**: Track your last 7 check-ins at a glance.
- 🔥 **Streak Counter**: Stay motivated with daily check-in streaks.
- 💡 **Wellness Tip of the Day**: Daily inspiration for mental well-being.

## 🛠 Tech Stack
| Component | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| **Database** | Firebase Firestore (via CDN) |
| **AI Engine** | Groq AI (Model: llama3-8b-8192) |
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

## 👥 Team Members
- **Mark Joshua Baluran** — Lead Developer (JS Logic, Firebase, Groq AI, Score Calculator)
- **Jimmie Em Ilaguno** — UI Developer (CSS Design, Emotion Selector, Spinner)
- **Kielah Manlapid Pepito** — Documentation Specialist (README, Scripting, Demo)

## 📜 Attribution
- **Firebase** by Google
- **Groq AI** for lightning-fast inference
- **LLaMA 3** by Meta AI

## 📄 License
This project is licensed under the MIT License.
