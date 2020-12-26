const Electron = require('electron');
const unhandled = require('electron-unhandled')
const rpc = require('./src/util/DiscordRPC')
const startTimestamp = new Date()

Electron.app.whenReady().then(()=>{
  var win = new Electron.BrowserWindow({
    width: 800,
    height: 600,
    title: "CoreCoder",
    webPreferences : {nodeIntegration: true, webviewTag: true, allowRunningInsecureContent: true, nodeIntegrationInSubFrames: true, enableRemoteModule:true},
    icon: __dirname + "/src/resources/icon.ico",
    minWidth: 700,
    minHeight: 400,
    frame: false,
    nodeIntegration: true
  });
  win.loadFile("src\\home.html");
  console.log(Electron.app.getPath('home'));
  rpc.setActivity({
    details: 'Using core coder',
    startTimestamp,
    largeImageKey: 'icon',
  })
});

Electron.ipcMain.on('discord-activity-change', (event, arg) => {
  rpc.setActivity(Object.assign({startTimestamp, largeImageKey: 'icon'}, arg))
  console.log('[RPC]Changing activity:')
  console.log(Object.assign({startTimestamp, largeImageKey: 'icon'}, arg))
})

unhandled({ 
  logger: () => { 
    console.error();
  }
}); 