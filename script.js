document.getElementById('convertButton').addEventListener('click', () => {
    const fileInput = document.getElementById('jsonFile');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const jsonData = JSON.parse(event.target.result);
            const icsData = convertToICS(jsonData);
            downloadICS(icsData);
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a JSON file.');
    }
});

function convertToICS(jsonData) {
    let icsEvents = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Your Organization//Your App//EN\n';
    jsonData.forEach(event => {
        const startDate = formatDate(event.Day, event.Time);
        if (startDate) {
            icsEvents += `BEGIN:VEVENT\n`;
            icsEvents += `SUMMARY:${event.Exercise}\n`;
            icsEvents += `DESCRIPTION:${event.Description} | Sets: ${event.Sets}, Reps: ${event.Reps}\n`;
            icsEvents += `DTSTART;VALUE=DATE:${startDate}\n`;
            icsEvents += `DTEND;VALUE=DATE:${startDate}\n`;
            icsEvents += `END:VEVENT\n`;
        }
    });
    icsEvents += 'END:VCALENDAR';
    return icsEvents;
}

function formatDate(day, time) {
    if (!day || !time) {
        return '';
    }

    const date = new Date();
    const dayMap = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 0
    };
    date.setDate(date.getDate() + ((7 + dayMap[day] - date.getDay()) % 7));
    const [hours, minutes] = time.split(':');
    date.setHours(hours, minutes, 0);
    return formatDateToICS(date);
}

function formatDateToICS(date) {
    return date.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
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
