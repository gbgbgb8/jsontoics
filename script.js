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
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                let timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                let option = document.createElement('option');
                option.value = timeValue;
                option.textContent = timeValue;
                if (selectedTime === timeValue) option.selected = true;
                select.appendChild(option);
            }
        }
        return select;
    }

    function convertToICS() {
        // Implementation to convert the data into ICS format and trigger a download
        // This function needs to be implemented according to the ICS format specifications
    }
});
