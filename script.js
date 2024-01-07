document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('jsonFileInput');
    const calendarContainer = document.getElementById('calendarContainer');
    const downloadBtn = document.getElementById('downloadICS');
    const timezoneSelect = document.getElementById('timezone');

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        parseJSONFile(file);
    });

    downloadBtn.addEventListener('click', function() {
        convertToICS();
    });

    function parseJSONFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            createSpreadsheetCalendar(data);
        };
        reader.readAsText(file);
    }

    function createSpreadsheetCalendar(data) {
        const table = document.createElement('table');
        table.className = 'calendar-table';
        const thead = table.createTHead();
        const tbody = table.appendChild(document.createElement('tbody'));
        const headerRow = thead.insertRow();
        const headers = ["Exercise", "Day", "Time", "Sets", "Reps", "Description"];
        
        headers.forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        data.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell().textContent = item.Exercise;
            row.insertCell().appendChild(createDayDropdown(item.Day));
            const timeCell = row.insertCell();
            timeCell.appendChild(document.createTextNode(item.Time));
            row.insertCell().textContent = item.Sets;
            row.insertCell().textContent = item.Reps;
            row.insertCell().textContent = item.Description;
        });

        calendarContainer.innerHTML = '';
        calendarContainer.appendChild(table);
    }

    function createDayDropdown(selectedDay) {
        const daySelect = document.createElement('select');
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach(day => {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            if (selectedDay === day) option.selected = true;
            daySelect.appendChild(option);
        });
        return daySelect;
    }

    function convertToICS() {
        const selectedTimezone = timezoneSelect.value;
        const comp = new ICAL.Component(['vcalendar', [], []]);
        comp.updatePropertyWithValue('prodid', '-//Your Company//Your Product//EN');

        const calendarTable = document.querySelector('.calendar-table');
        const rows = calendarTable.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = row.cells;
            const eventName = cells[0].textContent;
            const eventDay = cells[1].querySelector('select').value;
            const eventTime = cells[2].textContent;
            const eventDetails = cells[5].textContent;

            const momentDate = moment.tz(`${getFormattedDateForDay(eventDay)} ${eventTime}`, selectedTimezone);
            const endDate = momentDate.clone().add(1, 'hour');
            
            const vevent = new ICAL.Component('vevent');
            vevent.updatePropertyWithValue('summary', eventName);
            vevent.updatePropertyWithValue('dtstart', ICAL.Time.fromJSDate(momentDate.toDate(), true));
            vevent.updatePropertyWithValue('dtend', ICAL.Time.fromJSDate(endDate.toDate(), true));
            vevent.updatePropertyWithValue('description', eventDetails);
            
            comp.addSubcomponent(vevent);
        });

        const icsData = comp.toString();
        downloadICS(icsData, 'calendar.ics');
    }

    function getFormattedDateForDay(day) {
        const dayMap = {
            'Monday': '20240101',
            'Tuesday': '20240102',
            'Wednesday': '20240103',
            'Thursday': '20240104',
            'Friday': '20240105',
            'Saturday': '20240106',
            'Sunday': '20240107'
        };
        return dayMap[day] || '20240101';
    }

    function downloadICS(data, filename) {
        const blob = new Blob([data], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
