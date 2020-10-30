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
PROJECTS_BP = [];
PROJECTS_RP = [];
PREFERENCES = {
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

function generateProjectHTML(proj_name, proj_folder, project_data) {
    var string_data = escape(JSON.stringify(project_data));
    var img = "content\\images\\024-question.png";
    var filter = true; // wether or not to filter linearly
    var pack_icon_path = Preferences.COM_MOJANG_PATH + '\\' + proj_folder + '\\' + 'pack_icon.png';
    // console.log(pack_icon_path);
    if (fs.existsSync(pack_icon_path)) {
        var size = imageSize(pack_icon_path);
        if (size.width < 128 || size.height < 128)
            filter = false;
        img = pack_icon_path;
    }
    var desc = project_data['description'];
    if(desc.length > 13){
        desc = desc.substr(0,13);
        desc += "...";
    }
    var template = `
    <div class="panel-back" data-project=` + string_data + `  onclick="window.location='./content/main.html'; localStorage.setItem('project_data', '` + string_data + `')">
        <div class="panel">
            <img class="minibutton" src="content/images/012-more.png" onclick="event.stopPropagation();openDeleteDlg(this)"/>
            <img class="icon" src="` + img + `" style="margin: 8px; min-width: 60px; height: 60px ` + (filter ? '' : "; image-rendering: pixelated") + `"></img>
            <div class="btnText">` + proj_name + `
                <span>` + desc + `</span>
            </div>
            <!-- <img class="minibutton" src="content/images/012-more.png" onclick="openRenameDlg()"/> -->
        </div>
    </div>
    `
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
        var data = getProjectManifestJSON('development_behavior_packs\\' + val);
        var dependencies = [];
        var desc = '';
        var name = '';
        if (data != null) {
            if (data['dependencies'])
                data['dependencies'].forEach(d => {
                    if (d['uuid']) {
                        var uuid = d['uuid'];
                        var p = getProjectWithUUID(PROJECTS_RP, uuid);
                        if (p != null) {
                            dependencies.push(p);
                        } else {
                            dependencies.push(uuid);
                        }
                    }
                });

            if (data["header"]["description"]) {
                // Remove minecraft color code
                desc = (data["header"]["description"]).replace(/\u00A7[0-9A-FK-OR]/ig, '');
                name = (data["header"]["name"]).replace(/\u00A7[0-9A-FK-OR]/ig, '');
            }
        }
        projects_dev.push({
            'name': name == '' ? val : name,
            'folder': 'development_behavior_packs\\' + val,
            'uuid': data == null ? null : data["header"]["uuid"],
            'dependencies': dependencies,
            'description': desc
        });
    });

    for (var i = 0; i < nodev_files.length; i++) {
        var data = getProjectManifestJSON('behavior_packs\\' + nodev_files[i]);
        var dependencies = [];
        var desc = '';
        var name = '';
        if (data != null) {
            if (data['dependencies'])
                data['dependencies'].forEach(d => {
                    if (d['uuid']) {
                        var uuid = d['uuid'];
                        var p = getProjectWithUUID(PROJECTS_RP, uuid);
                        if (p != null) {
                            dependencies.push(p);
                        } else {
                            dependencies.push(uuid);
                        }
                    }
                });

            if (data["header"]["description"]) {
                // Remove minecraft color code
                desc = (data["header"]["description"]).replace(/\u00A7[0-9A-FK-OR]/ig, '');
                name = (data["header"]["name"]).replace(/\u00A7[0-9A-FK-OR]/ig, '');
            }
        }
        projects.push({
            'name': name == '' ? nodev_files[i] : name,
            'folder': 'behavior_packs\\' + nodev_files[i],
            'uuid': data == null ? null : data["header"]["uuid"],
            'dependencies': dependencies,
            'description': desc
        });
    }

    var contstr = '';
    // Reading the pack name 
    contstr += "<h2>Development Packs</h2>";
    for (var p in projects_dev) {
        contstr += generateProjectHTML(projects_dev[p].name, projects_dev[p].folder, projects_dev[p]);
    }
    contstr += "<h2>Behavior Packs</h2>";
    for (var p in projects) {
        contstr += generateProjectHTML(projects[p].name, projects[p].folder, projects[p]);
    }

    var container = document.getElementById("proj_container");
    // console.log(container);
    container.innerHTML = contstr;
    PROJECTS_BP = projects;
}

function refreshRPMap(directoryPath) {
    var dev_files = listFiles(directoryPath + '\\development_resource_packs\\');
    var nodev_files = listFiles(directoryPath + '\\resource_packs\\');
    var projects = [];

    // Just showcasing 2 ways of doing foreach
    dev_files.forEach(function(val) {
        var data = getProjectManifestJSON('development_resource_packs\\' + val);
        projects.push({
            'name': val,
            'folder': 'development_resource_packs\\' + val,
            'uuid': data == null ? null : data["header"]["uuid"]
        });
    });

    for (var i = 0; i < nodev_files.length; i++) {
        var data = getProjectManifestJSON('resource_packs\\' + nodev_files[i]);
        console.log(data);
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

function getProjectWithUUID(arr, uuid) {
    // Returns the corresponding projects with the uuid provided
    for (var project in arr) {
        if (arr[project].uuid == uuid)
            return arr[project];
    };

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
    for (var i in close) {
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
    for (var i in close) {
        close[i].onclick = function() {
            modal.style.display = "none";
        }
    }

    var deleterp = document.getElementById("input-delete-rp");

    // For deleting the resource pack(All dependencies will be listed and deleted too)
    deleterp.addEventListener('change', (evt) => {
        var val = evt.target.checked;
        if (val) {
            var data = JSON.parse(unescape(evt.target.getAttribute('data-project')));
            var dependencies = [];
            for (var i = 0; i < data.dependencies.length; i++) {
                dependencies.push(data.dependencies[i].folder);
            }
            document.getElementById("a-delete-rp").innerText = dependencies.join('\n');
        } else {
            document.getElementById("a-delete-rp").innerText = '';
        }

    });
    var data = JSON.parse(unescape(elm.parentElement.parentElement.getAttribute('data-project')));
    deleterp.setAttribute('data-project', elm.parentElement.parentElement.getAttribute('data-project'));
    var folder = data.folder;
    document.getElementById("a-delete-bp").innerText = folder;
    var dependencies = [];

    for (var i = 0; i < data.dependencies.length; i++) {
        dependencies.push(data.dependencies[i].folder);
    }

    var deletebtn = document.getElementById("btn-delete-delete");
    deletebtn.addEventListener('click', (elm) => {
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
    for (var i in close) {
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

default_pack_info = {
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

currently_downloading = '';

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
        var url = response.responseUrl;
        var list = url.split('/');
        var name = list.pop();
        var ext = name.split('.').pop();

        // Removes the file extension
        var t = name.split('.');
        t.pop();
        t = t.join('.');

        // Get the version
        t = t.split('_');
        var version = t.pop();
        var info = {
            'name': name,
            'url': url,
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
    var options = url.parse(par1url);
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
LAYOUT_MODE = 1; // Grid
function setLayoutMode(id) {
    LAYOUT_MODE = id;
    refreshProjectMap();
}
