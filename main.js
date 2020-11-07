const Electron = require('electron');
const { app, autoUpdater, dialog } = require('electron');


// Checks for update
require('update-electron-app')({
    repo: 'CoreCoder-Devs/CoreCoder-One',
    updateInterval: '1 hour'
  })

Electron.app.whenReady().then(()=>{
    var win = new Electron.BrowserWindow({
        title: "CoreCoder by Hanprogramer",
        webPreferences : {nodeIntegration: true, webviewTag: true, allowRunningInsecureContent: true, nodeIntegrationInSubFrames: true, enableRemoteModule:true},
        icon: __dirname + "/src/resources/icon.ico"
    });
    win.loadFile("src\\project_manager.html");
    // win.once('ready-to-show', () => {
    //     autoUpdater.checkForUpdatesAndNotify();
    // });
    // autoUpdater.on('update-available', () => {
    //     win.webContents.send('update_available');
    // });
    // autoUpdater.on('update-downloaded', () => {
    //     win.webContents.send('update_downloaded');
    // });
    
});
Electron.ipcMain.on('restart_app', () => {
    // autoUpdater.quitAndInstall();
  });
Electron.ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});
