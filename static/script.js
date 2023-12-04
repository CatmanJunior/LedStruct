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

function formatTime(minutes, seconds) {
    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = seconds.toString().padStart(2, "0");
    return `${paddedMinutes}:${paddedSeconds}`;
}

function parseTime(formattedTime) {
    const [minutes, seconds] = formattedTime.split(":").map(Number);
    return { minutes, seconds };
}

async function fetchData() {
    try {
        const response = await fetch('/get_tasks');
        const data = await response.json();

        console.log(data);
        data.forEach(task => {
            const taskData = {
                id: task.id,
                taskName: task.task_name,
                duration: task.duration_minutes,
                category: task.category,
                priority: task.priority,
                taskDone: task.task_done,
                startTime: new Date().getTime(),
                timeWorked: "00:00",
                timerInterval: null
            };

            generateRow(taskData);
            savedData.push(taskData);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}


fetchData();


async function fetchUniqueCategories() {
    try {
        const response = await fetch('/get_unique_categories');
        const data = await response.json();
        const categorySelects = document.querySelectorAll('select[data-field="category"]');
        data.forEach(category => {
            categorySelects.forEach(select => { addOptionToDropdown(select, category); });
            categories.push(category);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchUniqueCategories();

taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(taskForm);

    try {
        const response = await fetch('/add_task', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        // Get the snackbar element
        const toast = document.getElementById('toast');

        // Add a class to the snackbar to show it
        toast.setAttribute('display', 'block');

        // Remove the class after 3 seconds
        setTimeout(() => {
            toast.setAttribute('display', 'none');
        }, 3000);
    } catch (error) {
        console.error('Error adding task:', error);

    }
});

//Filter all elements by selectorvalue
document.getElementById('categoryFilter').addEventListener('change', function () {
    dataRows.querySelectorAll('tr').forEach(row => {
        dataField = row.querySelector('[data-field="category"]')
        if (dataField.textContent === categoryFilter.value) {
            row.style.display = ''; // Show the row
        } else if (categoryFilter.value === 'all') {
            row.style.display = ''; // Hide the row
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
        updateTask(data['id'], data);
        tdElements.forEach(td => {
            const dataField = td.getAttribute('data-field');
            td.textContent = data[dataField];
        });
    }
});

const saveCategoryBtn = document.getElementById('saveCategoryBtn');
saveCategoryBtn.addEventListener('click', function () {
    // Get the category name input value
    const categoryName = document.getElementById('categoryName').value;

    addOptionToDropdown(categoryField, categoryName);

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
function removeTask(taskId) {
    fetch(`/remove_task/${taskId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                // Task was successfully removed
                console.log('Task removed successfully');
                // You can update the UI or take other actions as needed
            } else {
                // Task removal failed (e.g., task not found)
                console.error('Failed to remove task');
                // Handle the error or display an error message
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle the network error
        });
}

function toggleTaskStatus(taskId, taskStatus) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskStatus }),
    };

    fetch(`/toggle_task/${taskId}`, requestOptions)
        .then(response => {
            if (response.ok) {
                console.log('Task status updated successfully');
            } else {
                return response.json().then(data => {
                    throw new Error(data.error);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
}

function updateTask(taskId, updatedData) {
    fetch(`/update_task/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
        .then(response => {
            if (response.ok) {
                console.log('Task updated successfully');
                // Handle success as needed (e.g., update UI)
            } else {
                console.error('Failed to update task');
                // Handle errors (e.g., display an error message)
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle network errors
        });
}

function updateTimer(timerField, startTime, taskData) {
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000); // in seconds
    let min = Math.floor(elapsedTime / 60);
    let sec = elapsedTime % 60;
    let { minutes, seconds } = parseTime(taskData.timeWorked);
    minutes += min;
    seconds += sec;
    const formattedTime = formatTime(minutes, seconds);

    // Update the timer display
    timerField.textContent = formattedTime;
}
function generateRow(taskData) {
    const templateRow = document.getElementById('taskRowTemplate');
    const newRow = templateRow.cloneNode(true);

    populateRowData(newRow, taskData);
    attachEventListeners(newRow, taskData);

    dataRows.appendChild(newRow);
    dataTable.style.display = 'table';
    return newRow;
}

function populateRowData(newRow, taskData) {
    const rowsToPopulate = ['taskName', 'duration', 'category', 'priority'];
    Object.keys(taskData).forEach(key => {
        if (rowsToPopulate.includes(key)) {
            newRow.querySelector(`[data-field="${key}"]`).textContent = taskData[key];
        }
    });

    const checkbox = newRow.querySelector('#doneField');
    checkbox.checked = taskData.taskDone;
    newRow.setAttribute('task-id', taskData.id);
}

function attachEventListeners(newRow, taskData) {
    newRow.querySelector('#doneField').addEventListener('change', () => toggleTaskStatus(taskData.id, EventTarget.checked));
    newRow.querySelector('#removeBtn').addEventListener('click', () => removeTaskRow(newRow, taskData));
    newRow.querySelector('#playBtn').addEventListener('click', () => startTaskTimer(newRow, taskData));
    newRow.querySelector('#selectBtn').addEventListener('click', () => highlightTaskRow(newRow));
    newRow.querySelector('#editBtn').addEventListener('click', () => openEditModal(newRow));
}

function removeTaskRow(newRow, taskData) {
    removeTableRow(newRow, taskData);
    removeTask(newRow.getAttribute('task-id'));
}


function startTaskTimer(newRow, taskData) {
    const startTime = new Date().getTime();
    taskData.startTime = startTime;
    if (taskData.timerInterval) {
        clearInterval(taskData.timerInterval);
        taskData.timeWorked = newRow.querySelector(`[data-field="timeWorked"]`).textContent;
        taskData.timerInterval = null;
    } else {
        const timerInterval = setInterval(() => {
            updateTimer(newRow.querySelector(`[data-field="timeWorked"]`), startTime, taskData);
        }, 1000);
        taskData.timerInterval = timerInterval;
    }
}

function highlightTaskRow(newRow) {
    if (highlightedRow) {
        highlightedRow.classList.remove('table-primary');
    }
    newRow.classList.add('table-primary');
    highlightedRow = newRow;
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
    const editingRowData = rowData;
    const taskData = getSavedDataFromRow(editingRowData);

    // Populate modal inputs with selected row data
    populateModalInputs(taskData);
}

function populateModalInputs(data) {
    document.getElementById('editFinishedCheckbox').checked = data['taskDone'];
    document.getElementById('editinput1').value = data['taskName'];
    document.getElementById('editinput2').value = data['duration'];
    document.getElementById('editdropdown1').value = data['category'];
    document.getElementById('editdropdown2').value = data['priority'];
}


function getSavedDataFromRow(row) {
    const rowIndex = Array.from(row.parentNode.children).indexOf(row);
    return savedData[rowIndex];
}

