
const customTitlebar = require('custom-electron-titlebar');
let isElectron = require("is-electron");

if(isElectron()){
    // console.log("Electron aww yeahhh !");
    new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#0d0d0d'),
        icon: "resources/icon.png"
    });
}else{
    // console.log("Running in other platform as a normal browser");
}