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
        const startDate = formatDateToICS(event.Day, event.Time);
        if (startDate) {
            icsEvents += 'BEGIN:VEVENT\n';
            icsEvents += 'UID:' + generateUID() + '\n';
            icsEvents += 'DTSTAMP:' + formatDateToICS(new Date()) + '\n';
            icsEvents += 'SUMMARY:' + event.Exercise + '\n';
            icsEvents += 'DESCRIPTION:' + event.Description + ' | Sets: ' + event.Sets + ', Reps: ' + event.Reps + '\n';
            icsEvents += 'DTSTART:' + startDate + '\n';
            icsEvents += 'DTEND:' + getEndDate(startDate) + '\n';
            icsEvents += 'END:VEVENT\n';
        }
    });
    icsEvents += 'END:VCALENDAR';
    return icsEvents;
}

function formatDateToICS(day, time) {
    let date = new Date();
    date = getNextDateForDay(day, date);
    const [hours, minutes] = time.split(':');
    date.setHours(hours, minutes, 0, 0);
    return formatICSDate(date);
}

function formatICSDate(date) {
    return date.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
}

function getNextDateForDay(dayOfWeek, date) {
    const dayMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0 };
    let targetDay = dayMap[dayOfWeek];
    let currentDay = date.getDay();
    let difference = targetDay - currentDay;
    if (difference < 0) {
        difference += 7;
    }
    date.setDate(date.getDate() + difference);
    return date;
}

function getEndDate(startDate) {
    let date = new Date(startDate);
    date.setHours(date.getHours() + 1); // Assuming each event lasts 1 hour
    return formatICSDate(date);
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
