const AutoComplete = {
    autocomplete : function(){
        var staticWordCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                var wordList = ["foo", "bar", "baz"];
                callback(null, wordList.map(function(word) {
                    return {
                        caption: word,
                        value: word,
                        meta: "static"
                    };
                }));
            }
        }
        langTools.setCompleters([staticWordCompleter])
        // or 
        editor.completers = [staticWordCompleter];
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
        for (var i = string.length - 1; i >=0; i--) {
            if (open_quote) {
            if (string[i] == '"') {
                open_quote = false;
                keys = keys.concat(last_key.split("").reverse().join(""));
                break;
            }else{
            last_key += string[i];}
            } else {
            if (string[i] == '"') {
                open_quote = true;
            }
            }
        }
        }
        return keys
    },

    getAutocompleteList : function(format_version, type){
        var result = [
            {
                "format_version" : "string"
            }
        ];

        return result;
    }
}