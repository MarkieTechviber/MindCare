import { calculateProductivityScore } from '../js/score.js';

const testCases = [
    { name: "Case 1: 6hrs sleep, 32min study, 6 stress, 0 tasks, no break, 29 burnout", sleep: 6, study: 32/60, stressValue: 6, tasks: 0, sessions: [{ hours: 32/60, breakTaken: 'no' }], burnoutScore: 29 },
    { name: "Case 2: 7hrs sleep, 2hrs study, 3 stress, 0 tasks, good breaks, 20 burnout", sleep: 7, study: 2, stressValue: 3, tasks: 0, sessions: [{ hours: 2, breakTaken: 'yes' }], burnoutScore: 20 },
    { name: "Case 3: 5hrs sleep, 3hrs study, 7 stress, 4 tasks, long no break, 55 burnout", sleep: 5, study: 3, stressValue: 7, tasks: 4, sessions: [{ hours: 3, breakTaken: 'no' }], burnoutScore: 55 },
    { name: "Case 4: 4hrs sleep, 4hrs study, 9 stress, 6 tasks, long no break, 80 burnout", sleep: 4, study: 4, stressValue: 9, tasks: 6, sessions: [{ hours: 4, breakTaken: 'no' }], burnoutScore: 80 },
    { name: "Case 5: 8hrs sleep, 1.5hrs study, 2 stress, 0 tasks, good breaks, 15 burnout", sleep: 8, study: 1.5, stressValue: 2, tasks: 0, sessions: [{ hours: 1.5, breakTaken: 'yes' }], burnoutScore: 15 }
];

testCases.forEach(tc => {
    const result = calculateProductivityScore(tc);
    console.log(`${tc.name} => Result: ${result}%`);
});
