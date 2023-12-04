const taskForm = document.getElementById('newTaskForm');
const taskNameField = document.getElementById('taskNameField');
const durationField = document.getElementById('durationField');
const categoryField = document.getElementById('categoryField');
const priorityField = document.getElementById('priorityField');
const generateTableBtn = document.getElementById('generateTableBtn');
const dataTable = document.getElementById('dataTable');
const dataRows = document.getElementById('dataRows');

//modal elements
const editModal = document.getElementById('editModal');
const saveChangesBtn = document.getElementById('saveChangesBtn');

//Table stuff
let editingRowData = null; //Row being edited by the modal right now
let highlightedRow = null; //Row that is selected by pressing select button

const categories = [];
const savedData = [];

// Send an AJAX request to Flask to get the task data
fetch('/get_tasks')
    .then(response => response.json())
    .then(data => {
        // Process the data
        data.forEach(task => {
            const rowData = {
                taskName: task.task_name,
                duration: task.duration_minutes,
                category: task.category,
                priority: task.priority
            };
            //generate a row for each task
            generateRow(rowData);
            //and push it to the local saved data
            savedData.push(rowData);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

// Send an AJAX request to Flask to get the unique categories
fetch('/get_unique_categories')
    .then(response => response.json())
    .then(data => {
        const categorySelects = document.querySelectorAll('select[data-field="category"]');
        data.forEach(category => {
            categorySelects.forEach(select => { addOptionToDropdown(select, category); });
            categories.push(category);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

taskForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const formData = new FormData(form);

    fetch('/add_task', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Task added:', data);
            // Optionally, update the UI here (e.g., show a success message)
        })
        .catch(error => {
            console.error('Error adding task:', error);
            // Optionally, handle error scenario here
        });
});

//Filter all elements by selectorvalue
document.getElementById('categoryFilter').addEventListener('change', function () {
    dataRows.querySelectorAll('tr').forEach(row => {
        if (row.querySelector('[data-field="category"]').textContent === categoryFilter.value) {
            row.style.display = ''; // Show the row
        } else {
            row.style.display = 'none'; // Hide the row
        }
    });
});



saveChangesBtn.addEventListener('click', () => {
    if (editingRowData) {
        data = getSavedDataFromRow(editingRowData);

        data['taskName'] = document.getElementById('editinput1').value;
        data['duration'] = document.getElementById('editinput2').value;
        data['category'] = document.getElementById('editdropdown1').value;
        data['priority'] = document.getElementById('editdropdown2').value;

        const tdElements = editingRowData.querySelectorAll('td.editable-field');

        tdElements.forEach(td => {
            const dataField = td.getAttribute('data-field');
            td.textContent = data[dataField];
        });
    }
});

function addOptionToDropdown(dropdown, value) {
    // Create and append a new <option> element
    const newOption = document.createElement('option');
    newOption.value = value;
    newOption.textContent = value;
    dropdown.appendChild(newOption);
}

function validateValues() {
    const inputValue1 = taskNameField.value;
    const inputValue2 = durationField.value;
    const dropdownValue1 = categoryField.value;
    const dropdownValue2 = priorityField.value;

    // Check if any values are the same
    if (inputValue1 === inputValue2 || dropdownValue1 === dropdownValue2) {
        errorMessage.textContent = 'Please ensure that none of the values are the same.';
        return false;
    }

    errorMessage.textContent = ''; // Clear error message
    return true;
}

function generateRow(taskData) {
    const templateRow = document.getElementById('taskRowTemplate');
    console.log(templateRow);
    const newRow = templateRow.cloneNode(true);

    newRow.querySelector('[data-field="taskName"]').textContent = taskData.taskName;
    newRow.querySelector('[data-field="duration"]').textContent = taskData.duration;
    newRow.querySelector('[data-field="category"]').textContent = taskData.category;
    newRow.querySelector('[data-field="priority"]').textContent = taskData.priority;

    // checkboxInput.id = 'doneField';

    newRow.querySelector('#removeBtn').addEventListener('click', () => removeTableRow(newRow, taskData)); // Pass rowData to the function

    newRow.querySelector('#selectBtn').addEventListener('click', () => {
        if (highlightedRow) {
            highlightedRow.classList.remove('table-primary'); // Remove class from the previous row
        }
        newRow.classList.add('table-primary');
        highlightedRow = newRow;
    });

    newRow.querySelector('#editBtn').addEventListener('click', () => openEditModal(newRow));

    // Append the new row to the table body
    dataRows.appendChild(newRow);

    // Display the table
    dataTable.style.display = 'table';
    return newRow;
}

function generateTable() {
    if (!validateValues()) {
        return; // Abort table generation if validation fails
    }

    const taskData = {
        taskName: taskNameField.value,
        duration: durationField.value,
        category: categoryField.value,
        priority: priorityField.value
    };

    savedData.push(taskData);
    generateRow(taskData);

}

function removeTableRow(row, taskData) {
    // Remove the row from the HTML table
    row.remove();

    // Find the index of the rowData in the savedData array and remove it
    const indexToRemove = savedData.findIndex(data => data === taskData);
    if (indexToRemove !== -1) {
        savedData.splice(indexToRemove, 1);
    }
}

function openEditModal(rowData) {
    editingRowData = rowData;
    console.log(rowData);
    data = getSavedDataFromRow(rowData);

    // Populate modal inputs with selected row data
    document.getElementById('editinput1').value = data['taskName'];
    document.getElementById('editinput2').value = data['duration'];
    document.getElementById('editdropdown1').value = data['category'];
    document.getElementById('editdropdown2').value = data['priority'];
}

function getSavedDataFromRow(row) {
    const rowIndex = Array.from(row.parentNode.children).indexOf(row);
    return savedData[rowIndex];
}

