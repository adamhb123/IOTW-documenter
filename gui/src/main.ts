import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

const _WINDOW_DIMENSIONS = {width: 800, height: 690};

function createWindow() : void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: _WINDOW_DIMENSIONS.width,
    height: _WINDOW_DIMENSIONS.height,
    title: "IOTW Documenter",
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "../../../dist/gui/src/preload.js")
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../../../src/index.html"));
}

// Event handler for asynchronous incoming messages
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg);
  // Event emitter for sending asynchronous messages
  event.sender.send('asynchronous-reply', 'async pong')
});


app.on("ready", () => {
  createWindow();
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Setup hot-reloading
try {
  require('electron-reloader')(module)
} catch (_) {}
