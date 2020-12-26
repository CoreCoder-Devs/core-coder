// Global settings which will be used in all files
const os = require('os')
const _fs = require("fs");

module.exports = {
    settings: new class settings {
        constructor() {
            /**
             * The path of the app's folder for data storage
             */
            switch (os.platform()) {
                case 'win32':
                    this.appFolder = path.join(
                        process.env['LOCALAPPDATA'],
                        'CoreCoder'
                    )
                    break
                case 'linux':
                    this.appFolder = path.join(os.homedir(), '.local/share/CoreCoders')
                    break
                case 'darwin':
                    this.appFolder = path.join(
                        os.homedir(),
                        'Library/Application Support/CoreCoder'
                    )
                    break
                case 'android':
                    this.appFolder = path.join(os.homedir(), 'storage/shared/CoreCoder')
                    break
                default:
                    this.appFolder = '~/CoreCoder'
            }
            /**
             * The path of settings.json
             */
            this.settingsPath = this.appFolder + "/settings.json";
            /**
             * This is default uierhgpiuoagoiaer
             */
            const defaultSettings = {
                // General
                fullscreen : false,
                
                // Themes
                ace_theme : "merbivore",
                theme:{
                    var_backgroundColor : this.rgb(29, 29, 29),
                    var_backgroundColorDarker : this.rgb(19, 19, 19),
                    var_backgroundColorLighter : this.rgb(39, 39, 39),
                    
                    var_textColor: this.rgb(255,255,255),
                    var_textColorDarker : this.rgb(175, 175, 175),
                    
                    var_colorAccent : this.rgb(0, 158, 124),
                    var_colorAccentDarker : this.rgb(5, 126, 110),
                    var_colorAccentLighter : this.rgb(10, 185, 147),
                    var_sidebarColor : this.rgb(24, 24, 24),
                    var_iconColor: this.rgb(164, 164, 164),
                    var_iconColorActive: this.rgb(255, 255, 255)
                },
                lang: "en",
                
                searchEngine: "https://google.com/search?q=%s",
                searchEngineName: "Google"
            }
            let result = defaultSettings;
            if(_fs.existsSync(this.settingsPath)){
                try{
                    result = JSON.parse(_fs.readFileSync(this.settingsPath));
                }catch(e){
                    console.log(e);
                }
            }else{
                this.saveSettings();
            }
            /**
             * Settings
             */
            this.GlobalSettings = Object.assign(defaultSettings,result);
            this.initGlobalTheme();
            this.translations = require(`./content/texts/${this.lang}.json`)
            this.localizeInterface()
        }
        /**
         * Saves the current settings into the settings file
         */
        saveSettings(){
            if(!_fs.existsSync(this.appFolder)){
                _fs.mkdirSync(this.appFolder, {recursive: true});
            }
            _fs.writeFileSync(this.settingsPath, JSON.stringify(this.GlobalSettings, null, '\t'));
        }
        /**
         * Loads/reloads theme from settings
         */
        initGlobalTheme(){
            Object.keys(this.GlobalSettings["theme"]).forEach(key => {
                document.documentElement.style.setProperty('--' + key, this.GlobalSettings["theme"][key]);
            });
        }
        /**
         * Localizes the current page to the language defined in settings. The element needs to have a data-translation attribute
         * set to the translation identifier.
         */
        localizeInterface() {
            const translatedElements = document.querySelectorAll("[data-translation]");
            for(const element of translatedElements) {
                try{
                    if(!this.translations[element.attributes["data-translation"].nodeValue]) return
                    element.innerText = this.translations[element.attributes["data-translation"].nodeValue]
                }catch(e){
                    console.log(e);
                }
            }
        }
        /**
         * Returns a hex colour code.
         * @param {Int} r - Value of red from 0 to 255
         * @param {Int} g - Value of green from 0 to 255
         * @param {Int} b - Value of blue from 0 to 255
         */
        rgb(r, g, b) {
            return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        }
        /**
         * I dont know
         * @param {*} c 
         */
        componentToHex(c) {
            const hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        /**
         * Returns the area code of the language set by the user
         */
        get lang() {
            return this.GlobalSettings.lang
        }
    },
}