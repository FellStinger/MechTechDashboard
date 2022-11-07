// Define the UI elements
let ui = {
    timer: document.getElementById('timer'),
    robotState: document.getElementById('robot-state').firstChild
}

NetworkTables.addKeyListener('/robot/time', (key, value) => {
    ui.timer.textContent = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
    // Add color stuff here
});