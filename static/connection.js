let reader;
let port = null;

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
