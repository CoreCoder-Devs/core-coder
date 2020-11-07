const Electron = require('electron');


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
});