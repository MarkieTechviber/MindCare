# 🔥 NightR41d.exe — AI Code Prompts Per File
**Student Burnout Prevention System | ICT Week 2026 Hackathon**
*Use each prompt below to generate the exact code for its corresponding file.*

---

---

## 📄 `index.html` — Main Page

```
You are building the main HTML page for a Student Burnout Prevention System web app called NightR41d.exe, created for a hackathon (ICT Week 2026).

PROJECT CONTEXT:
- This is a daily check-in web app that helps students monitor and prevent academic burnout.
- It uses vanilla HTML, CSS, and JavaScript — NO frameworks, NO npm, NO build tools.
- The app connects to Firebase Firestore (for saving check-in history) and Groq AI (for personalized advice).
- All CSS lives in: css/style.css and css/components.css
- All JS logic lives in: js/app.js (which imports score.js, groq.js, firebase.js as ES modules)

DESIGN AESTHETIC:
- Calm, clean, modern — this is a mental wellness app, it must feel soft and safe
- Color scheme: dark navy/deep blue background (#0f1117), soft white text, accent colors tied to burnout levels
  - Green (#4ade80) = Low burnout
  - Yellow (#facc15) = Moderate burnout
  - Red (#f87171) = High burnout
- Emotion selector buttons should feel friendly and tappable, not clinical

YOUR TASK:
Build the full index.html file. It must include ALL of the following sections:

1. HEAD SECTION:
   - Link to css/style.css and css/components.css
   - Load Firebase SDK via CDN (use compat version: firebase-app-compat.js and firebase-firestore-compat.js from https://www.gstatic.com/firebasejs/9.23.0/)
   - Set type="module" on the script tag that loads js/app.js
   - Use Google Fonts: import "DM Sans" for body text and "Space Mono" for headings/accents
   - Meta charset, viewport, and a descriptive title

2. HEADER:
   - App name: "NightR41d" styled prominently
   - Subtitle: "Student Burnout Prevention System"
   - A small tagline: "Check in daily. Stay ahead of burnout."

3. WELLNESS TIP OF THE DAY section:
   - A card with id="wellness-tip" that shows a random tip (JS will populate this)
   - Label it "💡 Tip of the Day"

4. DAILY CHECK-IN FORM (id="checkin-form"):
   Fields in this exact order:
   a) Sleep hours: number input, min=0, max=24, id="sleep-hrs", label "🌙 Hours of Sleep"
   b) Study hours: number input, min=0, max=24, id="study-hrs", label "📚 Hours of Study"
   c) Emotion selector (id="emotion-selector"):
      - Label: "💭 How are you feeling right now?"
      - 5 buttons, each with data-value and data-label attributes:
        * 🟢 Energetic (data-value="1" data-label="Energetic")
        * 🟡 Normal (data-value="3" data-label="Normal")
        * 🟠 Stressed (data-value="6" data-label="Stressed")
        * 🔴 Exhausted (data-value="8" data-label="Exhausted")
        * 🔥 Overwhelmed (data-value="10" data-label="Overwhelmed")
      - A hidden input (id="selected-emotion-value") and (id="selected-emotion-label") to store the selected values
   d) Pending tasks: number input, min=0, id="pending-tasks", label "📋 Pending Tasks"
   e) Days since last break: number input, min=0, id="last-break", label "☕ Days Since Last Break"
   - Submit button: "Submit Check-In →" with id="submit-btn"

5. LOADING SPINNER (id="loading-spinner", hidden by default):
   - Show this while waiting for Groq AI response
   - Text: "Generating your personalized advice..."

6. RESULT SECTION (id="result-section", hidden by default):
   - Burnout score display card (id="score-card"):
     * Show score number (id="score-value")
     * Show level label (id="score-level") e.g. "LOW", "MODERATE", "HIGH"
     * Show level message (id="score-message")
   - AI Advice card (id="ai-advice-card"):
     * Label: "🤖 AI Advice Just For You"
     * Paragraph (id="ai-advice-text") where JS injects the Groq response

7. WEEKLY HISTORY SECTION (id="history-section"):
   - Title: "📅 Your Last 7 Check-Ins"
   - A div (id="history-list") where JS dynamically renders past check-ins
   - A button id="clear-history-btn": "🗑 Clear History"

8. STREAK COUNTER (id="streak-section"):
   - Display: "🔥 Current Streak: X days"
   - Span id="streak-count" where JS injects the count

9. FOOTER:
   - "NightR41d.exe | BSIT Sophomore | ACLC ICT Week 2026"

IMPORTANT RULES:
- Every section must have the exact IDs listed above — JS depends on them
- Do NOT write any inline styles — all styling goes in the CSS files
- Do NOT write any JavaScript inline — all logic is in the JS files
- The emotion selector must use buttons, not a dropdown or radio inputs
- The form must NOT use a traditional submit — app.js will intercept via addEventListener
- Output only the complete, clean index.html file
```

---

## 🔒 `.env` — Environment Variables

```
Generate the contents of a .env file for a vanilla JavaScript web app that uses Firebase Firestore and Groq AI API.

The app is called NightR41d — Student Burnout Prevention System.

The .env file must contain the following variables with placeholder values:

Firebase config variables:
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
FIREBASE_APP_ID=your_firebase_app_id_here

Groq AI variable:
GROQ_API_KEY=your_groq_api_key_here

Add a comment block at the top explaining:
- This file contains secret API keys
- It must NEVER be committed to GitHub
- It is listed in .gitignore

Output only the .env file contents with no explanation outside the file.
```

---

## 📋 `.env.example` — Environment Template

```
Generate the contents of a .env.example file for a vanilla JavaScript web app using Firebase Firestore and Groq AI.

This file is a SAFE template — it shows what variable names are needed but has all values set to empty strings or descriptive placeholders.

The app is called NightR41d — Student Burnout Prevention System.

Include a header comment explaining:
- Copy this file to .env and fill in real values
- Never commit the actual .env file to GitHub
- Where to get each key (Firebase Console at firebase.google.com, Groq Console at console.groq.com)

Variables to include (all with empty or placeholder values):
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
GROQ_API_KEY=

Output only the .env.example file contents.
```

---

## 🚫 `.gitignore` — Git Ignore Rules

```
Generate a .gitignore file for a vanilla HTML/CSS/JavaScript web project (no Node.js, no build tools, no npm).

The project is called NightR41d — Student Burnout Prevention System.

The .gitignore must ignore:
1. .env — secret API keys file, must NEVER be pushed to GitHub
2. Common OS files: .DS_Store (macOS), Thumbs.db (Windows), desktop.ini
3. Common editor folders: .vscode/, .idea/
4. Any local notes files: notes.txt, scratch.*, todo.txt
5. assets/audio/ folder — audio files are local only and too large for GitHub

Add a comment header explaining what this file does and why .env is the most important entry.

Output only the .gitignore file contents.
```

---

## 📖 `README.md` — Project Documentation

```
Write a complete, professional README.md file for a hackathon project called:

**Student Burnout Prevention System**
Team: NightR41d.exe | BSIT Sophomore | ACLC ICT Week 2026

PROJECT DESCRIPTION:
A web application that helps students monitor and prevent academic burnout through daily emotional check-ins, AI-generated personalized advice, and cloud-saved history.

KEY FEATURES TO DOCUMENT:
- Emotion-based stress selector (🟢 Energetic → 🔥 Overwhelmed) mapped to numeric values
- Burnout score calculator with color-coded result cards (Green/Yellow/Red)
- Groq AI (LLaMA 3) generates personalized advice using the student's emotion label and numeric stress value
- Firebase Firestore saves all check-ins to the cloud and retrieves last 7 entries for history
- Weekly check-in history view
- Streak counter, Wellness Tip of the Day, Clear History button

TECH STACK:
- Frontend: HTML + CSS + Vanilla JavaScript
- Database: Firebase Firestore (via CDN, no npm)
- AI Engine: Groq AI (LLaMA 3 model: llama3-8b-8192)

TEAM MEMBERS:
- Mark Joshua Baluran — Lead Developer (all JS logic, Firebase, Groq AI, score calculator)
- Jimmie Em Ilaguno — UI Developer (all CSS, emotion selector design, result cards, loading spinner)
- Kielah Manlapid Pepito — Documentation Specialist (README, narration script, demo video)

README SECTIONS TO INCLUDE:
1. Project title and badge-style metadata (team, section, date)
2. About / Project Overview
3. Features list (with emojis)
4. Tech Stack table
5. File Structure overview
6. Setup Instructions:
   a. Clone the repository
   b. Copy .env.example to .env and fill in the API keys
   c. Firebase Setup: Create project at firebase.google.com, enable Firestore in test mode, copy config to .env
   d. Groq Setup: Sign up at console.groq.com (free tier), copy API key to .env
   e. Open index.html in a browser — no server needed
7. How It Works (explain the Human-to-Machine Pipeline: emotion → numeric value → score → Groq prompt → AI advice → saved to Firestore)
8. Emotion-to-Value Mapping table
9. Burnout Score Ranges table
10. Attribution / Credits section (Firebase by Google, Groq AI, LLaMA 3 by Meta)
11. License: MIT

Write in a clean, professional markdown style with good use of headers, tables, and code blocks. This README will be read by hackathon judges.
```

---

## 🎨 `css/style.css` — Global Styles

```
You are writing the global CSS file (style.css) for a Student Burnout Prevention System web app called NightR41d.exe.

DESIGN DIRECTION:
- Aesthetic: Calm, dark, modern wellness app — think late-night study session but safe and supportive
- Background: Deep navy/dark (#0f1117 or similar dark base)
- Text: Soft white (#f1f5f9) for body, slightly muted (#94a3b8) for secondary
- Accent colors (defined as CSS variables):
  --color-low: #4ade80 (green — low burnout)
  --color-moderate: #facc15 (yellow — moderate burnout)
  --color-high: #f87171 (red — high burnout)
  --color-primary: #818cf8 (indigo — brand accent)
  --color-bg: #0f1117
  --color-surface: #1e2130
  --color-border: #2e3347
  --color-text: #f1f5f9
  --color-text-muted: #94a3b8

FONTS:
- Body text: "DM Sans" (loaded from Google Fonts in index.html)
- Headings/accents/labels: "Space Mono" (monospace, techy feel for a hackathon project)
- Base font size: 16px

YOUR TASK — Write complete CSS for:

1. CSS CUSTOM PROPERTIES (variables block on :root)

2. RESET & BASE:
   - Box-sizing border-box on everything
   - Zero margin/padding reset
   - Smooth scrolling on html
   - Body: background var(--color-bg), color var(--color-text), font DM Sans
   - Line-height 1.6

3. LAYOUT:
   - Main container: max-width 680px, centered with margin auto, padding 2rem 1.5rem
   - Section spacing: 2.5rem margin-bottom between major sections

4. TYPOGRAPHY:
   - h1: Space Mono, large (2rem+), color white, letter-spacing -0.02em
   - h2: Space Mono, 1.25rem, color var(--color-primary), uppercase, letter-spacing 0.08em
   - p: DM Sans, 1rem, color var(--color-text-muted), line-height 1.7
   - Labels: Space Mono, 0.75rem, uppercase, letter-spacing 0.1em, color var(--color-text-muted)

5. HEADER:
   - App name styled large and bold
   - Tagline styled small and muted
   - A subtle horizontal rule or border-bottom separating header from content

6. CARDS / SURFACES:
   - .card class: background var(--color-surface), border 1px solid var(--color-border), border-radius 12px, padding 1.5rem
   - Subtle box-shadow: 0 4px 24px rgba(0,0,0,0.3)

7. FORM INPUTS:
   - Number inputs: full width, background transparent or slightly lighter surface, border var(--color-border), border-radius 8px, padding 0.75rem 1rem, color white, font DM Sans
   - Focus state: border-color var(--color-primary), outline none, subtle glow box-shadow

8. SUBMIT BUTTON (#submit-btn):
   - Full width
   - Background: var(--color-primary)
   - Color: white
   - Font: Space Mono, uppercase, letter-spacing 0.1em
   - Border-radius: 8px
   - Padding: 1rem
   - Cursor pointer
   - Hover: slightly brighter background, subtle transform translateY(-1px)
   - Transition: all 0.2s ease

9. UTILITY CLASSES:
   - .hidden { display: none !important; }
   - .text-low { color: var(--color-low); }
   - .text-moderate { color: var(--color-moderate); }
   - .text-high { color: var(--color-high); }

10. FOOTER:
    - Centered, small, muted text
    - Space Mono font
    - Border-top separator

11. RESPONSIVE:
    - On screens below 480px: reduce padding, smaller font sizes, full-width inputs

Output only the complete style.css file. No explanations outside the CSS.
```

---

## 🧩 `css/components.css` — Component Styles

```
You are writing the component CSS file (components.css) for a Student Burnout Prevention System web app called NightR41d.exe.

This file styles individual UI components. Global variables are already defined in style.css — use them with var().

DESIGN DIRECTION: Calm, dark wellness app. Soft glows, smooth transitions, emotion-driven color coding.

YOUR TASK — Write complete CSS for these components:

1. WELLNESS TIP CARD (#wellness-tip):
   - Styled as a soft card with a left border in var(--color-primary)
   - Italic text, slightly muted
   - Small "💡 Tip of the Day" label above in Space Mono uppercase

2. EMOTION SELECTOR (#emotion-selector):
   - Label above: "💭 How are you feeling right now?"
   - Container: display flex, flex-wrap wrap, gap 0.75rem, margin-top 0.75rem
   - Each emotion button (.emotion-btn):
     * Padding: 0.6rem 1.2rem
     * Border-radius: 50px (pill shape)
     * Border: 2px solid var(--color-border)
     * Background: transparent
     * Color: var(--color-text-muted)
     * Font: DM Sans, 0.95rem
     * Cursor: pointer
     * Transition: all 0.2s ease
     * Hover: border-color changes to the emotion's color, text brightens
   - Active/selected state (.emotion-btn.selected):
     * 🟢 Energetic: border and text color #4ade80, subtle green glow box-shadow
     * 🟡 Normal: border and text color #facc15, subtle yellow glow
     * 🟠 Stressed: border and text color #fb923c, subtle orange glow
     * 🔴 Exhausted: border and text color #f87171, subtle red glow
     * 🔥 Overwhelmed: border and text color #ef4444, background slightly red-tinted, strong red glow
   - Use data attribute selectors or specific classes per emotion for the selected colors

3. LOADING SPINNER (#loading-spinner):
   - Centered, full section
   - A CSS-only animated spinning ring (border-radius 50%, border with one colored side, @keyframes spin)
   - Color: var(--color-primary)
   - Size: 48px × 48px
   - Below spinner: loading text in Space Mono, small, muted, letter-spacing 0.1em

4. SCORE CARD (#score-card):
   - Base style: card surface, centered text
   - Large score number (#score-value): 4rem, Space Mono, bold
   - Score level badge (#score-level): uppercase pill badge, Space Mono
     * .score-low: green background (rgba of --color-low), green text
     * .score-moderate: yellow background, yellow text
     * .score-high: red background, red text
   - Score message (#score-message): muted paragraph below
   - The entire card border-left or border-top should change color based on level class

5. AI ADVICE CARD (#ai-advice-card):
   - Distinct from score card — use a slightly different background tint
   - Left border accent in var(--color-primary)
   - "🤖 AI Advice Just For You" label in Space Mono uppercase small
   - Advice text (#ai-advice-text): DM Sans, 1rem, line-height 1.8, white text
   - Subtle entrance animation: fade in + slide up (opacity 0→1, translateY 10px→0) over 0.4s

6. HISTORY LIST (#history-list):
   - Each history entry (.history-entry):
     * Card style, compact padding (1rem 1.25rem)
     * Flex row: date on left, emotion badge in center, score on right
     * Small text, Space Mono for date/score
     * Emotion shown as colored pill matching the emotion color
   - Empty state: centered muted text "No check-ins yet. Start your first one above! 👆"

7. CLEAR HISTORY BUTTON (#clear-history-btn):
   - Small, subtle — NOT a primary action
   - Outline style: border 1px solid var(--color-border), background transparent
   - Color: var(--color-text-muted)
   - Hover: border-color red (#f87171), color red
   - Padding: 0.5rem 1rem, border-radius 6px, font DM Sans small

8. STREAK SECTION (#streak-section):
   - Inline badge style
   - "🔥" emoji large, streak number in Space Mono bold
   - Subtle glowing orange accent when streak > 0

Output only the complete components.css file. No explanations outside the CSS.
```

---

## 🔥 `js/firebase.js` — Firebase Integration

```
You are writing the firebase.js file for a Student Burnout Prevention System web app called NightR41d.exe.

TECH CONTEXT:
- Vanilla JavaScript, ES Modules (type="module")
- Firebase is loaded via CDN compat version in index.html — do NOT import Firebase packages
- The Firebase compat SDK is already globally available as firebase.app(), firebase.firestore(), etc.
- API keys and config are loaded from environment variables — for this hackathon, hardcode the config object using the variable names from .env so the developer can easily swap them in

YOUR TASK:
Write the complete firebase.js file that exports two functions: saveCheckin and getHistory.

1. FIREBASE CONFIGURATION:
   - Create a firebaseConfig object with: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
   - Use placeholder values that match the .env variable names as comments
   - Initialize Firebase app: firebase.initializeApp(firebaseConfig)
   - Get Firestore: const db = firebase.firestore()

2. saveCheckin(data) — ASYNC FUNCTION:
   - Accepts a data object with these fields:
     { date, sleep, study, emotion, stressValue, tasks, lastBreak, score, aiAdvice }
   - Saves the object to a Firestore collection called "checkins"
   - Adds a timestamp field using firebase.firestore.FieldValue.serverTimestamp()
   - Returns the saved document reference
   - Wraps in try/catch — logs errors to console

3. getHistory() — ASYNC FUNCTION:
   - Queries the "checkins" collection
   - Orders by "timestamp" descending
   - Limits to 7 documents
   - Returns an array of plain objects (map each doc to { id: doc.id, ...doc.data() })
   - Wraps in try/catch — returns empty array on error

4. clearHistory() — ASYNC FUNCTION:
   - Fetches all documents in the "checkins" collection
   - Deletes each one in a loop (batch delete without batch API for simplicity)
   - Returns true on success, false on error

Export all three functions as named exports.
Add clear JSDoc comments on each function explaining what it does and what it returns.
Output only the complete firebase.js file.
```

---

## 🤖 `js/groq.js` — Groq AI Integration

```
You are writing the groq.js file for a Student Burnout Prevention System web app called NightR41d.exe.

TECH CONTEXT:
- Vanilla JavaScript, ES Module
- Uses the native fetch() API — no npm packages
- Groq API endpoint: https://api.groq.com/openai/v1/chat/completions
- Model: llama3-8b-8192
- API key is stored in a const at the top of this file (developer will replace with real key)

YOUR TASK:
Write the complete groq.js file with these two exported functions:

1. buildPrompt(formData) — PURE FUNCTION:
   - Accepts a formData object: { sleep, study, emotion, stressValue, tasks, lastBreak, score, scoreLevel }
   - Returns a string prompt that will be sent to Groq
   - The prompt must:
     * Address the student warmly and personally
     * Mention their specific emotion label (e.g., "feeling overwhelmed")
     * Reference their sleep and study hours concretely
     * Reference their burnout score and level (LOW/MODERATE/HIGH)
     * Ask Groq to generate 3-5 sentences of personalized, caring, actionable advice
     * Ask Groq to match tone to emotion:
       - Energetic → encouraging, positive
       - Normal → balanced, gentle
       - Stressed → calm, supportive reminders
       - Exhausted → firm but caring rest advice
       - Overwhelmed → urgent care, normalize asking for help, very warm tone
     * Instruct Groq: respond in second person ("you"), avoid bullet points, write like a caring mentor, keep it under 100 words
     * Instruct Groq: do NOT introduce yourself, go straight to the advice

2. getGroqAdvice(formData) — ASYNC FUNCTION:
   - Calls buildPrompt(formData) to get the prompt string
   - Makes a POST fetch request to the Groq endpoint
   - Headers: Content-Type application/json, Authorization Bearer [GROQ_API_KEY]
   - Body: { model: "llama3-8b-8192", messages: [{ role: "user", content: prompt }], max_tokens: 200, temperature: 0.8 }
   - Parses the response and returns the content string from choices[0].message.content
   - Wraps in try/catch — returns a fallback message on error: "You're doing your best. Remember to rest, drink water, and be kind to yourself today. 💙"

Add a const GROQ_API_KEY at the top with a placeholder comment.
Add JSDoc comments on both functions.
Export both functions as named exports.
Output only the complete groq.js file.
```

---

## 📊 `js/score.js` — Burnout Score Calculator

```
You are writing the score.js file for a Student Burnout Prevention System web app called NightR41d.exe.

TECH CONTEXT:
- Vanilla JavaScript, ES Module
- Pure logic file — no DOM manipulation, no API calls
- This file only calculates. app.js handles everything else.

YOUR TASK:
Write the complete score.js file with these exported functions and constants:

1. EMOTION_MAP — EXPORTED CONST OBJECT:
   Map emotion labels to their numeric stress values:
   {
     "Energetic": 1,
     "Normal": 3,
     "Stressed": 6,
     "Exhausted": 8,
     "Overwhelmed": 10
   }

2. emotionToValue(emotionLabel) — PURE FUNCTION:
   - Accepts a string emotion label
   - Returns the numeric stress value from EMOTION_MAP
   - Returns 5 as default if label is not found (safe fallback)

3. calculateBurnoutScore(inputs) — PURE FUNCTION:
   - Accepts an object: { sleep, study, stressValue, tasks, lastBreak }
   - All inputs are numbers
   - Uses this scoring formula:
     * sleepScore: Ideal sleep is 7-9 hours. Score 0 if in range, else score the deficit/excess proportionally (max 25 points)
     * studyScore: More than 10 hours of study = high risk. Scale from 0-25 points based on hours (study / 10 * 25, capped at 25)
     * stressScore: (stressValue / 10) * 30 — stress contributes the most (max 30 points)
     * tasksScore: (tasks / 10) * 10 — up to 10 pending tasks = 10 points, capped at 10
     * breakScore: (lastBreak / 7) * 10 — more days without break = higher score, capped at 10
   - Total = sleepScore + studyScore + stressScore + tasksScore + breakScore
   - Clamp final score to 0-100
   - Return Math.round(total)

4. getScoreLevel(score) — PURE FUNCTION:
   - Accepts a number 0-100
   - Returns an object: { level, message, colorClass }
     * 0-33: { level: "LOW", message: "You are doing great! Keep it up! 🌱", colorClass: "score-low" }
     * 34-66: { level: "MODERATE", message: "Slow down and take a break soon! ☕", colorClass: "score-moderate" }
     * 67-100: { level: "HIGH", message: "Please stop and rest immediately! 🛑", colorClass: "score-high" }

Add JSDoc comments on each function documenting params and return values.
Export EMOTION_MAP, emotionToValue, calculateBurnoutScore, and getScoreLevel as named exports.
Output only the complete score.js file. No DOM, no fetch, no side effects.
```

---

## ⚙️ `js/app.js` — Main Controller

```
You are writing the app.js file for a Student Burnout Prevention System web app called NightR41d.exe.

TECH CONTEXT:
- Vanilla JavaScript, ES Module (type="module" in index.html)
- This file is the main controller — it connects all other modules
- Imports from: ./score.js, ./groq.js, ./firebase.js
- All DOM IDs referenced are defined in index.html

DOM IDs this file uses:
- Form: #checkin-form
- Inputs: #sleep-hrs, #study-hrs, #pending-tasks, #last-break
- Emotion hidden inputs: #selected-emotion-value, #selected-emotion-label
- Emotion buttons: .emotion-btn (all), each has data-value and data-label
- Submit button: #submit-btn
- Loading spinner: #loading-spinner
- Result section: #result-section
- Score: #score-value, #score-level, #score-card
- Score message: #score-message
- AI advice: #ai-advice-text
- History: #history-list
- Clear history: #clear-history-btn
- Streak: #streak-count
- Wellness tip: #wellness-tip

YOUR TASK:
Write the complete app.js file that handles the full application lifecycle.

1. IMPORTS:
   Import named exports from ./score.js, ./groq.js, ./firebase.js

2. WELLNESS TIPS (on page load):
   Define an array of 10 wellness tips (short, friendly, real advice for students).
   On page load, pick one at random and inject it into #wellness-tip.

3. EMOTION SELECTOR:
   - Add click event listeners to all .emotion-btn elements
   - On click: remove .selected class from all buttons, add .selected to clicked button
   - Update #selected-emotion-value with the button's data-value
   - Update #selected-emotion-label with the button's data-label

4. FORM SUBMISSION (listen on #checkin-form submit event):
   a) Prevent default form submission
   b) Read and validate all inputs:
      - sleep, study, tasks, lastBreak as numbers
      - emotion label from #selected-emotion-label
      - emotion value from #selected-emotion-value (parse as number)
      - If emotion not selected: alert "Please select how you are feeling!" and return
   c) Show #loading-spinner, hide #result-section
   d) Call emotionToValue() with the emotion label to get stressValue (use the selected value directly — emotionToValue is a backup)
   e) Call calculateBurnoutScore({ sleep, study, stressValue, tasks, lastBreak })
   f) Call getScoreLevel(score) to get level, message, colorClass
   g) Call getGroqAdvice({ sleep, study, emotion: emotionLabel, stressValue, tasks, lastBreak, score, scoreLevel: level }) — AWAIT this
   h) Build the full checkin data object: { date: new Date().toLocaleDateString(), sleep, study, emotion: emotionLabel, stressValue, tasks, lastBreak, score, aiAdvice }
   i) Call saveCheckin(checkinData) — AWAIT this
   j) Inject results into DOM:
      - #score-value: score number
      - #score-level: level text
      - #score-card: remove old score-low/moderate/high classes, add colorClass
      - #score-message: message text
      - #ai-advice-text: AI advice string
   k) Hide #loading-spinner, show #result-section (scroll into view smoothly)
   l) Call renderHistory() to refresh the history list
   m) Call updateStreak()

5. renderHistory() — ASYNC FUNCTION:
   - Call getHistory() — AWAIT
   - If no history: inject "No check-ins yet. Start your first one above! 👆" into #history-list
   - Else: for each entry, create a div.history-entry with:
     * Date
     * Emotion label (styled as a span with class matching the emotion)
     * Score with level color class
   - Inject all into #history-list (replace content, don't append)

6. updateStreak() — ASYNC FUNCTION:
   - Call getHistory()
   - Count how many of the returned check-ins have consecutive dates (today, yesterday, etc.)
   - Update #streak-count with the streak number

7. CLEAR HISTORY:
   - Add click listener to #clear-history-btn
   - Confirm: "Are you sure you want to clear all your history?"
   - If confirmed: call clearHistory() — AWAIT
   - Re-render history, reset streak to 0

8. INITIAL PAGE LOAD:
   - Call renderHistory() on DOMContentLoaded
   - Call updateStreak() on DOMContentLoaded

Add comments throughout explaining each section.
Output only the complete app.js file.
```

---

*NightR41d.exe | BSIT Sophomore | ACLC ICT Week 2026*
*Prompts compiled for Team NightR41d.exe — Feed each prompt to an AI to generate the file's complete code.*
