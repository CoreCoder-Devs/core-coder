const Electron = require('electron');
const { app, autoUpdater, dialog } = require('electron');

const RPC = require('discord-rpc')
 
const client = new RPC.Client({ transport: 'ipc' });

client.on('ready', () => {
  const startTimestamp = new Date();
    client.setActivity({
    details: `Making an Add-on`,
    startTimestamp,
    largeImageKey: 'icon',
  });
});

// Log in to RPC with client id
client.login({clientId: '774605779952468022'}).catch(e=> {
  console.log(e)
})

// Checks for update
require('update-electron-app')({
    repo: 'CoreCoder-Devs/CoreCoder-One',
    updateInterval: '1 hour'
  })


Electron.app.whenReady().then(()=>{
    var win = new Electron.BrowserWindow({
        width: 1000,
        height: 750,
        title: "CoreCoder by Hanprogramer",
        webPreferences : {nodeIntegration: true, webviewTag: true, allowRunningInsecureContent: true, nodeIntegrationInSubFrames: true, enableRemoteModule:true},
        icon: __dirname + "/src/resources/icon.ico",
        minWidth: 700,
        minHeight: 400,
    });
    win.setMenuBarVisibility(false)
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

