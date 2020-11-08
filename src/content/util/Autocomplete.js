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

function getPosInJSON(str) {
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
    for (var i in str) {
      if (open_quote) {
        if (str[i] == '"') open_quote = false;
        else last_key += str[i];
      } else {
        if (str[i] == "{") {
          level++;
          if (last_key != "")
            keys = keys.concat(last_key);
          last_key = "";
        }
        if (str[i] == ",") {
          last_key = "";
        }
        if (str[i] == "}") {
          level--;
          keys.pop();
        }
        if (str[i] == '"') {
          open_quote = true;
        }
        if (!(["\n", "\t", " "].indexOf(str[i]) >= 0)) waiting_for_value = false;
        if (str[i] == ":") {
          waiting_for_value = true;
        }
      }
    }
    if (waiting_for_value) {
      var open_quote = false;
      var last_key = "";
      for (var i = str.length - 1; i >=0; i--) {
        if (open_quote) {
          if (str[i] == '"') {
            open_quote = false;
            keys = keys.concat(last_key.split("").reverse().join(""));
            break;
          }else{
          last_key += str[i];}
        } else {
          if (str[i] == '"') {
            open_quote = true;
          }
        }
      }
    }
    return keys
  }