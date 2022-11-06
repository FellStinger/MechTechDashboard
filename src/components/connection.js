let address = document.getElementById('connect-address'),
    connect = document.getElementById('connect'),
    buttonConnect = document.getElementById('connect-button');

let loginShown = true;

NetworkTables.addRobotConnectionListener(onRobotConnection, false);

// Hides the connect box
onkeydown = ev => {
    if (ev.key === 'Escape') {
        document.body.classList.toggle('login', false);
        loginShown = false;
    }
};

buttonConnect.onclick = () => {
    document.body.classList.toggle('login', true);
    loginShown = true;

    setLogin();
};

/**
 * Runs when the robot is connected
 * 
 * @param {boolean} connected 
 */
function onRobotConnection(connected) {
    var state = connected ? 'Robot connected!' : 'Robot disconnected.';
    console.log(state);
    ui.robotState.textContent = state;

    if (connected) {
        document.body.classList.toggle('login', false);
        loginShown = false;
    } else if (loginShown) {
        setLogin();
    }
}

/**
 * Sets the login
 */
function setLogin() {
    address.disabled = connect.disabled = false;
    connect.textContent = 'Connect';

    // Set the default value for address (422 since guess which team we're on!)
    address.value = 'roborio-422-frc.local';
    address.focus();
    address.setSelectionRange(8, 11);
}

// On click: try to connect and disable the text field + button
connect.onclick = () => {
    window.api.sendConnect(address.value);
    address.disabled = connect.disabled = true;
    connect.textContent = 'Connecting...';
};

address.onkeydown = ev => {
    if (ev.key === 'Enter') {
        connect.click();
        ev.preventDefault();
        ev.stopPropagation();
    }
};

// Show login initially
document.body.classList.toggle('login', true);
setLogin();