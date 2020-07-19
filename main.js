// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain
} = require('electron');
const path = require('path');
const fs = require('fs');
const { vett } = require('./vett');
let mainWindow;
let currentpath;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

ipcMain.on("openFile", function (event) {
  console.log("Opening but in main");
  dialog.showOpenDialog({
    title: "Select 'NBT to Text' export folder",
    properties: ['openDirectory']
  }).then((files) => {
    console.log(files.filePaths);
    if (files === undefined || files.canceled || files.filePaths == undefined) {
      console.log("No file selected");
      return;
    }
    fs.readFile(path.join(files.filePaths[0], 'level_dat.txt'), 'utf-8', (err, data) => {
      if (err) {
        event.sender.send('error', "Whoops! Make sure you are using a folder exported from MCCToolchest PE");
        return;
      }
      currentpath = files.filePaths[0];
      var json;
      try {
        json = JSON.parse(data);
      } catch (e) {
        event.sender.send('error', "Bad level_dat.txt. Try re-exporting your world");
      }
      var pull = {name: json['val']['LevelName']['val'], experimental: json['val']['experimentalgameplay']['val']==1, edu: json['val']['educationFeaturesEnabled']['val']==1};
      // Change how to handle the file content
      event.sender.send('leveldat', pull);
    });
  }).catch(function() {
    event.sender.send('error', "Something went wrong");
  });
});
ipcMain.on("vett", function (event) {
  var out = vett(currentpath);
  console.log(out);
  event.sender.send('newData', out);
});
ipcMain.on("getHelp", function (event) {
  fs.readFile(path.join(__dirname, 'help.html'), 'utf-8', (err, data) => {
    event.sender.send('gotHelp', data);
  });
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.