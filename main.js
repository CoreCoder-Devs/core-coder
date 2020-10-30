const Electron = require('electron');
// nw.Window.open('src/project_manager.html', {}, function(win) {});
// //nw.Window.open('src/content/tabs-demo.html', {}, function(win) {});


Electron.app.whenReady().then(()=>{
    var win = new Electron.BrowserWindow({
        title: "CoreCoder by Hanprogramer",
        webPreferences : {nodeIntegration: true, webviewTag: true, allowRunningInsecureContent: true, nodeIntegrationInSubFrames: true, enableRemoteModule:true},
        icon: __dirname + "/src/resources/icon.ico"
    });
    win.loadFile("src\\project_manager.html");
});