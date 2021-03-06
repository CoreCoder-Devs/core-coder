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
        this.onUpdate = function() {
            var value = this.doc.getValue();
            var errors = [];
            var results = lint(value);
            
            var lines = value.split("\n");
            for (var i in lines){    
                errors.push({
                    row: error.line-1,
                    column: error.character-1,
                    text: error.reason,
                    type: type,
                    raw: raw
                });
            }
            
            for (var i = 0; i < results.length; i++) {
                var error = results[i];
                // convert to ace gutter annotation
                errors.push({
                    row: error.line-1, // must be 0 based
                    column: error.character,  // must be 0 based
                    text: error.message,  // text to show in tooltip
                    type: "error"|"warning"|"info"
                });
            }
            this.sender.emit("lint", errors);
        };
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
        this.mc_selectorargs = [
            "x",
            "y",
            "z",
            "r",
            "rm",
            "dx",
            "dy",
            "dz",
            "scores",
            "tag",
            "c",
            "l",
            "lm",
            "m",
            "name",
            "rx",
            "rxm",
            "ry",
            "rym",
            "type"
        ]
        this.mc_items = [
            "acacia_button",
        "acacia_door",
        "acacia_fence_gate",
        "acacia_pressure_plate",
        "acacia_sign",
        "acacia_stairs",
        "acacia_standing_sign",
        "acacia_trapdoor",
        "acacia_wall_sign",
        "activator_rail",
        "air",
        "allow",
        "ancient_debris",
        "andesite_stairs",
        "anvil",
        "apple",
        "appleenchanted",
        "armor_stand",
        "arrow",
        "baked_potato",
        "balloon",
        "bamboo",
        "bamboo_sapling",
        "banner",
        "banner_pattern",
        "barrel",
        "barrier",
        "basalt",
        "beacon",
        "bed",
        "bedrock",
        "bee_nest",
        "beef",
        "beehive",
        "beetroot",
        "beetroot_seeds",
        "beetroot_soup",
        "bell",
        "birch_button",
        "birch_door",
        "birch_fence_gate",
        "birch_pressure_plate",
        "birch_sign",
        "birch_stairs",
        "birch_standing_sign",
        "birch_trapdoor",
        "birch_wall_sign",
        "black_glazed_terracotta",
        "blackstone",
        "blackstone_double_slab",
        "blackstone_slab",
        "blackstone_stairs",
        "blackstone_wall",
        "blast_furnace",
        "blaze_powder",
        "blaze_rod",
        "bleach",
        "blue_glazed_terracotta",
        "blue_ice",
        "boat",
        "bone",
        "bone_block",
        "book",
        "bookshelf",
        "border_block",
        "bow",
        "bowl",
        "bread",
        "brewing_stand",
        "brewingstandblock",
        "brick",
        "brick_block",
        "brick_stairs",
        "brown_glazed_terracotta",
        "brown_mushroom",
        "brown_mushroom_block",
        "bubble_column",
        "bucket",
        "cactus",
        "cake",
        "camera",
        "campfire",
        "carpet",
        "carrot",
        "carrotonastick",
        "carrots",
        "cartography_table",
        "carved_pumpkin",
        "cauldron",
        "chain",
        "chain_command_block",
        "chainmail_boots",
        "chainmail_chestplate",
        "chainmail_helmet",
        "chainmail_leggings",
        "chemical_heat",
        "chemistry_table",
        "chest",
        "chest_minecart",
        "chicken",
        "chiseled_nether_bricks",
        "chiseled_polished_blackstone",
        "chorus_flower",
        "chorus_fruit",
        "chorus_fruit_popped",
        "chorus_plant",
        "clay",
        "clay_ball",
        "clock",
        "clownfish",
        "coal",
        "coal_block",
        "coal_ore",
        "cobblestone",
        "cobblestone_wall",
        "cocoa",
        "colored_torch_bp",
        "colored_torch_rg",
        "command_block",
        "command_block_minecart",
        "comparator",
        "compass",
        "composter",
        "compound",
        "concrete",
        "concrete_powder",
        "conduit",
        "cooked_beef",
        "cooked_chicken",
        "cooked_fish",
        "cooked_porkchop",
        "cooked_rabbit",
        "cooked_salmon",
        "cookie",
        "coral",
        "coral_block",
        "coral_fan",
        "coral_fan_dead",
        "coral_fan_hang",
        "coral_fan_hang2",
        "coral_fan_hang3",
        "cracked_nether_bricks",
        "cracked_polished_blackstone_bricks",
        "crafting_table",
        "crimson_button",
        "crimson_door",
        "crimson_double_slab",
        "crimson_fence",
        "crimson_fence_gate",
        "crimson_fungus",
        "crimson_hyphae",
        "crimson_nylium",
        "crimson_planks",
        "crimson_pressure_plate",
        "crimson_roots",
        "crimson_sign",
        "crimson_slab",
        "crimson_stairs",
        "crimson_standing_sign",
        "crimson_stem",
        "crimson_trapdoor",
        "crimson_wall_sign",
        "crossbow",
        "crying_obsidian",
        "cyan_glazed_terracotta",
        "dark_oak_button",
        "dark_oak_door",
        "dark_oak_fence_gate",
        "dark_oak_pressure_plate",
        "dark_oak_stairs",
        "dark_oak_trapdoor",
        "dark_prismarine_stairs",
        "darkoak_sign",
        "darkoak_standing_sign",
        "darkoak_wall_sign",
        "daylight_detector",
        "daylight_detector_inverted",
        "deadbush",
        "debug_stick",
        "deny",
        "detector_rail",
        "diamond",
        "diamond_axe",
        "diamond_block",
        "diamond_boots",
        "diamond_chestplate",
        "diamond_helmet",
        "diamond_hoe",
        "diamond_leggings",
        "diamond_ore",
        "diamond_pickaxe",
        "diamond_shovel",
        "diamond_sword",
        "diorite_stairs",
        "dirt",
        "dispenser",
        "double_plant",
        "double_stone_slab",
        "double_stone_slab2",
        "double_stone_slab3",
        "double_stone_slab4",
        "double_wooden_slab",
        "dragon_breath",
        "dragon_egg",
        "dried_kelp",
        "dried_kelp_block",
        "dropper",
        "dye",
        "egg",
        "element_0",
        "element_1",
        "element_10",
        "element_100",
        "element_101",
        "element_102",
        "element_103",
        "element_104",
        "element_105",
        "element_106",
        "element_107",
        "element_108",
        "element_109",
        "element_11",
        "element_110",
        "element_111",
        "element_112",
        "element_113",
        "element_114",
        "element_115",
        "element_116",
        "element_117",
        "element_118",
        "element_12",
        "element_13",
        "element_14",
        "element_15",
        "element_16",
        "element_17",
        "element_18",
        "element_19",
        "element_2",
        "element_20",
        "element_21",
        "element_22",
        "element_23",
        "element_24",
        "element_25",
        "element_26",
        "element_27",
        "element_28",
        "element_29",
        "element_3",
        "element_30",
        "element_31",
        "element_32",
        "element_33",
        "element_34",
        "element_35",
        "element_36",
        "element_37",
        "element_38",
        "element_39",
        "element_4",
        "element_40",
        "element_41",
        "element_42",
        "element_43",
        "element_44",
        "element_45",
        "element_46",
        "element_47",
        "element_48",
        "element_49",
        "element_5",
        "element_50",
        "element_51",
        "element_52",
        "element_53",
        "element_54",
        "element_55",
        "element_56",
        "element_57",
        "element_58",
        "element_59",
        "element_6",
        "element_60",
        "element_61",
        "element_62",
        "element_63",
        "element_64",
        "element_65",
        "element_66",
        "element_67",
        "element_68",
        "element_69",
        "element_7",
        "element_70",
        "element_71",
        "element_72",
        "element_73",
        "element_74",
        "element_75",
        "element_76",
        "element_77",
        "element_78",
        "element_79",
        "element_8",
        "element_80",
        "element_81",
        "element_82",
        "element_83",
        "element_84",
        "element_85",
        "element_86",
        "element_87",
        "element_88",
        "element_89",
        "element_9",
        "element_90",
        "element_91",
        "element_92",
        "element_93",
        "element_94",
        "element_95",
        "element_96",
        "element_97",
        "element_98",
        "element_99",
        "elytra",
        "emerald",
        "emerald_block",
        "emerald_ore",
        "emptymap",
        "enchanted_book",
        "enchanting_table",
        "end_brick_stairs",
        "end_bricks",
        "end_crystal",
        "end_gateway",
        "end_portal",
        "end_portal_frame",
        "end_rod",
        "end_stone",
        "ender_chest",
        "ender_eye",
        "ender_pearl",
        "experience_bottle",
        "farmland",
        "feather",
        "fence",
        "fence_gate",
        "fermented_spider_eye",
        "fire",
        "fireball",
        "fireworks",
        "fireworkscharge",
        "fish",
        "fishing_rod",
        "fletching_table",
        "flint",
        "flint_and_steel",
        "flower_pot",
        "flowing_lava",
        "flowing_water",
        "frame",
        "frosted_ice",
        "furnace",
        "ghast_tear",
        "gilded_blackstone",
        "glass",
        "glass_bottle",
        "glass_pane",
        "glow_stick",
        "glowingobsidian",
        "glowstone",
        "glowstone_dust",
        "gold_block",
        "gold_ingot",
        "gold_nugget",
        "gold_ore",
        "golden_apple",
        "golden_axe",
        "golden_boots",
        "golden_carrot",
        "golden_chestplate",
        "golden_helmet",
        "golden_hoe",
        "golden_leggings",
        "golden_pickaxe",
        "golden_rail",
        "golden_shovel",
        "golden_sword",
        "granite_stairs",
        "grass",
        "grass_path",
        "gravel",
        "gray_glazed_terracotta",
        "green_glazed_terracotta",
        "grindstone",
        "gunpowder",
        "hard_glass",
        "hard_glass_pane",
        "hard_stained_glass",
        "hard_stained_glass_pane",
        "hardened_clay",
        "hay_block",
        "heart_of_the_sea",
        "heavy_weighted_pressure_plate",
        "honey_block",
        "honey_bottle",
        "honeycomb",
        "honeycomb_block",
        "hopper",
        "hopper_minecart",
        "horsearmordiamond",
        "horsearmorgold",
        "horsearmoriron",
        "horsearmorleather",
        "ice",
        "ice_bomb",
        "info_update",
        "info_update2",
        "invisiblebedrock",
        "iron_axe",
        "iron_bars",
        "iron_block",
        "iron_boots",
        "iron_chestplate",
        "iron_door",
        "iron_helmet",
        "iron_hoe",
        "iron_ingot",
        "iron_leggings",
        "iron_nugget",
        "iron_ore",
        "iron_pickaxe",
        "iron_shovel",
        "iron_sword",
        "iron_trapdoor",
        "item.acacia_door",
        "item.bed",
        "item.beetroot",
        "item.birch_door",
        "item.cake",
        "item.camera",
        "item.campfire",
        "item.cauldron",
        "item.chain",
        "item.crimson_door",
        "item.dark_oak_door",
        "item.flower_pot",
        "item.frame",
        "item.hopper",
        "item.iron_door",
        "item.jungle_door",
        "item.kelp",
        "item.nether_sprouts",
        "item.nether_wart",
        "item.reeds",
        "item.skull",
        "item.soul_campfire",
        "item.spruce_door",
        "item.warped_door",
        "item.wheat",
        "item.wooden_door",
        "jigsaw",
        "jukebox",
        "jungle_button",
        "jungle_door",
        "jungle_fence_gate",
        "jungle_pressure_plate",
        "jungle_sign",
        "jungle_stairs",
        "jungle_standing_sign",
        "jungle_trapdoor",
        "jungle_wall_sign",
        "kelp",
        "ladder",
        "lantern",
        "lapis_block",
        "lapis_ore",
        "lava",
        "lava_cauldron",
        "lead",
        "leather",
        "leather_boots",
        "leather_chestplate",
        "leather_helmet",
        "leather_leggings",
        "leaves",
        "leaves2",
        "lectern",
        "lever",
        "light_block",
        "light_blue_glazed_terracotta",
        "light_weighted_pressure_plate",
        "lime_glazed_terracotta",
        "lingering_potion",
        "lit_blast_furnace",
        "lit_furnace",
        "lit_pumpkin",
        "lit_redstone_lamp",
        "lit_redstone_ore",
        "lit_smoker",
        "lodestone",
        "lodestonecompass",
        "log",
        "log2",
        "loom",
        "magenta_glazed_terracotta",
        "magma",
        "magma_cream",
        "map",
        "medicine",
        "melon",
        "melon_block",
        "melon_seeds",
        "melon_stem",
        "minecart",
        "mob_spawner",
        "monster_egg",
        "mossy_cobblestone",
        "mossy_cobblestone_stairs",
        "mossy_stone_brick_stairs",
        "movingblock",
        "mushroom_stew",
        "muttoncooked",
        "muttonraw",
        "mycelium",
        "name_tag",
        "nautilus_shell",
        "nether_brick",
        "nether_brick_fence",
        "nether_brick_stairs",
        "nether_gold_ore",
        "nether_sprouts",
        "nether_wart",
        "nether_wart_block",
        "netherbrick",
        "netherite_axe",
        "netherite_block",
        "netherite_boots",
        "netherite_chestplate",
        "netherite_helmet",
        "netherite_hoe",
        "netherite_ingot",
        "netherite_leggings",
        "netherite_pickaxe",
        "netherite_scrap",
        "netherite_shovel",
        "netherite_sword",
        "netherrack",
        "netherreactor",
        "netherstar",
        "normal_stone_stairs",
        "noteblock",
        "oak_stairs",
        "observer",
        "obsidian",
        "orange_glazed_terracotta",
        "packed_ice",
        "painting",
        "paper",
        "phantom_membrane",
        "pink_glazed_terracotta",
        "piston",
        "pistonarmcollision",
        "planks",
        "podzol",
        "poisonous_potato",
        "polished_andesite_stairs",
        "polished_basalt",
        "polished_blackstone",
        "polished_blackstone_brick_double_slab",
        "polished_blackstone_brick_slab",
        "polished_blackstone_brick_stairs",
        "polished_blackstone_brick_wall",
        "polished_blackstone_bricks",
        "polished_blackstone_button",
        "polished_blackstone_double_slab",
        "polished_blackstone_pressure_plate",
        "polished_blackstone_slab",
        "polished_blackstone_stairs",
        "polished_blackstone_wall",
        "polished_diorite_stairs",
        "polished_granite_stairs",
        "porkchop",
        "portal",
        "potato",
        "potatoes",
        "potion",
        "powered_comparator",
        "powered_repeater",
        "prismarine",
        "prismarine_bricks_stairs",
        "prismarine_crystals",
        "prismarine_shard",
        "prismarine_stairs",
        "pufferfish",
        "pumpkin",
        "pumpkin_pie",
        "pumpkin_seeds",
        "pumpkin_stem",
        "purple_glazed_terracotta",
        "purpur_block",
        "purpur_stairs",
        "quartz",
        "quartz_block",
        "quartz_bricks",
        "quartz_ore",
        "quartz_stairs",
        "rabbit",
        "rabbit_foot",
        "rabbit_hide",
        "rabbit_stew",
        "rail",
        "rapid_fertilizer",
        "real_double_stone_slab",
        "real_double_stone_slab2",
        "real_double_stone_slab3",
        "real_double_stone_slab4",
        "record_11",
        "record_13",
        "record_blocks",
        "record_cat",
        "record_chirp",
        "record_far",
        "record_mall",
        "record_mellohi",
        "record_pigstep",
        "record_stal",
        "record_strad",
        "record_wait",
        "record_ward",
        "red_flower",
        "red_glazed_terracotta",
        "red_mushroom",
        "red_mushroom_block",
        "red_nether_brick",
        "red_nether_brick_stairs",
        "red_sandstone",
        "red_sandstone_stairs",
        "redstone",
        "redstone_block",
        "redstone_lamp",
        "redstone_ore",
        "redstone_torch",
        "redstone_wire",
        "reeds",
        "repeater",
        "repeating_command_block",
        "reserved6",
        "respawn_anchor",
        "rotten_flesh",
        "saddle",
        "salmon",
        "sand",
        "sandstone",
        "sandstone_stairs",
        "sapling",
        "scaffolding",
        "sea_pickle",
        "seagrass",
        "sealantern",
        "shears",
        "shield",
        "shroomlight",
        "shulker_box",
        "shulker_shell",
        "sign",
        "silver_glazed_terracotta",
        "skull",
        "slime",
        "slime_ball",
        "smithing_table",
        "smoker",
        "smooth_quartz_stairs",
        "smooth_red_sandstone_stairs",
        "smooth_sandstone_stairs",
        "smooth_stone",
        "snow",
        "snow_layer",
        "snowball",
        "soul_campfire",
        "soul_fire",
        "soul_lantern",
        "soul_sand",
        "soul_soil",
        "soul_torch",
        "sparkler",
        "spawn_egg",
        "speckled_melon",
        "spider_eye",
        "splash_potion",
        "sponge",
        "spruce_button",
        "spruce_door",
        "spruce_fence_gate",
        "spruce_pressure_plate",
        "spruce_sign",
        "spruce_stairs",
        "spruce_standing_sign",
        "spruce_trapdoor",
        "spruce_wall_sign",
        "stained_glass",
        "stained_glass_pane",
        "stained_hardened_clay",
        "standing_banner",
        "standing_sign",
        "stick",
        "sticky_piston",
        "stickypistonarmcollision",
        "stone",
        "stone_axe",
        "stone_brick_stairs",
        "stone_button",
        "stone_hoe",
        "stone_pickaxe",
        "stone_pressure_plate",
        "stone_shovel",
        "stone_stairs",
        "stone_sword",
        "stonebrick",
        "stonecutter",
        "stonecutter_block",
        "string",
        "stripped_acacia_log",
        "stripped_birch_log",
        "stripped_crimson_hyphae",
        "stripped_crimson_stem",
        "stripped_dark_oak_log",
        "stripped_jungle_log",
        "stripped_oak_log",
        "stripped_spruce_log",
        "stripped_warped_hyphae",
        "stripped_warped_stem",
        "structure_block",
        "structure_void",
        "sugar",
        "suspicious_stew",
        "sweet_berries",
        "sweet_berry_bush",
        "tallgrass",
        "target",
        "tnt",
        "tnt_minecart",
        "torch",
        "totem",
        "trapdoor",
        "trapped_chest",
        "trident",
        "tripwire",
        "tripwire_hook",
        "turtle_egg",
        "turtle_helmet",
        "turtle_shell_piece",
        "twisting_vines",
        "underwater_torch",
        "undyed_shulker_box",
        "unlit_redstone_torch",
        "unpowered_comparator",
        "unpowered_repeater",
        "vine",
        "wall_banner",
        "wall_sign",
        "warped_button",
        "warped_door",
        "warped_double_slab",
        "warped_fence",
        "warped_fence_gate",
        "warped_fungus",
        "warped_fungus_on_a_stick",
        "warped_hyphae",
        "warped_nylium",
        "warped_planks",
        "warped_pressure_plate",
        "warped_roots",
        "warped_sign",
        "warped_slab",
        "warped_stairs",
        "warped_standing_sign",
        "warped_stem",
        "warped_trapdoor",
        "warped_wall_sign",
        "warped_wart_block",
        "water",
        "waterlily",
        "web",
        "weeping_vines",
        "wheat",
        "wheat_seeds",
        "white_glazed_terracotta",
        "wither_rose",
        "wood",
        "wooden_axe",
        "wooden_button",
        "wooden_door",
        "wooden_hoe",
        "wooden_pickaxe",
        "wooden_pressure_plate",
        "wooden_shovel",
        "wooden_slab",
        "wooden_sword",
        "wool",
        "writable_book",
        "written_book",
        "yellow_flower",
        "yellow_glazed_terracotta"
    ]
        this.mc_selectors = "@.|\\[|\\]";
        // this.$rules = new TextHighlightRules().getRules();
        this.$rules = {
            "start": [ 
                {
                  token : ["constant"],
                  regex : this.mc_commmands.join("\\s"+"|")
                }, 
                
                {
                    token : ["support.class"],
                    regex : this.mc_selectors
                },

                // Selector args
                {
                    token : ["variable.parameter"],
                    regex : this.mc_selectorargs.join("(?==)|")
                },

                //vanilla items
                {
                    token : ["constant.language"],
                    regex : this.mc_items.join("[\r\n]+") + "|" + this.mc_items.join("\\s|")
                },
                  
                // Custom items/items with namespace
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