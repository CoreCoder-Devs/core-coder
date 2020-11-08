ace.define('ace/mode/mcfunction', function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var ExampleHighlightRules = require("ace/mode/mcfunction_highlight_rules").ExampleHighlightRules;
    
    var Mode = function() {
        this.HighlightRules = ExampleHighlightRules;
    };
    oop.inherits(Mode, TextMode);
    
    (function() {
        // Extra logic goes here. (see below)
        this.lineCommentStart = "#";
    }).call(Mode.prototype);
    
    exports.Mode = Mode;
    });
    
    ace.define('ace/mode/mcfunction_highlight_rules', function(require, exports, module) {
    
    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
    
    var ExampleHighlightRules = function() {
        this.mc_commmands = [
            "ability",
            "alwaysday",
            "clear",
            "clone",
            "connect",
            "deop",
            "difficulty",
            "effect",
            "enchant",
            "execute",
            "fill",
            "function",
            "gamemode",
            "gamerule",
            "give",
            "help",
            "immutableworld",
            "kill",
            "list",
            "locate",
            "me",
            "mixer",
            "mobevent",
            "op",
            "particle",
            "playsound",
            "reload",
            "replaceitem",
            "say",
            "scoreboard",
            "setmaxplayers",
            "setblock",
            "setworldspawn",
            "spawnpoint",
            "spreadplayers",
            "stopsound",
            "summon",
            "tag",
            "tell",
            "tellraw",
            "testfor",
            "testforblock",
            "testforblocks",
            "tickingarea",
            "time",
            "title",
            "titleraw",
            "toggledownfall",
            "tp",
            "videostream",
            "videostreamaction",
            "weather",
            "worldbuilder",
            "wsserver",
            "xp"
        ];
        this.mc_selectors = "@.";
        // this.$rules = new TextHighlightRules().getRules();
        this.$rules = {
            "start": [ 
                {
                  token : ["constant"],
                  regex : this.mc_commmands.join("\\s"+"|")
                }, 
                
                {
                    token : ["keyword"],
                    regex : this.mc_selectors
                }, 
                  

                // Minecraft items
                {
                    token : ["constant.language"],
                    regex : "\\w+:\\w+"
                },

                // Command selector arguments
                // {
                //     token : ["constant.language"],
                //     regex : "\\[.+\\]"
                // },

                // Strings
                {
                    token : ["string"],
                    regex : `(["'])(?:(?=(\\\\?))\\2.)*?\\1`
                },

                // Comments
                {
                    token : "comment",
                    regex: "#.*"
                },

                // operators
                {
                    token : "keyword.operator",
                    regex: "[+-/\\><=,.:]"
                },

                // Squiggle marks
                {
                    token : "constant",
                    regex: "~"
                },

                // Numbers
                {
                    token : "constant.numeric",
                    regex: "[0123456789]"
                }
             ]
            
        };
        
    }
    
    oop.inherits(ExampleHighlightRules, TextHighlightRules);
    
    exports.ExampleHighlightRules = ExampleHighlightRules;
    });