document.getElementById('convertButton').addEventListener('click', () => {
    const fileInput = document.getElementById('jsonFile');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                const icsData = convertToICS(jsonData);
                downloadICS(icsData);
            } catch (e) {
                alert('Error parsing JSON file: ' + e.message);
            }
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a JSON file.');
    }
});

function convertToICS(jsonData) {
    let icsEvents = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Your Organization//Your App//EN\n';
    jsonData.forEach(event => {
        const eventDate = getNextDateForDay(event.Day);
        const startTime = event.Time;
        if (eventDate && startTime) {
            icsEvents += 'BEGIN:VEVENT\n';
            icsEvents += 'UID:' + generateUID() + '\n';
            icsEvents += 'DTSTAMP:' + formatDateToICS(new Date()) + '\n';
            icsEvents += 'SUMMARY:' + event.Exercise + '\n';
            icsEvents += 'DESCRIPTION:' + event.Description + ' | Sets: ' + event.Sets + ', Reps: ' + event.Reps + '\n';
            icsEvents += 'DTSTART:' + formatDateToICS(eventDate, startTime) + '\n';
            icsEvents += 'DTEND:' + formatDateToICS(eventDate, startTime, 60) + '\n'; // Assuming each event is 1 hour
            icsEvents += 'END:VEVENT\n';
        }
    });
    icsEvents += 'END:VCALENDAR';
    return icsEvents;
}

function getNextDateForDay(dayOfWeek) {
    const dayMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0 };
    let date = new Date();
    date.setDate(date.getDate() + (7 + dayMap[dayOfWeek] - date.getDay()) % 7);
    return date;
}

function formatDateToICS(date, time, addMinutes = 0) {
    if (time) {
        const [hours, minutes] = time.split(':');
        date.setHours(hours, minutes, 0, 0);
    }
    date.setMinutes(date.getMinutes() + addMinutes);
    return date.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
}

function generateUID() {
    return 'uid-' + Math.random().toString(36).substr(2, 9) + '@example.com';
}

function downloadICS(icsData) {
    const blob = new Blob([icsData], {type: 'text/calendar'});
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = url;
    downloadLink.download = 'workout_schedule.ics';
    downloadLink.style.display = 'block';
    downloadLink.textContent = 'Download iCal File';
}
