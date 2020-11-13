//requiring path and fs modules
const fs = require('fs');
const uuid = require('uuid');
const imageSize = require('image-size');
const https = require('follow-redirects').https;
const url = require('url');
const fetch = require('node-fetch');
const util = require('util');
const Progress = require('node-fetch-progress/dist');
const streamPipeline = util.promisify(require('stream').pipeline);
const { createPopper } = require('@popperjs/core');
let translations = require(`./content/texts/${GlobalSettings.lang}.json`);
const { shell } = require('electron').remote;


var PROJECTS_BP = [];
var PROJECTS_RP = [];
var PREFERENCES = {
    "com_mojang_path": Preferences.COM_MOJANG_PATH,
    "behavior_folder": 'development_behavior_packs',
    "resource_folder": 'development_resource_packs'
}


function getProjectDirs(name) {
    // Get project full path from com.mojang using the pack name
}
const toolbarTemplate = `<div class=toolbar>
<a style="flex-grow: 1">Projects</a>
    <img class="minibutton" src="content/images/006-add-plus-button.png" onclick="openCreateDlg()"/>
</div>`;

function generateProjectHTML(proj_name, proj_folder, project_data, proj_ver) {
    var string_data = escape(JSON.stringify(project_data));
    var img = "content\\images\\missing_texture.png";
    var filter = false; // wether or not to filter linearly
    var pack_icon_path = Preferences.COM_MOJANG_PATH + '\\' + proj_folder + '\\' + 'pack_icon.png';
    // console.log(pack_icon_path);
    try{
        if (fs.existsSync(pack_icon_path)) {
            var size = imageSize(pack_icon_path);
            if (size.width > 128 || size.height > 128)
                filter = true;
            img = pack_icon_path;
        }
    }catch(e){console.log(e);}

    var template = `
    <div class="panel-back" data-project=` + string_data + `  onclick="window.location='./content/main.html'; localStorage.setItem('project_data', '` + string_data + `')"  id="a${project_data.uuid}">
        <div class="panel">
            <img class="minibutton" src="content/images/012-more.png" onclick="event.stopPropagation();openDeleteDlg(this);translateDocument()"/>
            <img class="icon" src="` + img + `" style="min-width: 60px; height: 60px ` + (filter ? '' : "; image-rendering: pixelated") + `"></img>
            <div class="btnText"><strong>` + proj_name + `</strong> 
                <span><i style="color: var(--var_textColorDarker);">` + proj_ver.join('.') + `</i></span>
            </div>
            <!-- <img class="minibutton" src="content/images/012-more.png" onclick="openRenameDlg()"/> -->
            </div>
            </div>
    `
    
    //TODO: The script element is not executed for some reason.
    return template;
}

function generateCreateUUID() {
    var input = document.getElementById('input-create-uuid');
    input.value = uuid.v4();
    refreshCreateValidators();
}

function listFiles(path) {
    var result = [];
    //passsing directoryPath and callback function
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    var files = fs.readdirSync(path);
    files.forEach(file => {
        let stat = fs.lstatSync(path + '\\' + file);
        if (stat.isDirectory()) {
            result.push(file);
        }
    });
    return result;
}

function refreshProjectMap() {
    //joining path of directory 
    var directoryPath = getMojangPath();
    refreshRPMap(directoryPath);
    refreshBPMap(directoryPath);
    // console.log(PROJECTS_BP);
    // console.log(PROJECTS_RP);
}

function refreshBPMap(directoryPath) {
    var dev_files = listFiles(directoryPath + '\\development_behavior_packs\\');
    var nodev_files = listFiles(directoryPath + '\\behavior_packs\\');
    var projects = [];
    var projects_dev = [];
    
    // Just showcasing 2 ways of doing foreach
    dev_files.forEach(function(val) {
        let data = getProjectManifestJSON('development_behavior_packs\\' + val);
        let dependencies = [];
        let desc = '';
        let name = '';
        let version = [];
        if (data != null) {
        if (data['dependencies'])
            data['dependencies'].forEach(d => {
                if (d['uuid']) {
                    const projuuid = d['uuid'];
                    var p = getProjectWithUUID(PROJECTS_RP, projuuid);
                    if (p != null) {
                        dependencies.push(p);
                    } else {
                        dependencies.push(projuuid);
                    }
                }
            });
            
        if (data["header"]["description"]) {
                // Remove minecraft color code
                desc = (data["header"]["description"]).replace(/\u00A7[0-9A-FK-OR]/ig, '');
                name = (data["header"]["name"]).replace(/\u00A7[0-9A-FK-OR]/ig, '');
                version = (data["header"]["version"]);
            }
        }
        projects_dev.push({
            'name': name == '' ? val : name,
            'folder': 'development_behavior_packs\\' + val,
            'uuid': data == null ? null : data["header"]["uuid"],
            'dependencies': dependencies,
            'description': desc,
            'version': version || [0,0,0]
        });
    });

    for (let i = 0; i < nodev_files.length; i++) {
        let data = getProjectManifestJSON('behavior_packs\\' + nodev_files[i]);
        let dependencies = [];
        let desc = '';
        let name = '';
        let version = [];
        if (data != null) {
            if (data['dependencies'])
                data['dependencies'].forEach(d => {
                    if (d['uuid']) {
                        const projuuid = d['uuid'];
                        var p = getProjectWithUUID(PROJECTS_RP, projuuid);
                        if (p != null) {
                            dependencies.push(p);
                        } else {
                            dependencies.push(projuuid);
                        }
                    }
                });

            if (data["header"]["description"]) {
                // Remove minecraft color code
                desc = (data["header"]["description"]).replace(/\u00A7[0-9A-FK-OR]/ig, '');
                name = (data["header"]["name"]).replace(/\u00A7[0-9A-FK-OR]/ig, '');
                version = (data["header"]["version"]);
            }
        }
        projects.push({
            'name': name == '' ? nodev_files[i] : name,
            'folder': 'behavior_packs\\' + nodev_files[i],
            'uuid': data == null ? null : data["header"]["uuid"],
            'dependencies': dependencies,
            'description': desc,
            'version': version
        });
    }

    var contstr = '<h2>' + translations['manager.welcome.title'] + '</h2>';
    contstr += `
    <div class="panel-back" onclick="window.location='minecraft://'">
        <div class="panel">
            <img class="icon" src="./content/images/mc_icon.png" style="min-width: 60px; height: 60px; image-rendering: pixelated;">
            <div class="btnText">
                <strong>Launch Minecraft</strong>
                <span><i style="color: var(--var_textColorDarker);">1.16.40</i></span>
            </div>
        </div>
    </div>
    <div class="panel-back" onclick="window.location='minecraftedu://'">
        <div class="panel">
            <img class="icon" src="./content/images/mce_icon.png" style="min-width: 60px; height: 60px; image-rendering: pixelated;">
            <div class="btnText">
                <strong>Launch Minecraft Education</strong>
                <span><i style="color: var(--var_textColorDarker);">1.14.50</i></span>
            </div>
        </div>
    </div>
    `
    // Reading the pack name
    contstr += `<h2>${translations["manager.devprojects.title"]}</h2>`;
    if(projects_dev.length) {
        for (const p in projects_dev) {
            contstr += generateProjectHTML(projects_dev[p].name, projects_dev[p].folder, projects_dev[p], projects_dev[p].version);
        }
    } else contstr += `<p>${translations["manager.projects.empty"]}</p>`

    contstr += `<h2>${translations["manager.projects.title"]}</h2>`;
    if(projects.length) {
        for (const p in projects) {
            contstr += generateProjectHTML(projects[p].name, projects[p].folder, projects[p], projects[p].version);
        }
    } else contstr += `<p>${translations["manager.projects.empty"]}</p>`
    
    var container = document.getElementById("proj_container");
    // console.log(container);
    container.innerHTML = contstr;
    PROJECTS_BP = projects;
    
    for (const p in projects) {
        const project = projects[p];

        tippy('#a' + project.uuid, {
            "content": `<i style="color: #b8b8b8;">\
            ${project.uuid}<br>\
            \\${project.folder.slice(15)}<br>\
            ${project.dependencies.length} ${translations['manager.projects.dependencies']}</i><br>\
            ${project['description']}\n`,
            "allowHTML": true,
            "arrow": false
        })
    }
    for (const p in projects_dev) {
        const project = projects_dev[p];

        tippy('#a' + project.uuid, {
            "content": `<i style="color: #b8b8b8;">\
                            ${project.uuid}<br>\
                            \\${project.folder.slice(15)}<br>\
                            ${project.dependencies.length} Dependencies</i><br>\
                            ${project['description']}\n`,
            "allowHTML": true,
            "arrow": false
        });
    }
}

function refreshRPMap(directoryPath) {
    var dev_files = listFiles(directoryPath + '\\development_resource_packs\\');
    var nodev_files = listFiles(directoryPath + '\\resource_packs\\');
    var projects = [];

    // Just showcasing 2 ways of doing foreach
    dev_files.forEach(function(val) {
        const data = getProjectManifestJSON('development_resource_packs\\' + val);
        projects.push({
            'name': val,
            'folder': 'development_resource_packs\\' + val,
            'uuid': data == null ? null : data["header"]["uuid"]
        });
    });

    for (let i = 0; i < nodev_files.length; i++) {
        let data = getProjectManifestJSON('resource_packs\\' + nodev_files[i]);
        if(Array.isArray(data)){
            // Read the first element if it is arrays
            data = data[0];
        }
        projects.push({
            'name': nodev_files[i],
            'folder': 'resource_packs\\' + nodev_files[i],
            'uuid': data == null ? null : data["header"]["uuid"]
        });
    }
    PROJECTS_RP = projects;
}

function getMojangPath() {
    return PREFERENCES["com_mojang_path"];
}

function getBehaviorFolder() {
    return PREFERENCES["behavior_folder"];
}

function getResourceFolder() {
    return PREFERENCES["resource_folder"]
}

function setMojangPath(value) {
    if (value === "") return;
    PREFERENCES["com_mojang_path"] = value;
    refreshProjectMap();
}

function setBehaviorFolder(value) {
    if (value === "") return;
    PREFERENCES["behavior_folder"] = value;
}

function setResourceFolder(value) {
    if (value === "") return;
    PREFERENCES["resource_folder"] = value;
}

function getProjectManifestJSON(folder_path) {
    // Reads out the project manifest.json and parse it as JS object
    var filepath = getMojangPath() + '\\' + folder_path + '\\manifest.json';
    if (fs.existsSync(filepath)) {
        var content = fs.readFileSync(filepath, 'UTF-8');
        return readJSONUncomment(content);
    }
    return null;
}

function getProjectWithUUID(arr, projuuid) {
    // Returns the corresponding projects with the uuid provided
    for (var project in arr) {
        if (arr[project].uuid == projuuid)
            return arr[project];
    }

    return null;
}

//  Dialogs
function openRenameDlg() {
    // Get the modal
    var modal = document.getElementById("renamedlg");

    // Open the modal
    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var close = document.getElementsByClassName("close");

    // When the user clicks on <span> (x), close the modal
    for (let i in close) {
        close[i].onclick = function() {
            modal.style.display = "none";
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function(event) {
    //     if (event.target == modal) {
    //         modal.style.display = "none";
    //     }
    // }
}

function openDeleteDlg(elm) {
    // Get the modal
    var modal = document.getElementById("deletedlg");

    // Open the modal
    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var close = document.getElementsByClassName("close");

    // When the user clicks on <span> (x), close the modal
    for (let i in close) {
        close[i].onclick = function() {
            modal.style.display = "none";
        }
    }

    var deleterp = document.getElementById("input-delete-rp");

    // For deleting the resource pack(All dependencies will be listed and deleted too)
    deleterp.addEventListener('change', (evt) => {
        var val = evt.target.checked;
        if (val) {
            let projdata = JSON.parse(unescape(evt.target.getAttribute('data-project')));
            let projDependencies = [];
            for (let i = 0; i < projdata.dependencies.length; i++) {
                projDependencies.push(projdata.dependencies[i].folder);
            }
            document.getElementById("a-delete-rp").innerText = projDependencies.join('\n');
        } else {
            document.getElementById("a-delete-rp").innerText = '';
        }

    });
    let data = JSON.parse(unescape(elm.parentElement.parentElement.getAttribute('data-project')));
    deleterp.setAttribute('data-project', elm.parentElement.parentElement.getAttribute('data-project'));
    var folder = data.folder;
    document.getElementById("a-delete-bp").innerText = folder;
    let dependencies = [];

    for (let i = 0; i < data.dependencies.length; i++) {
        dependencies.push(data.dependencies[i].folder);
    }

    var deletebtn = document.getElementById("btn-delete-delete");
    deletebtn.addEventListener('click', listenerElm => {
        let folders = [];
        folders.push(folder);
        if (deleterp.checked) {
            folders = folders.concat(dependencies);
        }
        // console.log(folders);
        for (var f in folders) {
            console.log("Deleting " + getMojangPath() + "\\" + folders[f]);
            fs.rmdirSync(getMojangPath() + "\\" + folders[f], {
                recursive: true
            });
        }
        refreshProjectMap();
        modal.style.display = "none";
    });


}

function openCreateDlg() {
    // Get the modal
    var modal = document.getElementById("createdlg");

    // Open the modal
    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var close = document.getElementsByClassName("close");

    // When the user clicks on <span> (x), close the modal
    for (let i in close) {
        close[i].onclick = function() {
            modal.style.display = "none";
        }
    }

    initCreateValidators();

    // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function(event) {
    //     if (event.target == modal) {
    //         modal.style.display = "none";
    //     }
    // }
}

function createProject() {
    // Get value of the inputs
    var name = document.getElementById("input-create-name").value;
    var desc = document.getElementById("input-create-desc").value;
    var uuidval = document.getElementById("input-create-uuid").value;
    var createrp = document.getElementById("input-create-rp").checked;
    // console.log(createrp);

    var rpuuid = uuid.v4();

    let path_bp = getMojangPath() + '\\' + getBehaviorFolder() + '\\' + name + ' BP';
    let path_rp = getMojangPath() + '\\' + getResourceFolder() + '\\' + name + ' RP';
    fs.mkdirSync(path_bp);
    generateProjectBPManifest(path_bp, name + ' BP', desc, uuidval, createrp ? rpuuid : '');
    generateNeccesaryBPFiles(path_bp);
    makePackIcon(path_bp);
    if (createrp) {
        // Generate a templete RP
        fs.mkdirSync(path_rp);
        makePackIcon(path_rp);
        generateProjectRPManifest(path_rp, name + ' RP', desc, rpuuid);
        generateNeccesaryRPFiles(path_rp);
    }

    // Close the dialog
    var modal = document.getElementById("createdlg");
    modal.style.display = "none";

    // Refresh the project list
    refreshProjectMap();
}

function init() {
    refreshProjectMap();
    includeHTML();
    toggleFullscreen(GlobalSettings.fullscreen);
    setLanguage(GlobalSettings.lang);
    document.getElementById("versionID").innerText = currentVersion.versionName;
    // Init the download buttons
    var buttons = document.querySelectorAll('.progress-btn');
    for (let i = 0; i < buttons.length; i++) {
        const element = buttons[i];
        console.log(element);
        element.addEventListener("click", function() {
            var e = this;
            if (!e.classList.contains("active")) {
                e.classList.add("active");
                currently_downloading = this.getAttribute('data-packid');
                // setTimeout(function() {
                //     e.classList.remove("active");
                //     e.classList.add("finished");
                //     e.innerText = 'Installed';
                // }, 10000);
                (async () => {
                    const response = await fetch(default_pack_info[currently_downloading].url);
                    const progress = new Progress(response, {
                        throttle: 100
                    })
                    progress.on('progress', (p) => {
                        // console.log(
                        //     p.total,
                        //     p.done,
                        //     p.totalh,
                        //     p.doneh,
                        //     p.startedAt,
                        //     p.elapsed,
                        //     p.rate,
                        //     p.rateh,
                        //     p.estimated,
                        //     p.progress,
                        //     p.eta,
                        //     p.etah,
                        //     p.etaDate
                        // )
                        var eProg = document.getElementById('progress-' + currently_downloading);
                        var percentage = Math.round((p.done / p.total) * 100);
                        eProg.style.width = String(percentage) + '%';
                        if (p.done >= p.total) {
                            // Put installed on the button
                            e.classList.remove("active");
                            e.classList.add("finished");
                            e.innerText = 'Installed';
                        }


                    })
                    console.log(response);
                    if (response.ok) {
                        if (!fs.existsSync(Preferences.CC_PATH))
                            fs.mkdirSync(Preferences.CC_PATH);
                        return streamPipeline(response.body, fs.createWriteStream(Preferences.CC_PATH + '\\' + default_pack_info[currently_downloading].data.name));
                    }

                    throw new Error(`unexpected response ${response.statusText}`);
                })();

            }
        });
    }

    /* Create Popper */
    var button = document.getElementById('btnhome');
    var tooltip = document.getElementById('btnhome-tootlip');
    createPopper(button, tooltip, {
        placement: 'right-start',
    });
    
    button = document.getElementById('btnsettings');
    tooltip = document.getElementById('btnsettings-tootlip');
    createPopper(button, tooltip, {
        placement: 'right-start',
    });

    // Append language dropdown list
    const langFileNames = fs.readdirSync('./src/content/texts/').filter(f => f.endsWith('.json'))
    for (const file of langFileNames) {
        const langFile = require('./content/texts/' + file)
        const node = document.createElement('a')
        node.innerHTML = langFile.lang
        node.setAttribute('onclick',`setLanguage('${file.slice(0, -5)}',null,true);`)
        document.getElementById('langDropDown')
        .append(node)
    }

    //append preset themes
    const themeFileNames = fs.readdirSync('./src/content/preset_themes/').filter(f => f.endsWith('.json'))
    for (const file of themeFileNames) {
        const theme = require('./content/preset_themes/' + file)
        const node = document.createElement('a')
        node.innerHTML = theme.name
        node.setAttribute('onclick',`loadPresetTheme('${file}');`)
        document.getElementById('themeChooser')
        .append(node)
    }
}

// Project generation process
function generateProjectBPManifest(path, name, desc, uuidval, rp_uuid) {
    var src = "";
    src += `{
        "format_version": 2,
        "header": {
            "name": "` + name + `",
            "description": "` + desc + `",
            "uuid": "` + uuidval + `",
            "version": [
                1,
                0,
                0
            ],
            "min_engine_version": [
                1,
                13,
                0
            ]
        },
        "modules": [
            {
                "type": "data",
                "uuid": "` + uuid.v4() + `",
                "version": [
                    1,
                    0,
                    0
                ]
            }
        ]`
    if (rp_uuid != '') {
        src += `,
        "dependencies": [
            {
                "version": [
                    1,
                    0,
                    0
                ],
                "uuid": "` + rp_uuid + `"
            }
        ]`
    }
    src += `\n}`;
    fs.writeFileSync(path + '\\manifest.json', src);
}

function generateProjectRPManifest(path, name, desc, uuidval) {
    var src = "";
    src += `{
        "format_version": 2,
        "header": {
            "name": "` + name + `",
            "description": "` + desc + `",
            "uuid": "` + uuidval + `",
            "version": [
                1,
                0,
                0
            ],
            "min_engine_version": [
                1,
                13,
                0
            ]
        },
        "modules": [
            {
                "description": "` + desc + `",
                "type": "resources",
                "uuid": "` + uuid.v4() + `",
                "version": [
                    1,
                    0,
                    0
                ]
            }
        ]
    }`
    fs.writeFileSync(path + '\\manifest.json', src);
}

function generateNeccesaryRPFiles(path) {
    var list = [
        "animation_controllers",
        "animations",
        "attachables",
        "entity",
        "models",
        "particles",
        "render_controllers",
        "texts",
        "sounds",
        "textures",
        "textures\\blocks",
        "textures\\entity",
        "textures\\items",
        "textures\\models",
        "textures\\particle"
    ]
    for (const key in list) {
        if (list.hasOwnProperty(key)) {
            const element = list[key];
            fs.mkdirSync(path + '\\' + element);
        }
    }
    fs.writeFileSync(path + '\\textures\\item_texture.json', `{
    "resource_pack_name": "vanilla",
    "texture_name": "atlas.items",
    "texture_data": {
        
    }
}`);
    fs.writeFileSync(path + '\\textures\\terrain_texture.json', `{
    "resource_pack_name": "vanilla",
    "texture_name": "atlas.terrain",
    "padding": 8,
    "num_mip_levels": 4,
    "texture_data": {
        
    }
}`);
}

function generateNeccesaryBPFiles(path) {

    var list = [
        "entities",
        "items",
        "loot_tables",
        "recipes",
        "scripts",
        "scripts\\client",
        "scripts\\server",
        "spawn_rules",
        "trading"
    ]
    for (const key in list) {
        if (list.hasOwnProperty(key)) {
            const element = list[key];
            fs.mkdirSync(path + '\\' + element);
        }
    }
}

function makePackIcon(path) {
    fs.writeFileSync(path + '\\pack_icon.png', Preferences.CC_ICON, 'base64');
}

// Url to get default packs info
const RPURL = 'https://aka.ms/resourcepacktemplate';
const BPURL = 'https://aka.ms/behaviorpacktemplate';
const BETA_RPURL = 'https://aka.ms/MinecraftBetaResources';
const BETA_BPURL = 'https://aka.ms/MinecraftBetaBehaviors';

const default_pack_info = {
    RPURL: {
        id: 'RPURL',
        data: null,
        url: RPURL,
        installed: false
    },
    BPURL: {
        id: 'BPURL',
        data: null,
        url: BPURL,
        installed: false
    },
    BETA_RPURL: {
        id: 'BETA_RPURL',
        data: null,
        url: BETA_RPURL,
        installed: false
    },
    BETA_BPURL: {
        id: 'BETA_BPURL',
        data: null,
        url: BETA_BPURL,
        installed: false
    }
}

var currently_downloading = '';

function getDefaultPackInfo(par1url, par2reqid) {
    // Returns filename, download link, version, etc.
    // options = {
    //     method: 'GET',
    //     headers: {},        // request headers. format is the identical to that accepted by the Headers constructor (see below)
    //     body: null,         // request body. can be null, a string, a Buffer, a Blob, or a Node.js Readable stream
    //     redirect: 'follow', // set to `manual` to extract redirect headers, `error` to reject redirect
    //     signal: null,       // pass an instance of AbortSignal to optionally abort requests
    // };
    var options = url.parse(par1url);
    var request = https.request(options, response => {
        const packUrl = response.responseUrl;
        const list = packUrl.split('/');
        const name = list.pop();
        const ext = name.split('.').pop();

        // Removes the file extension
        var t = name.split('.');
        t.pop();
        t = t.join('.');

        // Get the version
        t = t.split('_');
        var version = t.pop();
        var info = {
            'name': name,
            'url': packUrl,
            'version': version,
            'extension': ext
        }
        onInfoReceived(par2reqid, info);

        // "https://meedownloads.blob.core.windows.net/worlds/Vanilla_Resource_Pack_1.16.0.zip"
    });
    request.end();
}

function onInfoReceived(id, data) {
    // On info received
    switch (id) {
        case 'RPURL':
            default_pack_info.RPURL.data = data;
            break;
        case 'BPURL':
            default_pack_info.BPURL.data = data;
            break;
        case 'BETA_RPURL':
            default_pack_info.BETA_RPURL.data = data;
            break;
        case 'BETA_BPURL':
            default_pack_info.BETA_BPURL.data = data;
            break;
    }

    // Checks if all data finished loading
    if (default_pack_info.RPURL.data != null && default_pack_info.BPURL.data != null &&
        default_pack_info.BETA_RPURL.data != null && default_pack_info.BETA_BPURL.data != null) {
        // Then refresh the info on settings page
        console.log('finished loading info');
        document.getElementById('rp_name').innerText = default_pack_info.RPURL.data.name;
        document.getElementById('rp_version').innerText = default_pack_info.RPURL.data.version;
        document.getElementById('bp_name').innerText = default_pack_info.BPURL.data.name;
        document.getElementById('bp_version').innerText = default_pack_info.BPURL.data.version;
        document.getElementById('beta_rp_name').innerText = default_pack_info.BETA_RPURL.data.name;
        document.getElementById('beta_rp_version').innerText = default_pack_info.BETA_RPURL.data.version;
        document.getElementById('beta_bp_name').innerText = default_pack_info.BETA_BPURL.data.name;
        document.getElementById('beta_bp_version').innerText = default_pack_info.BETA_BPURL.data.version;
        checkDefaultPacksInstalled();
    }
}

function checkDefaultPacksInstalled() {
    // Checks if the default packs is intstalled or not
    if (default_pack_info.RPURL.installed == false || default_pack_info.BPURL.installed == false ||
        default_pack_info.BETA_RPURL.installed == false || default_pack_info.BETA_BPURL.installed == false) {
        // If not installed, then checks for the zipfile existance, if exists, extract it

    }
}

function downloadFile(par1url, dest) {
    const options = url.parse(par1url);
    // The options argument is optional so you can omit it
    https.request(par1url);
}

// downloadFile('https://datahub.io/datahq/1mb-test/r/1mb-test.csv', 'D:\\Test.csv');
// (async () => {
// 	const response = await fetch('https://datahub.io/datahq/1mb-test/r/1mb-test.csv');

// 	console.log(response.ok);
// 	console.log(response.status);
// 	console.log(response.statusText);
// 	console.log(response.headers.raw());
// 	console.log(response.headers.get('content-type'));
// 	console.log(response.headers.get('content-length'));
// })();

function readJSONUncomment(string) {
    var result;
    try {
        result = JSON.parse(string.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));
    }catch(error){
        console.log("Error : " + error + string);
        result = {
            header : {
                name : "Unknown Pack",
                description : "failed to read manifest.json",
                uuid : "asdasdasdfasdfasdf"
            }
        }
        return result;
    }
    return result;
}
var LAYOUT_MODE = 1; // Grid
function setLayoutMode(id) {
    LAYOUT_MODE = id;
    refreshProjectMap();
}
/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function toggleDropdown1() {
    document.getElementById("themeDropdown").classList.toggle("show");
  }
  
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }
function set_ace_theme(name){
    // console.log(name);
    editor.setTheme("ace/theme/" + name);
    const elm = document.getElementById("themeDropdown");
    elm.querySelectorAll("a").forEach(queryElm=>{queryElm.classList.remove("selected")}); 
    var self = document.getElementById("theme-" + name);
    self.classList.add("selected");
    GlobalSettings.ace_theme = name;
    saveSettings();
}
function load_ace_themes(){
    var themelist = ace.require("ace/ext/themelist")
    var themes = themelist.themesByName //object hash of theme objects by name
    
    var elm = document.getElementById("themeDropdown");
    elm.innerHTML = "";
    Object.entries(themes).forEach(e=>{
        elm.innerHTML += `<a href="#" id="theme-${e[0]}" onclick="set_ace_theme('${e[0]}')">${e[1]["caption"]}</a>`
    });
}

function init_ace_themes(){
    set_ace_theme(GlobalSettings.ace_theme);
    load_themes();
}

var THEMES = {};
function load_themes(){
    fs.readdirSync("C:\\CoreCoder\\themes\\").forEach(file=>{
        if(file.endsWith(".json")){
            // Loads the theme
            var theme = file.split(".");
            theme.pop(); // remove the file extension
            THEMES[theme] = JSON.parse(fs.readFileSync("C:\\CoreCoder\\themes\\" + file));
        }
    });
    
    var elm = document.getElementById("themeChooser");
    elm.innerHTML = "";
    elm.innerHTML += `<a href="#" onclick="set_core_theme('default');reinitCustomizationPanel();">default</a>`
    Object.entries(THEMES).forEach(e=>{
        elm.innerHTML += `<a href="#" onclick="set_core_theme('${e[0]}');reinitCustomizationPanel();">${e[0]}</a>`
    });
}

function set_core_theme(name){
    if(name === "default")
        Object.assign(GlobalSettings,DefaultGlobalSettings);
    else
        Object.assign(GlobalSettings,THEMES[name]);
    set_ace_theme(GlobalSettings.ace_theme);
    initGlobalTheme();
}

// Auto updater part
const currentVersion = require("../src/current.json");
const notification = document.getElementById('notification');
const versionTitle = document.getElementById('versionTitle');
const viewButton = document.getElementById('restart-button');
var devlogURL = "";
function autoUpdate(){
    let updateURL = "https://raw.githubusercontent.com/Hanprogramer/CoreCoder-Releases/master/newest.json";
    let settings = { method: "Get" };
    console.log(currentVersion);
    fetch(updateURL, settings)
        .then(res => res.json())
        .then((json) => {
            if((json.versionMajor > currentVersion.versionMajor) || 
                (json.versionMajor >= currentVersion.versionMajor&&json.versionMinor > currentVersion.versionMinor) || 
                (json.versionMajor >= currentVersion.versionMajor&&json.versionMinor >= currentVersion.versionMinor&&json.versionBuilds > currentVersion.versionBuilds)
                ){
                        // If statement is a little compplicated, but it is what needs to be done
                        // There's an update;
                        console.log(json);
                        console.log(currentVersion);
                        notification.classList.remove('hidden');
                        versionTitle.innerText = json.changelogTitle;
                        if(json.devlogLink != undefined){
                            devlogURL = json.devlogLink;
                        }else{
                            devlogURL = "https://hanprog.itch.io/core-coder/";
                        }
            }
            else{
                console.log("no new update");
            }
        });
}

function openUpdateLink(){
    shell.openExternal(devlogURL);
}

function openDiscordURL(){
    shell.openExternal("https://discord.gg/UyyBkEMvmx");
}

function setLanguage(langname, caption, reload){
    reload = reload || false
    caption = caption || translations['lang']
    if(!reload) {
        translateDocument();
    }
    GlobalSettings.lang = langname;
    translations = require(`./content/texts/${GlobalSettings.lang}.json`);
    
    document.getElementById("dropdownlang").innerText = caption;
    saveSettings();
    if(reload) {
        location.reload()
    }
}

function loadPresetTheme(filename) {
    const theme = require('./content/preset_themes/' + filename)
    GlobalSettings.theme = theme.theme
    saveSettings()
    location.reload()
}

function toggleFullscreen(bool) {
    if (bool) {
        document.documentElement.requestFullscreen();
      } else if(document.fullscreenElement){
        document.exitFullscreen();
    }
    GlobalSettings.fullscreen = bool;
    saveSettings();
  }
  
autoUpdate();