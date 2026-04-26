
function buildPrompt(emotionLabel, stressValue, score, inputs, studyData = null) {
    const now = new Date();
    const hour = now.getHours();
    
    const isLateNight  = hour >= 23 || hour < 5;
    const isEarlyNight = hour >= 21 && hour < 23;
    const isEvening    = hour >= 18 && hour < 21;
    const isPeakStudy  = hour >= 11 && hour < 18;
    const isMorning    = hour >= 5  && hour < 11;

    let scheduleSlots, scheduleInterval;
    if (isLateNight)       { scheduleSlots = 3; scheduleInterval = 15; }
    else if (isEarlyNight) { scheduleSlots = 4; scheduleInterval = 20; }
    else if (isEvening)    { scheduleSlots = 5; scheduleInterval = 30; }
    else if (isPeakStudy)  { scheduleSlots = 6; scheduleInterval = 45; }
    else                   { scheduleSlots = 5; scheduleInterval = 30; }

    const minutes = now.getMinutes();
    let startTime = new Date(now);
    if (isLateNight) {
        const roundedMins = Math.ceil(minutes / 5) * 5;
        startTime.setMinutes(roundedMins, 0, 0);
    } else {
        const roundedMins = minutes < 30 ? 30 : 0;
        const roundedHours = minutes < 30 ? hour : hour + 1;
        startTime.setHours(roundedHours, roundedMins, 0, 0);
    }

    const formatTime = (date) => {
        let h = date.getHours();
        let m = date.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const currentTime = formatTime(now);
    const scheduleStart = formatTime(startTime);

    return { currentTime, scheduleStart, scheduleInterval, scheduleSlots, hour };
}

const testCases = [
    { name: 'Late Night (1:40 AM)', hour: 1, minute: 40 },
    { name: 'Morning (8:00 AM)', hour: 8, minute: 0 },
    { name: 'Peak Study (2:00 PM)', hour: 14, minute: 0 },
    { name: 'Evening (7:00 PM)', hour: 19, minute: 0 },
    { name: 'Early Night (10:00 PM)', hour: 22, minute: 0 }
];

testCases.forEach(tc => {
    const mockDate = new Date();
    mockDate.setHours(tc.hour, tc.minute, 0, 0);
    
    // Inject mockDate into the function scope by wrapping it or using a closure
    // For this simple test, I'll just adjust the function slightly to accept a date
    function buildPromptTest(date) {
        const hour = date.getHours();
        const minutes = date.getMinutes();
        
        const isLateNight  = hour >= 23 || hour < 5;
        const isEarlyNight = hour >= 21 && hour < 23;
        const isEvening    = hour >= 18 && hour < 21;
        const isPeakStudy  = hour >= 11 && hour < 18;
        const isMorning    = hour >= 5  && hour < 11;

        let scheduleSlots, scheduleInterval;
        if (isLateNight)       { scheduleSlots = 3; scheduleInterval = 15; }
        else if (isEarlyNight) { scheduleSlots = 4; scheduleInterval = 20; }
        else if (isEvening)    { scheduleSlots = 5; scheduleInterval = 30; }
        else if (isPeakStudy)  { scheduleSlots = 6; scheduleInterval = 45; }
        else                   { scheduleSlots = 5; scheduleInterval = 30; }

        let startTime = new Date(date);
        if (isLateNight) {
            const roundedMins = Math.ceil(minutes / 5) * 5;
            startTime.setMinutes(roundedMins, 0, 0);
        } else {
            const roundedMins = minutes < 30 ? 30 : 0;
            const roundedHours = minutes < 30 ? hour : hour + 1;
            startTime.setHours(roundedHours, roundedMins, 0, 0);
        }

        const formatTime = (d) => {
            let h = d.getHours();
            let m = d.getMinutes();
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
        };

        return { scheduleStart: formatTime(startTime), scheduleInterval, scheduleSlots };
    }

    const res = buildPromptTest(mockDate);
    console.log(`[${tc.name}] Start: ${res.scheduleStart}, Interval: ${res.scheduleInterval}min, Slots: ${res.scheduleSlots}`);
});
