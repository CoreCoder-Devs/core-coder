const AutoComplete = {
    commands:{
        "ability" : [VanillaMinecraft.selectors, "string","bool"],
        "alwaysday" : ["bool"],
        "clear" : [VanillaMinecraft.selectors, "string", "int","int"],
        "clone" : [],
        "connect" : ["string"],
        "deop" : ["string"],
        "difficulty" : ["int"],
        "effect" : [VanillaMinecraft.selectors, "string", "int","int","bool"],
        "enchant" : [],
        "execute" : [],
        "fill" : [],
        "function" : ["string"],
        "gamemode" : [["c","s","a","creative","survival","adventure"]],
        "gamerule" : [VanillaMinecraft.gamrules, "bool"],
        "give" : [VanillaMinecraft.selectors, VanillaMinecraft.items, "int", "int"],
        "help" : ["int"],
        "immutableworld" : ["bool"],
        "kill" : [VanillaMinecraft.selectors],
        "list" : [],
        "locate" : ["string"],
        "me" : ["string"],
        "mixer" : [],
        "mobevent" : ["string","bool"],
        "op" : ["string"],
        "particle" : [],
        "playsound" : ["string"],
        "reload" : [],
        "replaceitem" : [VanillaMinecraft.selectors],
        "say" : ["string"],
        "scoreboard" : [["objectives","players"], ["set","add","reset","setdisplay"], "string"],
        "setmaxplayers" : ["int"],
        "setblock" : [],
        "setworldspawn" : [],
        "spawnpoint" : [VanillaMinecraft.selectors],
        "spreadplayers" : [],
        "stopsound" : ["string"],
        "summon" : [VanillaMinecraft.mobs, "string", ["x"], ["y"], ["z"]],
        "tag" : [VanillaMinecraft.selectors, ["add","remove"], "string"],
        "tell" : [VanillaMinecraft.selectors, "string"],
        "tellraw" : [VanillaMinecraft.selectors, "string"],
        "testfor" : [VanillaMinecraft.selectors],
        "testforblock" : [],
        "testforblocks" : [],
        "tickingarea" : [["add","remove","list","remove_all"]],
        "time" : [["add"],["query"],["set"],["day","night","midnight","noon"]],
        "title" : [VanillaMinecraft.selectors, ["title","subtitle"], "string"],
        "titleraw" : [VanillaMinecraft.selectors, ["title","subtitle"], "string"],
        "toggledownfall" : [],
        "tp" : [VanillaMinecraft.selectors, VanillaMinecraft.selectors],
        "videostream" : ["string","int"],
        "videostreamaction" : [["none","close"]],
        "weather" : [["clear","rain","thunderstorm"], "int"],
        "worldbuilder" : [],
        "wsserver" : ["string"],
        "xp" : ["int", VanillaMinecraft.selectors]
    },
	autocomplete: function() {
		var staticWordCompleter = {
			getCompletions: function(editor, session, pos, prefix, callback) {
				if (session.getMode().$id == "ace/mode/mcfunction") {
                    // Function syntax autocomplete
                    var autocomp_list = {};
                    var result = [];
                    var line = editor.session.getLine(pos.row);
                    var pos_incmd = AutoComplete.getPosInFunction(line, pos.column);
                    var cmds = AutoComplete.commandSplit(line);
                    if(pos_incmd == 0){
                        Object.entries(AutoComplete.commands).forEach(elem => {
                            result = result.concat({
                                caption: elem[0],
                                value: elem[0],
                                meta: "command"
                            })
                        });
                    }else{
                        var value = AutoComplete.commands[cmds[0]][pos_incmd-1];
                        console.log(value);
                        var autocomp_list = {};
                        if (value == undefined) {
                            autocomp_list = {};
                        } else if (value == "int") {
                            autocomp_list = {
                                "0": "int",
                                "1": "int",
                                "3": "int",
                                "4": "int",
                                "5": "int",
                                "6": "int",
                                "7": "int",
                                "8": "int",
                                "9": "int",
                                "10": "int"
                            };
                        } else if (value == "bool") {
                            autocomp_list = {
                                "true": "bool",
                                "false": "bool"
                            };
                        } else if (value == "string") {
                            autocomp_list = "";
                        } else if (Array.isArray(value)) {
                            autocomp_list = {};
                            value.forEach(e => {
                                autocomp_list[e] = "constant";
                            });
                        } else {
                            autocomp_list = value;
                        }
                        // result = result.concat({
                        //     caption: value,
                        //     value: value,
                        //     meta: typeof(value)
                        // });
                        
                        Object.entries(autocomp_list).forEach(e => {
                            result = result.concat({
                                caption: e[0],
                                value: e[0],
                                meta: e[1]
                            })
                        });
                    }
                    
					callback(null, result);
				} else {
					// JSON syntax autocomplete
					var use_format = session.format_version.startsWith("1.16.100") ? "1.16.100" : "default";
					var autocomp = AutoComplete.AUTOCOMPLETE[use_format];
					var result = [];
					var content = session.getValue();
					var _pos = session.doc.positionToIndex(pos);
					var str = content.substring(0, _pos);
					var jsonpos = AutoComplete.getPosInJSON(str);

					var list = AutoComplete._getAutoComp(jsonpos, autocomp, 0);
					var autocomp_list = {};
					if (list == undefined) {
						autocomp_list = {};
					} else if (list == "int") {
						autocomp_list = {
							"0": "int",
							"1": "int",
							"3": "int",
							"4": "int",
							"5": "int",
							"6": "int",
							"7": "int",
							"8": "int",
							"9": "int",
							"10": "int"
						};
					} else if (list == "bool") {
						autocomp_list = {
							"true": "bool",
							"false": "bool"
						};
					} else if (list == "string") {
						autocomp_list = "";
					} else if (Array.isArray(list)) {
						autocomp_list = [];
						list.forEach(elem => {
							autocomp_list['"' + elem + '"'] = "constant";
						});
					} else {
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
		}
		//langTools.setCompleters([staticWordCompleter])
		// or 
		editor.completers = [staticWordCompleter];
	},
	_getAutoComp: function(jsonpos, autocomp, index) {
		if (index < jsonpos.length - 1) {
			return AutoComplete._getAutoComp(jsonpos, autocomp[jsonpos[index]], index + 1);
		} else {
			return autocomp[jsonpos[index]];
		}
	},
	getJSONType: function(_path) {
		// Get the minecraft content type from the filepath
		const item = "Item";
		const block = "Block";
		const entity = "Entity";
		const recipe = "Recipe";
		const biome = "Biome";
		if (_path.startsWith("\\items\\")) {
			return item;
		}
		if (_path.startsWith("\\blocks\\")) {
			return block;
		}
		if (_path.startsWith("\\entity\\") || _path.startsWith("\\entities\\")) {
			return entity;
		}
		if (_path.startsWith("\\recipes\\")) {
			return recipe;
		}
		if (_path.startsWith("\\biomes\\")) {
			return biome;
		}
	},
	getPosInJSON: function(string) {
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
			for (var i = string.length - 1; i >= 0; i--) {
				if (open_quote) {
					if (string[i] == '"') {
						open_quote = false;
						// if(level == 0){
						keys = keys.concat(last_key.split("").reverse().join(""));
						break;
						// }
					} else {
						// if(string[i] != ":")
						last_key += string[i];
					}
				} else {
					if (string[i] == '"') {
						open_quote = true;
					}
					if (string[i] == "{") level--;
					if (string[i] == "}") level++;
				}
			}
		}
		return keys
    },
    getPosInFunction: function(line, pos){
        var r = 0;
        var string_started = false;
        for(var i = 0; i < pos; i++){
            if(!string_started){
                if(line[i] == " "){
                    r++;
                }
            }

            if(line[i] == '"') string_started = !string_started;
        }
        return r;
    },
	getFormatVersion: function(string) {
		// Read format version even though the JSON is error
		var keys = [];
		var last_key = "";
		var value = "";
		var open_quote = false;
		var waiting_for_value = false;
		for (var i in string) {
			if (open_quote) {
				if (string[i] == '"') {
					open_quote = false;
					if (last_key == "format_version" && waiting_for_value)
						return value;
				} else {
					if (waiting_for_value)
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
    commandSplit : function(line){
        // Split a command, not splitting strings
        var r = [];
        var last_key = ""
        var string_started = false;
        for(var i = 0; i < line.length; i++){
            if(line[i] == '"') {string_started = !string_started; last_key += "\""; continue;}
            if(!string_started){
                if(line[i] == " "){
                    r = r.concat(last_key);
                    last_key = "";
                }else{
                    last_key += line[i]
                }
            }else{
                last_key += line[i];
            }
        }
        
        r = r.concat(last_key);
        return r;
    },
	AUTOCOMPLETE: {
		"default": {
			"format_version": "string",
			"minecraft:item": {
				"description": {
					"identifier": "string"
				},

				"components": {
					"minecraft:max_damage": "int", // max damage item has, this is used like item max health.
					"minecraft:hand_equipped": "bool", // is this a hand equipped item.
					"minecraft:stacked_by_data": "bool", // stacked by data aux value or not?
					"minecraft:foil": "bool", // foil or glint.
					"minecraft:block": "blocks", // block name, leave blank for no block.
					"minecraft:max_stack_size": "int", // max stack size.
					"minecraft:use_duration": "int", // how long to use before item is done being used.
					"minecraft:food": {
						"nutrition": "int", // nutrition amount.
						"saturation_modifier": ["poor", "low", "normal", "good", "max", "supernatural"], // choose: poor, low, normal, good, max, supernatural.
						"using_converts_to": "int", // after using,  item converts it to this item.
						"on_use_action": ["chorus_teleport", "none"], // 'chorus_teleport' or 'none'.
						"on_use_range": "int", // array of 3 ranges.
						"cooldown_type": ["chorusfruit", "none"], // 'chorusfruit' or 'none'.
						"cooldown_time": "int", // cooldown time in ticks.
						"can_always_eat": "bool", // can always eat this item? true or false.

						"effects": [, // effects.
							{
								"name": "regeneration", // name of effect: regeneration, absorption, resistance, fire_resistance
								"chance": "int", // float chance for effect to happen 
								"duration": "int", // int duration of effect 
								"amplifier": "int", // int amplifier
							},
							{
								"name": "absorption",
								"chance": "int",
								"duration": "int",
								"amplifier": "int"
							}
						]
					},

					"minecraft:seed": {
						"crop_result": "blocks", // crop seed item result 
						"plant_at": "array" // valid blocks you can plant this item at.
					},
				}
			},
			"minecraft:client_entity": {
				"description": {
					"identifier": "string",
					"materials": {
						"default": "string"
					},
					"textures": {
						"default": "string"
					},
					"geometry": {
						"default": "string"
					},
					"animations": [],
					"animation_controllers": [],
					"render_controllers": [],
					"locators": [],
					"spawn_egg": {
						"texture": "string",
						"texture_index": "int"
					}
				}
			},
			"minecraft:entity": {
				"description": {
					"identifier": "string",
					"is_spawnable": "bool",
					"is_summonable": "bool",
					"is_experimental": "bool",
					"runtime_identifier": "string"
				},
				"component_groups": [],
				"components": {
					"minecraft:addrider": [],
					"minecraft:ageable": [],
					"minecraft:ambient_sound_interval": [],
					"minecraft:angry": [],
					"minecraft:annotation": [],
					"minecraft:area_attack": [],
					"minecraft:attack": [],
					"minecraft:block_sensor": [],
					"minecraft:boostable": [],
					"minecraft:boss": [],
					"minecraft:break_blocks": [],
					"minecraft:breathable": [],
					"minecraft:breedable": [],
					"minecraft:bribeable": [],
					"minecraft:burns_in_daylight": [],
					"minecraft:can_climb": [],
					"minecraft:can_fly": [],
					"minecraft:can_power_jump": [],
					"minecraft:collision_box": [],
					"minecraft:color": [],
					"minecraft:color2": [],
					"minecraft:damage_over_time": [],
					"minecraft:damage_sensor": [],
					"minecraft:default_look_angle": [],
					"minecraft:despawn": [],
					"minecraft:economy_trade_table": [],
					"minecraft:entity_sensor": [],
					"minecraft:environment_sensor": [],
					"minecraft:equipment": [],
					"minecraft:equippable": [],
					"minecraft:experience_reward": [],
					"minecraft:explode": [],
					"minecraft:fire_immune": [],
					"minecraft:floats_in_liquid": [],
					"minecraft:flocking": [],
					"minecraft:flying_speed": [],
					"minecraft:foot_size": [],
					"minecraft:friction_modifier": [],
					"minecraft:genetics": [],
					"minecraft:giveable": [],
					"minecraft:ground_offset": [],
					"minecraft:grows_crop": [],
					"minecraft:healable": [],
					"minecraft:home": [],
					"minecraft:hurt_on_condition": [],
					"minecraft:input_ground_controlled": [],
					"minecraft:insomnia": [],
					"minecraft:interact": [],
					"minecraft:inventory": [],
					"minecraft:is_baby": [],
					"minecraft:is_charged": [],
					"minecraft:is_chested": [],
					"minecraft:is_dyeable": [],
					"minecraft:is_hidden_when_invisible": [],
					"minecraft:is_ignited": [],
					"minecraft:is_illager_captain": [],
					"minecraft:is_saddled": [],
					"minecraft:is_shaking": [],
					"minecraft:is_sheared": [],
					"minecraft:is_stackable": [],
					"minecraft:is_stunned": [],
					"minecraft:is_tamed": [],
					"minecraft:item_controllable": [],
					"minecraft:item_hopper": [],
					"minecraft:jump": [],
					"minecraft:jump": [],
					"minecraft:leashable": [],
					"minecraft:lookat": [],
					"minecraft:loot": [],
					"minecraft:managed_wandering_trader": [],
					"minecraft:mark_variant": [],
					"minecraft:mob_effect": [],
					"minecraft:movement": [],
					"minecraft:nameable": [],
					"minecraft:navigation": [],
					"minecraft:peek": [],
					"minecraft:persistent": [],
					"minecraft:physics": [],
					"minecraft:preferred_path": [],
					"minecraft:projectile": [],
					"minecraft:push_through": [],
					"minecraft:pushable": [],
					"minecraft:raid_trigger": [],
					"minecraft:rail_movement": [],
					"minecraft:rail_sensor": [],
					"minecraft:ravager_blocked": [],
					"minecraft:rideable": [],
					"minecraft:scaffolding_climber": [],
					"minecraft:scale": [],
					"minecraft:scale_by_age": [],
					"minecraft:scheduler": [],
					"minecraft:shareables": [],
					"minecraft:shooter": [],
					"minecraft:sittable": [],
					"minecraft:skin_id": [],
					"minecraft:sound_volume": [],
					"minecraft:spawn_entity": [],
					"minecraft:spell_effects": [],
					"minecraft:strength": [],
					"minecraft:tameable": [],
					"minecraft:tamemount": [],
					"minecraft:target_nearby_sensor": [],
					"minecraft:teleport": [],
					"minecraft:tick_world": [],
					"minecraft:timer": [],
					"minecraft:trade_table": [],
					"minecraft:trail": [],
					"minecraft:transformation": [],
					"minecraft:trusting": [],
					"minecraft:type_family": [],
					"minecraft:variant": [],
					"minecraft:walk_animation_speed": [],
					"minecraft:wants_jockey": [],
					"minecraft:water_movement": []
				},
				"events": {
					"minecraft:entity_spawned": []
				}
			},
			"minecraft:block": {
				"description": {
					"identifier": "string"
				},
				"components": {
					"minecraft:block_light_absorption": "int",
					"minecraft:block_light_emission": "int",
					"minecraft:destroy_time": "int",
					"minecraft:explosion_resistance": "int",
					"minecraft:flammable": {
						"flame_odds": "int",
						"burn_odds": "int"
					},
					"minecraft:friction": "int",
					"minecraft:loot": "string",
					"minecraft:map_color": "string"
				}
			},
			"minecraft:recipe_shaped": {
				"description": {
					"identifier": "string"
				},
				"tags": ["crafting_table"],
				"pattern": [],
				"key": [],
				"result": {
					"item": "string",
					"data": "int"
				}
			},
			"minecraft:recipe_shapeless": {
				"description": {
					"identifier": "string"
				},
				"priority": "int",
				"ingredients": {
					"item": "string",
					"data": "int",
					"count": "int"
				},
				"result": {
					"item": "string",
					"data": "int"
				}
			}
		}
	}
}