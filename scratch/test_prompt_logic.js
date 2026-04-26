import { buildPrompt } from './js/groq.js';

// Mock inputs
const inputs = { sleepHours: 5, studyHours: 8, pendingTasks: 3, daysSinceBreak: 2 };
const studyData = { sessions: [{ subject: 'Math', rawValue: 50, unit: 'min', hours: 0.83, breakTaken: 'No breaks' }], notes: 'Test' };

// Test times
const testCases = [
    { name: 'Late Night (1:40 AM)', hour: 1, minute: 40 },
    { name: 'Morning (8:00 AM)', hour: 8, minute: 0 },
    { name: 'Peak Study (2:00 PM)', hour: 14, minute: 0 },
    { name: 'Evening (7:00 PM)', hour: 19, minute: 0 },
    { name: 'Early Night (10:00 PM)', hour: 22, minute: 0 }
];

console.log('--- TESTING BUILD PROMPT LOGIC ---');

testCases.forEach(tc => {
    // Override Date for testing
    const originalDate = global.Date;
    global.Date = class extends originalDate {
        constructor() {
            super();
            this.setHours(tc.hour, tc.minute, 0, 0);
        }
        getHours() { return tc.hour; }
        getMinutes() { return tc.minute; }
        toLocaleTimeString(loc, opt) { 
            const h = tc.hour % 12 || 12;
            const m = tc.minute.toString().padStart(2, '0');
            const ampm = tc.hour >= 12 ? 'PM' : 'AM';
            return `${h}:${m} ${ampm}`;
        }
    };

    const prompt = buildPrompt('Tired', 8, 75, inputs, studyData);
    
    console.log(`\n[CASE: ${tc.name}]`);
    
    // Extract key parts to verify
    const scheduleMatch = prompt.match(/PART 2 — Recovery or productivity schedule starting at (.*?), every (\d+) minutes, exactly (\d+) slots/);
    if (scheduleMatch) {
        console.log(`Start: ${scheduleMatch[1]}`);
        console.log(`Interval: ${scheduleMatch[2]} min`);
        console.log(`Slots: ${scheduleMatch[3]}`);
    }

    const modeMatch = prompt.match(/(LATE NIGHT|EARLY NIGHT MODE|EVENING MODE|PEAK STUDY MODE|MORNING MODE)/);
    if (modeMatch) {
        console.log(`Detected Mode: ${modeMatch[1]}`);
    }

    // Restore Date
    global.Date = originalDate;
});
