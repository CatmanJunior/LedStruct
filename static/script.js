const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const sendBtn = document.getElementById('sendBtn');
const byteValueSelect = document.getElementById('byteValue');
const input1 = document.getElementById('input1');
const input2 = document.getElementById('input2');
const dropdown1 = document.getElementById('dropdown1');
const dropdown2 = document.getElementById('dropdown2');
const generateTableBtn = document.getElementById('generateTableBtn');
const dataTable = document.getElementById('dataTable');
const statusMessage = document.getElementById('statusMessage');
const byteValueDisplay = document.getElementById('byteValueDisplay');
const serialDataDisplay = document.getElementById('serialDataDisplay');
const dataRows = document.getElementById('dataRows');

let reader;

let port = null;
// let dataRows = [];
const savedData = [];

let highlightedRow = null;

function decodeAscii(data) {
    return data.split(',').map(value => String.fromCharCode(parseInt(value))).join('');
}

async function connectToArduino() {
    try {
        statusMessage.textContent = 'Connecting...';
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });  // Adjust baudRate as needed
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        sendBtn.disabled = false;
        generateTableBtn.disabled = false;
        statusMessage.textContent = 'Connected to Arduino';

        reader = port.readable.getReader();
        const textDecoder = new TextDecoder(); // Create a TextDecoder instance

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }

            // Convert the Uint8Array to a string using the TextDecoder
            const decodedData = textDecoder.decode(value);

            serialDataDisplay.textContent = `Received: ${decodedData}`;
        }
    } catch (error) {
        console.error('Error:', error);
        statusMessage.textContent = 'Connection failed';
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 3000);  // Clear the status message after 3 seconds
    }
}

async function sendDataToArduino() {
    try {
        const writer = port.writable.getWriter();
        const selectedValue = byteValueSelect.value;
        const dataToSend = String.fromCharCode(selectedValue);
        await writer.write(new TextEncoder().encode(dataToSend));
        writer.releaseLock();

        byteValueDisplay.textContent = `Sent Byte: 0x${selectedValue.toString(16).toUpperCase()}`;
    } catch (error) {
        console.error('Error:', error);
    }
}

function validateValues() {
    const inputValue1 = input1.value;
    const inputValue2 = input2.value;
    const dropdownValue1 = dropdown1.value;
    const dropdownValue2 = dropdown2.value;

    // Check if any values are the same
    if (inputValue1 === inputValue2 || dropdownValue1 === dropdownValue2) {
        errorMessage.textContent = 'Please ensure that none of the values are the same.';
        return false;
    }

    errorMessage.textContent = ''; // Clear error message
    return true;
}

function generateTable() {
    if (!validateValues()) {
        return; // Abort table generation if validation fails
    }

    const rowData = {
        input1: input1.value,
        input2: input2.value,
        dropdown1: dropdown1.value,
        dropdown2: dropdown2.value
    };

    savedData.push(rowData);

    // Create a new table row
    const newRow = document.createElement('tr');

    // Create cells for each value
    const inputCell1 = document.createElement('td');
    const inputField1 = document.createElement('input');
    inputField1.value = rowData.input1;
    inputField1.classList.add('editable-field');
    inputField1.setAttribute('readonly', true);
    inputCell1.appendChild(inputField1);
    newRow.appendChild(inputCell1);
    
    const inputCell2 = document.createElement('td');
    inputCell2.textContent = rowData.input2;
    inputCell2.classList.add('.editable-field');
    newRow.appendChild(inputCell2);

    const dropdownCell1 = document.createElement('td');
    dropdownCell1.textContent = rowData.dropdown1;
    newRow.appendChild(dropdownCell1);

    const dropdownCell2 = document.createElement('td');
    dropdownCell2.textContent = rowData.dropdown2;
    newRow.appendChild(dropdownCell2);

    // Create a cell for the remove button
    const removeBtnCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeTableRow(newRow, rowData)); // Pass rowData to the function
    removeButton.classList.add('btn')
    removeButton.classList.add('btn-danger');
    removeBtnCell.appendChild(removeButton);
    newRow.appendChild(removeBtnCell);
    // Create a cell for the select button
    const selectBtnCell = document.createElement('td');
    const selectButton = document.createElement('button');
    selectButton.classList.add('btn');
    selectButton.classList.add('btn-primary');

    selectButton.textContent = 'Select';
    selectButton.addEventListener('click', () => {
        if (highlightedRow) {
            highlightedRow.classList.remove('table-primary'); // Remove class from the previous row
        }
        newRow.classList.add('table-primary');
        highlightedRow = newRow;
    });
    selectBtnCell.appendChild(selectButton);
    newRow.appendChild(selectBtnCell);

    // Create a cell for the "Edit" button
    const editButtonCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.classList.add('editButton');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
        toggleEditableState(newRow);
    });
    editButtonCell.appendChild(editButton);
    newRow.appendChild(editButtonCell);


    // Append the new row to the table body
    dataRows.appendChild(newRow);

    // Display the table
    dataTable.style.display = 'table';
}

function toggleEditableState(row) {
    const textFields = row.querySelectorAll('.editable-field');
    const editButton = row.querySelector('.editButton');

    textFields.forEach(field => {
        if (field.tagName === 'INPUT') {
            if (editButton.textContent === 'Edit') {
                field.value = field.getAttribute('data-value');
                field.removeAttribute('readonly');
            } else {
                field.setAttribute('data-value', field.value);
                field.setAttribute('readonly', true);
            }
        } else if (field.tagName === 'SELECT') {
            if (editButton.textContent === 'Edit') {
                field.disabled = false;
            } else {
                field.disabled = true;
            }
        }
    });

    editButton.textContent = (editButton.textContent === 'Edit') ? 'Save' : 'Edit';
}

function removeTableRow(row, rowData) {
    // Remove the row from the HTML table
    row.remove();

    // Find the index of the rowData in the savedData array and remove it
    const indexToRemove = savedData.findIndex(data => data === rowData);
    if (indexToRemove !== -1) {
        savedData.splice(indexToRemove, 1);
    }

}


async function disconnectSerial() {
    try {
        if (reader) {
            reader.releaseLock(); // Release the reader lock
            reader = null; // Reset the reader variable
        }

        if (port) {
            await port.close(); // Close the serial port
            port = null; // Reset the port variable
        }

        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        sendBtn.disabled = true;
        // generateTableBtn.disabled = true;
        statusMessage.textContent = '';
        byteValueDisplay.textContent = '';
        serialDataDisplay.textContent = '';
        // dataTable.style.display = 'none';
        // dataRows.forEach(row => row.remove());
        // dataRows = [];
    } catch (error) {
        console.error('Error:', error);
    }
}

connectBtn.addEventListener('click', connectToArduino);
sendBtn.addEventListener('click', sendDataToArduino);
generateTableBtn.addEventListener('click', generateTable);
disconnectBtn.addEventListener('click', disconnectSerial);