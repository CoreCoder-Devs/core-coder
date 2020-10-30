const { app, BrowserWindow, Menu } = require("electron");
const os = require("os");
const crypto = require('crypto');
const fs = require("fs");
const { machine, machineSync } = require('node-unique-machine-id');
function createWindow(){
    const win = new BrowserWindow({
        width : 960,
        height : 512,
        frame: false,
        icon: "resources/icon.ico",
        //autoHideMenuBar: true,
        webPreferences : {
            nodeIntegration : true,
            enableRemoteModule: true
            // allowRunningInsecureContent: true,
            // javascript: true,
            // experimentalFeatures: true
        }
    });

    // Show dev tools
    // win.toggleDevTools();
    const id = getASklsfnaklnlqjw();
    var path = "C:\\CoreCoder\\" + "lajniuhwqwrhq" + "wrhsldkfjnaew";
    var content = "";
    if(!fs.existsSync("C:\\CoreCoder\\"))
        fs.mkdirSync("C:\\CoreCoder\\");
        
    if(fs.existsSync(path)) {
        content = fs.readFileSync(path);
        if(content == id){
            // Login info accepted
            win.loadFile("project_manager.html");
        }else{
            win.loadFile("index.html");
        }
    } else {
        win.loadFile("index.html");
    }

    // Menu.setApplicationMenu(null);
    //win.loadURL("https://mcpecore.com/")
}

app.on('browser-window-created',function(e,window) {
    window.setMenu(null);
});
app.whenReady().then(createWindow);

function getASklsfnaklnlqjw(){
    var id = String(machineSync(true));
    var c = String(JSON.stringify(os.userInfo())) + id;
    var mykey = crypto.createCipher('aes-128-cbc', c);
    var mystr = mykey.update(c, 'utf8', 'hex')
    mystr += mykey.final('hex');
    return mystr;
}