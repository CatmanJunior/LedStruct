const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const serialDataConsole = document.getElementById('consoleOutput');
const sendBtn = document.getElementById('sendBtn');
const byteValueSelect = document.getElementById('byteValue');

let reader;
let port = null;
let lastDataIndex = 0; // Keep track of the last index of data received

connectBtn.addEventListener('click', connectToArduino);
disconnectBtn.addEventListener('click', disconnectSerial);
sendBtn.addEventListener('click', sendDataToSerial);

function updateConsole(value) {
    const currentTime = new Date().toLocaleTimeString(); // Get current time
    serialDataConsole.value += `[${currentTime}] ${value} \n`;
    serialDataConsole.scrollTop = serialDataConsole.scrollHeight;
}

async function connectToArduino() {
    try {
        updateConsole('Connecting...');
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 }); // Adjust baudRate as needed
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        sendBtn.disabled = false;
        generateTableBtn.disabled = false;
        updateConsole('Connected to Arduino');
        reader = port.readable.getReader();

        setInterval(readStream, 1000);
    } catch (error) {
        console.error('Error:', error);
        updateConsole(`Connection failed. - ${error}`);
    }
}

async function readStream() {
    while (true) {
        const { value, done } = await reader.read();
        const decodedData = new TextDecoder().decode(value);
        //Filters the data to only show visable characters
        const filteredData = decodedData
            .split('')
            .filter(char => char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126)
            .join('');
        if (filteredData) {
            updateConsole(`<-${filteredData}`);
        }
        if (done) {
            break;
        }
    }
}

async function sendDataToSerial() {
    try {
        const writer = port.writable.getWriter();
        const selectedValue = byteValueSelect.value;
        const dataToSend = String.fromCharCode(selectedValue);
        await writer.write(new TextEncoder().encode(dataToSend));
        writer.releaseLock();

        updateConsole(`>- 0x${selectedValue.toString(16).toUpperCase()}`);
    } catch (error) {
        console.error('Error:', error);
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
    } catch (error) {
        console.error('Error:', error);
    }
}

function decodeAscii(data) {
    return data.split(',').map(value => String.fromCharCode(parseInt(value))).join('');
}