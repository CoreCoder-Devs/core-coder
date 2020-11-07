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
        document.documentElement.style.setProperty('--' + key, GlobalSettings["theme"][key]);
    });
}
const white = rgb(255,255,255);
var GlobalSettings = {
    // General
    fullscreen : false,
    
    // Themes
    ace_theme : "merbivore",
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
    },
    lang: "en",
    langCaption: "English"
}

const Languages = [
    "en",
    "cn"
];

const DefaultGlobalSettings = Object.assign({}, GlobalSettings);

var settingsPath = "C:\\CoreCoder\\settings.json";
function saveSettings(){
    _fs.writeFileSync(settingsPath, JSON.stringify(GlobalSettings, null, '\t'));
}
function loadSettings(){
    var result = GlobalSettings;
    if(_fs.existsSync(settingsPath)){
        try{
            result = JSON.parse(_fs.readFileSync(settingsPath));
        }catch(e){
            console.log(e);
        }
    }else{
        saveSettings();
    }
    
    GlobalSettings = Object.assign(GlobalSettings,result);
    initGlobalTheme();
    translateDocument()
}

loadSettings();

function translateDocument() {
    const translatedElements = document.querySelectorAll("[data-translation]");
    for(const element of translatedElements) {
        if(!translations[element.attributes["data-translation"].nodeValue]) return
        element.innerText = translations[element.attributes["data-translation"].nodeValue]
    }
}
