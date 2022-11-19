'use strict';
Object.defineProperty(exports, '__esModule', { value: true });

const path = require('path');
const electron = require('electron');
const wpilib_NT = require('wpilib-nt-client');
const client = new wpilib_NT.Client();

// If disconnected, the client will reconnect after 1000 ms (1 second)
client.setReconnectDelay(1000);

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;

/**
 * Main window of the Dashboard
 * @type {Electron.BrowserWindow}
 */
let mainWindow;

let connectedFunc,
    ready = false;

let clientDataListener = (key, val, valType, msgType, id, flags) => {
    if (val === 'true' || val === 'false') {
        val = val === 'true';
    }
    mainWindow.webContents.send(msgType, {
        key,
        val,
        valType,
        msgType,
        id,
        flags
    });
};

function createWindow() {
    // Tries to start client and connect to localhost
    client.start((con, err) => {
        let connectFunc = () => {
            console.log('Sending status');
            mainWindow.webContents.send('connected', con);
        };

        // If the window is ready, send the connection status
        if (ready) {
            connectFunc();
        }
        connectedFunc = connectFunc;
    });

    // On ready: set the ready variable when the script starts running in the window
    ipc.on('ready', (ev, msg) => {
        console.log('NetworkTables is ready');
        ready = mainWindow != null;

        // Removes the old listener
        client.removeListener(clientDataListener);

        // Creates a new listener with immediate callback
        client.addListener(clientDataListener, true);

        // Send connection message if it is ready
        if (connectedFunc) connectedFunc();
    });

    // On connect: when the user tries to connect to the bot
    ipc.on('connect', (ev, address, port) => {
        console.log(`Trying to connect to ${address}` + (port ? ':' + port : ':'));
        let callback = (con, err) => {
            console.log('Sending status');
            mainWindow.webContents.send('connected', con);
        };
        if (port) {
            client.start(callback, address, port);
        } else {
            client.start(callback, address);
        }
    });

    ipc.on('add', (ev, msg) => {
        client.Assign(msg.val, msg.key, (msg.flags & 1) === 1);
    });

    ipc.on('update', (ev, msg) => {
        client.Update(msg.id, msg.val);
    });

    ipc.on('windowError', (ev, err) => {
        console.log(err);
    });

    // Create the browser window and set it up to show
    mainWindow = new BrowserWindow({
        width: 1366,
        height: 570,
        // The window is closed until the python server is ready
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });
    mainWindow.setPosition(0, 0);
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.once('ready-to-show', () => {
        console.log('Main windows is ready to be shown');
        mainWindow.maximize();
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        console.log('Main window is closed');

        mainWindow = null;
        ready = false;
        connectedFunc = null;
        client.removeListener(clientDataListener);
    });

    mainWindow.on('unresponsive', () => {
        console.log('Main window is unresponsive');
    });

    mainWindow.webContents.on('did-fail-load', () => {
        console.log('Window failed to load');
    });
}

// On ready: create the window
app.on('ready', () => {
    console.log('App is ready');
    createWindow();
});

// Quit when the windows are all closed
app.on('window-all-closed', function () {
    app.quit();
});

app.on('quit', function () {
    console.log('Application has been quit');
});

app.on('activate', function () {
    if (mainWindow == null) createWindow();
});