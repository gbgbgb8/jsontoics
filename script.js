document.getElementById('jsonInput').addEventListener('change', function(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        const jsonContent = JSON.parse(e.target.result);
        displayEventsForEditing(jsonContent);
    };
    fileReader.readAsText(event.target.files[0]);
});

function displayEventsForEditing(events) {
    const editor = document.getElementById('eventEditor');
    editor.innerHTML = '';
    events.forEach((event, index) => {
        for (const key in event) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = event[key];
            input.dataset.eventIndex = index;
            input.dataset.eventKey = key;
            editor.appendChild(input);
        }
        editor.appendChild(document.createElement('br'));
    });
    document.getElementById('downloadIcs').style.display = 'block';
    editor.style.display = 'block';
}

document.getElementById('downloadIcs').addEventListener('click', function() {
    const events = collectEventData();
    const icsContent = generateIcsContent(events);
    downloadIcsFile(icsContent);
});

function collectEventData() {
    const inputs = document.querySelectorAll('#eventEditor input');
    const events = {};
    inputs.forEach(input => {
        const index = input.dataset.eventIndex;
        const key = input.dataset.eventKey;
        if (!events[index]) events[index] = {};
        events[index][key] = input.value;
    });
    return Object.values(events);
}

function generateIcsContent(events) {
    let icsString = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Your Organization//Your App//EN\n";
    events.forEach(event => {
        icsString += "BEGIN:VEVENT\n";
        icsString += `DTSTART:${formatDateToIcs(event.Day, event.Time)}\n`;
        icsString += `SUMMARY:${event.Exercise}\n`;
        icsString += `DESCRIPTION:Sets: ${event.Sets}, Reps: ${event.Reps}, ${event.Description}\n`;
        icsString += "END:VEVENT\n";
    });
    icsString += "END:VCALENDAR";
    return icsString;
}

function formatDateToIcs(day, time) {
    const days = { "Monday": "MO", "Tuesday": "TU", "Wednesday": "WE", "Thursday": "TH", "Friday": "FR", "Saturday": "SA", "Sunday": "SU" };
    const date = new Date();
    date.setHours(...time.split(':'), 0);
    const formattedDate = date.toISOString().replace(/[-:]/g, '').slice(0, 15);
    return `${formattedDate};BYDAY=${days[day]}`;
}

function downloadIcsFile(content) {
    const blob = new Blob([content], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workout_plan.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
