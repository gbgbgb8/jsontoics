document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('jsonFileInput');
    const calendarContainer = document.getElementById('calendarContainer');
    const downloadBtn = document.getElementById('downloadICS');
    const timezoneSelect = document.getElementById('timezone');
    let eventData = [];

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/json') {
            parseJSONFile(file);
        }
    });

    downloadBtn.addEventListener('click', function() {
        convertToICS();
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
        let tbody = table.appendChild(document.createElement('tbody'));
        let headerRow = thead.insertRow();
        let headers = ["Exercise", "Day", "Time", "Sets", "Reps", "Description"];
        
        headers.forEach(headerText => {
            let header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });

        data.forEach(item => {
            let row = tbody.insertRow();
            row.insertCell().textContent = item.Exercise;

            let dayCell = row.insertCell();
            let daySelect = document.createElement('select');
            ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach(day => {
                let option = document.createElement('option');
                option.value = day;
                option.textContent = day;
                if (item.Day === day) option.selected = true;
                daySelect.appendChild(option);
            });
            dayCell.appendChild(daySelect);

            let timeCell = row.insertCell();
            let timeSelect = createTimeDropdown(item.Time);
            timeCell.appendChild(timeSelect);

            row.insertCell().textContent = item.Sets;
            row.insertCell().textContent = item.Reps;
            row.insertCell().textContent = item.Description;
        });

        calendarContainer.innerHTML = '';
        calendarContainer.appendChild(table);
    }

    function createTimeDropdown(selectedTime) {
        let select = document.createElement('select');
        let [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                let timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                let option = document.createElement('option');
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
            let eventName = cells[0].textContent;
            let eventDay = cells[1].querySelector('select').value;
            let eventTime = cells[2].querySelector('select').value;
            let eventDetails = cells[5].textContent;

            let momentDate = moment.tz(`${getFormattedDateForDay(eventDay)} ${eventTime}`, selectedTimezone);
            let endDate = momentDate.clone().add(1, 'hour');
            cal.addEvent(eventName, eventDetails, '', momentDate.toDate(), endDate.toDate());
        });

        cal.download('events');
    }

    function getFormattedDateForDay(day) {
        return moment().day(day).format('YYYY-MM-DD');
    }
});
