// Global settings which will be used in all files
const _fs = require("fs");

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgb(r, g, b) {
    // returns a hex string
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function initGlobalTheme(){
    // Inject the theme colors to the current css
    Object.keys(GlobalSettings["theme"]).forEach(key => {
        root.style.setProperty('--' + key, GlobalSettings["theme"][key]);
    });
}
const white = rgb(255,255,255);
GlobalSettings = {
    // General
    fullscreen : false,

    // Themes
    theme:{
        var_backgroundColor : rgb(29, 29, 29),
        var_backgroundColorDarker : rgb(19, 19, 19),
        var_backgroundColorLighter : rgb(39, 39, 39),

        var_textColor: white,
        var_textColorDarker : rgb(175, 175, 175),

        var_colorAccent : rgb(0, 158, 124),
        var_colorAccentDarker : rgb(5, 126, 110),
        var_colorAccentLighter : rgb(10, 185, 147),
        var_sidebarColor : rgb(24, 24, 24),
        var_iconColor: rgb(164, 164, 164),
        var_iconColorActive: rgb(255, 255, 255)
    }
}


var settingsPath = "C:\\CoreCoder\\settings.json";
function saveSettings(){
    _fs.writeFileSync(settingsPath, JSON.stringify(GlobalSettings));
}
function loadSettings(){
    var result = GlobalSettings;
    try{
        GlobalSettings = JSON.parse(_fs.readFileSync(settingsPath));
    }catch(e){
        console.log(e);
    }

    GlobalSettings = result;
}