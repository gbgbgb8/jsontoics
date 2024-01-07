document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('jsonFileInput');
    const calendarContainer = document.getElementById('calendarContainer');
    const downloadBtn = document.getElementById('downloadICS');
    let eventData = [];

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/json') {
            parseJSONFile(file);
        }
    });

    downloadBtn.addEventListener('click', function() {
        convertToICS(eventData);
    });

    function parseJSONFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            eventData = JSON.parse(e.target.result);
            createSpreadsheetCalendar(eventData);
        };
        reader.readAsText(file);
    }

    function createSpreadsheetCalendar(data) {
        let table = document.createElement('table');
        table.className = 'calendar-table';
        let thead = table.createTHead();
        let tbody = document.createElement('tbody');
        table.appendChild(tbody);

        let headerRow = thead.insertRow();
        let headers = ["Event Name", "Day", "Time", "Timezone", "Details"];
        headers.forEach(headerText => {
            let header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        data.forEach(event => {
            let row = tbody.insertRow();
            row.insertCell().textContent = event.name;

            let dayCell = row.insertCell();
            let daySelect = document.createElement('select');
            ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach(day => {
                let option = document.createElement('option');
                option.value = day;
                option.textContent = day;
                if (event.day === day) option.selected = true;
                daySelect.appendChild(option);
            });
            dayCell.appendChild(daySelect);

            let timeCell = row.insertCell();
            let timeSelect = createTimeDropdown(event.time);
            timeCell.appendChild(timeSelect);

            let timezoneCell = row.insertCell();
            let timezoneSelect = createTimezoneDropdown(event.timezone);
            timezoneCell.appendChild(timezoneSelect);

            row.insertCell().textContent = event.details;
        });

        calendarContainer.innerHTML = '';
        calendarContainer.appendChild(table);
    }

    function createTimeDropdown(selectedTime) {
        let select = document.createElement('select');
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                let time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                let option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                if (time === selectedTime) option.selected = true;
                select.appendChild(option);
            }
        }
        return select;
    }

    function createTimezoneDropdown(selectedTimezone) {
        let timezones = ["UTC-12", "UTC-11", "UTC-10", "UTC-9", /* Add all required timezones here */];
        let select = document.createElement('select');
        timezones.forEach(timezone => {
            let option = document.createElement('option');
            option.value = timezone;
            option.textContent = timezone;
            if (timezone === selectedTimezone) option.selected = true;
            select.appendChild(option);
        });
        return select;
    }

    function convertToICS(data) {
        const calendarTable = document.querySelector('.calendar-table');
        const rows = calendarTable.querySelectorAll('tbody tr');
        let icsData = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Your Company//Your Product//EN\n';

        rows.forEach(row => {
            const cells = row.cells;
            let eventName = cells[0].textContent;
            let eventDay = cells[1].querySelector('select').value;
            let eventTime = cells[2].querySelector('select').value;
            let eventTimezone = cells[3].querySelector('select').value;
            let eventDetails = cells[4].textContent;

            icsData += `BEGIN:VEVENT\nSUMMARY:${eventName}\nDTSTART;TZID=${eventTimezone}:${formatDateToICS(eventDay, eventTime)}\nDESCRIPTION:${eventDetails}\nEND:VEVENT\n`;
        });

        icsData += 'END:VCALENDAR';

        const blob = new Blob([icsData], {type: 'text/calendar'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'events.ics';
        a.click();
        URL.revokeObjectURL(url);
    }

    function formatDateToICS(day, time) {
        // Implement logic to convert day and time to ICS date format
        // This part of the code depends on how you plan to handle the conversion based on the selected day and time.
    }

    const style = document.createElement('style');
    style.textContent = `
        .calendar-table { width: 100%; border-collapse: collapse; }
        .calendar-table th, .calendar-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .calendar-table th { background-color: #f2f2f2; }
    `;
    document.head.appendChild(style);
});
