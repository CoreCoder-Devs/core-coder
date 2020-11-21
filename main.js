const Electron = require('electron');

Electron.app.whenReady().then(()=>{
  var win = new Electron.BrowserWindow({
    width: 800,
    height: 600,
    title: "CoreCoder by CoreCoder Team",
    webPreferences : {nodeIntegration: true, webviewTag: true, allowRunningInsecureContent: true, nodeIntegrationInSubFrames: true, enableRemoteModule:true},
    icon: __dirname + "/src/resources/icon.ico",
    minWidth: 700,
    minHeight: 400,
    frame: false
  });
  win.loadFile("src\\project_manager.html");
  console.log(Electron.app.getPath('home'));
});

