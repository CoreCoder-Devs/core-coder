const Electron = require('electron');

Electron.app.whenReady().then(()=>{
    var win = new Electron.BrowserWindow({
        title: "CoreCoder by Hanprogramer",
        webPreferences : {nodeIntegration: true, webviewTag: true, allowRunningInsecureContent: true, nodeIntegrationInSubFrames: true, enableRemoteModule:true},
        icon: __dirname + "/src/resources/icon.ico"
    });
    win.loadFile("src\\project_manager.html");
});