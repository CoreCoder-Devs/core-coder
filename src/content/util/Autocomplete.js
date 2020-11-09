const AutoComplete = {
    autocomplete : function(){
        var staticWordCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                var use_format = session.format_version.startsWith("1.16.100")? "1.16.100" : "default";
                var autocomp = AutoComplete.AUTOCOMPLETE[use_format];
                var result = [];
                var content = session.getValue();
                var _pos = session.doc.positionToIndex(pos);
                var str = content.substring(0,_pos);
                var jsonpos = AutoComplete.getPosInJSON(str);
                
                var list = AutoComplete._getAutoComp(jsonpos,autocomp,0);
                var autocomp_list = [];
                if(list == undefined){autocomp_list = [];}
                else if(list == "int"){
                    autocomp_list = {
                        "0":"int",
                        "1":"int",
                        "3":"int",
                        "4":"int",
                        "5":"int",
                        "6":"int",
                        "7":"int",
                        "8":"int",
                        "9":"int",
                        "10":"int"
                    };
                }
                else if(list == "bool"){
                    autocomp_list = {"true":"bool","false":"bool"};
                }
                else if(list == "string"){
                    autocomp_list = "";
                }else if(Array.isArray(list)){
                    autocomp_list = {};
                    list.forEach(elem => {
                        autocomp_list['"'+elem+'"'] = "constant";
                    });
                }else{
                    autocomp_list = list;
                }
                Object.entries(autocomp_list).forEach(elem => {
                    result = result.concat({
                        caption: elem[0],
                        value: elem[0],
                        meta: elem[1]
                    })
                });
                callback(null, result);
            }
        }
        //langTools.setCompleters([staticWordCompleter])
        // or 
        editor.completers = [staticWordCompleter];
    },
    _getAutoComp : function(jsonpos,autocomp,index){
        if(index < jsonpos.length-1){
            return AutoComplete._getAutoComp(jsonpos,autocomp[jsonpos[index]],index+1);
        }else{
            return autocomp[jsonpos[index]];
        }
    },
    getJSONType : function(path){
        // Get the minecraft content type from the filepath
        const item = "Item";
        const block = "Block";
        const entity = "Entity";
        const recipe = "Recipe";
        const biome = "Biome";
        if(path.startsWith("\\items\\")){
            return item;
        }
        if(path.startsWith("\\blocks\\")){
            return block;
        }
        if(path.startsWith("\\entity\\") || path.startsWith("\\entities\\")){
            return entity;
        }
        if(path.startsWith("\\recipes\\")){
            return recipe;
        }
        if(path.startsWith("\\biomes\\")){
            return biome;
        }
    },
    getPosInJSON : function(string){
        // By Hanprogramer
        // A custom parser for JSON 
        // Get your position in a JSON object
        // input: string from begining of the file to the cursor pos
        // return list of keys

        //TODO
        var level = 0; // used if the json file is invalid

        var keys = [];
        var last_key = "";
        var open_quote = false;
        var waiting_for_value = false;
        for (var i in string) {
        if (open_quote) {
            if (string[i] == '"') open_quote = false;
            else last_key += string[i];
        } else {
            if (string[i] == "{") {
            level++;
            if (last_key != "")
                keys = keys.concat(last_key);
            last_key = "";
            }
            if (string[i] == ",") {
            last_key = "";
            }
            if (string[i] == "}") {
            level--;
            keys.pop();
            }
            if (string[i] == '"') {
            open_quote = true;
            }
            if (!(["\n", "\t", " "].indexOf(string[i]) >= 0)) waiting_for_value = false;
            if (string[i] == ":") {
                waiting_for_value = true;
            }
        }
        }
        if (waiting_for_value) {
            var open_quote = false;
            var last_key = "";
            var level = 0;
            for (var i = string.length - 1; i >=0; i--) {
                if (open_quote) {
                    if (string[i] == '"') {
                        open_quote = false;
                        // if(level == 0){
                            keys = keys.concat(last_key.split("").reverse().join(""));
                            break;
                        // }
                    }else{
                        // if(string[i] != ":")
                        last_key += string[i];
                    }
                } else {
                    if (string[i] == '"') {
                        open_quote = true;
                    }
                    if(string[i] == "{") level--;
                    if(string[i] == "}") level++;
                }
            }
        }
        return keys
    },
    getFormatVersion : function(string){
        // Read format version even though the JSON is error
        var keys = [];
        var last_key = "";
        var value = "";
        var open_quote = false;
        var waiting_for_value = false;
        for (var i in string) {
            if (open_quote) {
                if (string[i] == '"'){
                    open_quote = false;
                    if(last_key == "format_version" && waiting_for_value)
                        return value;
                }
                else{
                    if(waiting_for_value)
                        value += string[i];
                    else
                        last_key += string[i];
                }
            } else {
                if (string[i] == "{") {
                if (last_key != "")
                    keys = keys.concat(last_key);
                    last_key = "";
                }
                if (string[i] == ",") {
                    last_key = "";
                }
                if (string[i] == "}") {
                    keys.pop();
                }
                if (string[i] == '"') {
                    open_quote = true;
                }
                // if (!(["\n", "\t", " "].indexOf(string[i]) >= 0)) waiting_for_value = false;
                if (string[i] == ":") {
                    waiting_for_value = true;
                }
            }
        }
        return "1.13.0";
    },
    AUTOCOMPLETE : {
        "default" : {
            "format_version" : "string",
            "minecraft:item": {
                "description": {
                    "identifier": "string"
                },
               
                "components": {
                  "minecraft:max_damage": "int",          // max damage item has, this is used like item max health.
                  "minecraft:hand_equipped": "bool",    // is this a hand equipped item.
                  "minecraft:stacked_by_data": "bool",  // stacked by data aux value or not?
                  "minecraft:foil": "bool",             // foil or glint.
                  "minecraft:block": "blocks",               // block name, leave blank for no block.
                  "minecraft:max_stack_size": "int",      // max stack size.
                  "minecraft:use_duration": "int",        // how long to use before item is done being used.
                  "minecraft:food": {
                    "nutrition": "int",                    // nutrition amount.
                    "saturation_modifier": ["poor","low","normal","good","max","supernatural"],     // choose: poor, low, normal, good, max, supernatural.
                    "using_converts_to": "int",            // after using,  item converts it to this item.
                    "on_use_action": ["chorus_teleport","none"],                // 'chorus_teleport' or 'none'.
                    "on_use_range": "int",                 // array of 3 ranges.
                    "cooldown_type": ["chorusfruit","none"],                // 'chorusfruit' or 'none'.
                    "cooldown_time": "int",                // cooldown time in ticks.
                    "can_always_eat": "bool",               // can always eat this item? true or false.
                    
                    "effects": [,                      // effects.
                       { 
                         "name": "regeneration",     // name of effect: regeneration, absorption, resistance, fire_resistance
                          "chance": "int",                // float chance for effect to happen 
                          "duration": "int",               // int duration of effect 
                          "amplifier": "int",               // int amplifier
                        },                                                
                        {                                                 
                          "name": "absorption",                       
                          "chance" : "int",                               
                          "duration" : "int",                             
                          "amplifier" : "int"                               
                        }           
                    ]                                   
                  },                                                
                                                                         
                  "minecraft:seed": {                                  
                    "crop_result": "blocks",        // crop seed item result 
                    "plant_at": "array" // valid blocks you can plant this item at.
                  },                                                       
                }
              }
        }
    }
}