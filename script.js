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
            row.insertCell().appendChild(createTimeDropdown(item.Time));
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

    function createTimeDropdown(selectedTime) {
        const select = document.createElement('select');
        const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const option = document.createElement('option');
                option.value = timeValue;
                option.textContent = timeValue;
                if (hour === selectedHour && minute === selectedMinute) option.selected = true;
                select.appendChild(option);
            }
        }
        return select;
    }

    function convertToICS() {
        const selectedTimezone = timezoneSelect.value;
        const cal = new ics();
        const calendarTable = document.querySelector('.calendar-table');
        const rows = calendarTable.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = row.cells;
            const eventName = cells[0].textContent;
            const eventDay = cells[1].querySelector('select').value;
            const eventTime = cells[2].querySelector('select').value;
            const eventDetails = cells[5].textContent;

            const momentDate = moment.tz(`${getFormattedDateForDay(eventDay)} ${eventTime}`, selectedTimezone);
            const endDate = momentDate.clone().add(1, 'hour');
            cal.addEvent(eventName, eventDetails, '', momentDate.toDate(), endDate.toDate());
        });

        cal.download('events');
    }

    function getFormattedDateForDay(day) {
        return moment().day(day).format('YYYY-MM-DD');
    }
});
