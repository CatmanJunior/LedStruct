const connectBtn = document.getElementById('connectBtn');

async function connectToUSB() {
    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });  // Adjust baudRate as needed
        
        // Use port for communication, e.g., port.write(), port.read(), etc.

        port.addEventListener('disconnect', () => {
            console.log('USB disconnected.');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

connectBtn.addEventListener('click', connectToUSB);