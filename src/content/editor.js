const fs = require("fs");
const util = require("util");
// Convert readFile, writeFile into Promise version of same
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const imageSize = require('image-size');
const tokenizer = require('json-tokenizer');
var getFavicons = require('get-website-favicon')
var getTitleAtUrl = require('get-title-at-url');
const translations = require(`./texts/${GlobalSettings.lang}.json`)

t = tokenizer();
let openedBrowser = -1; //1 - BP; 0 - RP
let items_source = {}; // contains source file, ace sessions, saved state
webviews = [];
// TEMPLATE
/*{
    type : "ace",
    data : {
        source : content,
        session : new EditSession(content),
        saved : true,
        filename : filename,
        readonly : false,
        path : path
    }
};*/
/*{
    type : "web",
    data : {
        url : "https://www.google.com/",
        icon: "path to image",
        title: "Web Browser",
        webview : DIV ELEMENT
    }
};*/

let open_tabs = {}; // key: path, value: [tab el, content type, content element]

let project_info = {
	rp_folder: "",
	bp_folder: "",
	bp_name: "",
	rp_name: "",
	format_version: "1.14"
};


clipboard_path = ''; // Used to copy / cut / paste file in the filebrowser
cut = false;
viewingpath = ''; // either the value of project_info[bp_folder] or the rp_folder
relativePath = ['', '']; // Relative path from the current opened project dir, accessor: openedBrowser
contextobj = undefined; // The context menu browseritem

fileIcons = {
	'.png': 'images/017-mountain.png',
	'.json': 'images/snippet.png',
};

folderIcon = 'images/015-folder.png';
items_texture = {};
items_identifier_textures = {};
blocks_texture = {};
blocks_texture_identifier = {};
function refreshCurrentItemTextures(){
	// refresh by reading the "items_texture.json"
	if(typeof(project_info["rp_folder"]) === "undefined")
		return;
	var path = project_info["rp_folder"] + "\\textures\\item_texture.json"
	if(fs.existsSync(path)){
		items_texture = {};
		var items = {};
		try{
			items = JSON.parse(fs.readFileSync(project_info["rp_folder"] + "\\textures\\item_texture.json"));
		}catch(e){
			/// TODO: give errors when this file can't be read
			console.log(e);
		}
		var textures = items["texture_data"];
		for(var t in textures){
			if(Array.isArray(textures[t].textures))
				items_texture[t] = textures[t].textures[0] + ".png";
			else
				items_texture[t] = textures[t].textures + ".png";
		};
		//console.log(items_texture);
	}

	/// Reads the items in the resource pack
	var dir = project_info["rp_folder"] + "\\items\\";
	var arr = listFilesRecursive(dir);
	for(var p in arr){
		var path = arr[p];
		if(path.endsWith(".json")){
			try{
				/// If file in the "items" folder
				var obj = readJSONUncomment(fs.readFileSync(path).toString());
				/// TODO: Checks for format version
				if(obj["format_version"] === "1.16.100" || obj["format_version"] === "1.16.200" || obj["minecraft:item"]["components"]["minecraft:icon"]["texture"] !== undefined){
					items_identifier_textures[obj["minecraft:item"]["description"]["identifier"]] = obj["minecraft:item"]["components"]["minecraft:icon"]["texture"];
					// console.log(obj);
				}else
				items_identifier_textures[obj["minecraft:item"]["description"]["identifier"]] = obj["minecraft:item"]["components"]["minecraft:icon"];
			}catch(e){
				console.log(e);
				continue;
			}
		}
		// console.log(path);
	}
}
function refreshCurrentBlockTextures(){
	// refresh by reading the "items_texture.json"
	if(typeof(project_info["rp_folder"]) === "undefined")
		return;
	var path = project_info["rp_folder"] + "\\textures\\terrain_texture.json"
	if(fs.existsSync(path)){
		blocks_texture = {};
		var items = {};
		try{
			items = JSON.parse(fs.readFileSync(project_info["rp_folder"] + "\\textures\\item_texture.json"));
		}catch(e){
			/// TODO: give errors when this file can't be read
			console.log(e);
		}
		var textures = items["texture_data"];
		for(var t in textures){
			if(Array.isArray(textures[t].textures))
				items_texture[t] = textures[t].textures[0] + ".png";
			else
				items_texture[t] = textures[t].textures + ".png";
		};
		//console.log(items_texture);
	}

	/// Reads the items in the resource pack
	var dir = project_info["rp_folder"] + "\\items\\";
	var arr = listFiles(dir);
	for(var p in arr){
		var path = dir + arr[p];
		if(path.endsWith(".json")){
			try{
				/// If file in the "items" folder
				var obj = readJSONUncomment(fs.readFileSync(path).toString());
				/// TODO: Checks for format version
				items_identifier_textures[obj["minecraft:item"]["description"]["identifier"]] = obj["minecraft:item"]["components"]["minecraft:icon"];
			}catch(e){
				console.log(e);
				continue;
			}
		}
		// console.log(path);
	}
}
function itemNamespaceToTexturePath(name){
	/// Converts item namespace to item texture path (absolute)
	var r = items_texture[items_identifier_textures[name]];
	if(r == undefined){
		return "images/snippet.png";
	}else
		return project_info["rp_folder"] + "/" +  r;
}
function itemNamespaceToTexturePath_1_16_100(icon){
	/// Converts item namespace to item texture path (absolute)
	var r = items_texture[icon];
	if(r == undefined){
		return "images/snippet.png";
	}else
		return project_info["rp_folder"] + "/" +  r;
}

function getItemNamespace(obj){
	// Reads item identifier from JSON object
	return obj["minecraft:item"]["description"]["identifier"];
}
function getItemIcon(obj){
	/// Item Icon (1.16.100+) from JSON object
	return obj["minecraft:item"]["components"]["minecraft:icon"]["texture"];
}

function absoluteToRelativePath(path, path_parent){
	/// Extract relative path to a file
	return path.substring(path_parent.length);
}

function createNewFile() {
	if (!project_info["rp_folder"] && openedBrowser == 0) {
		// If no resource pack and opening RP browser
		return;
	}
	var container = document.getElementById("browsercontent");
	var input = document.createElement('input');
	input.classList.add('browserinput');
	input.type = 'text';
	input.setAttribute('tabindex', '-1');
	input.addEventListener('focusout', function(evt) {
		var text = evt.target.value;
		createEmptyFile(text);
		regenerateTree();
	});
	input.addEventListener('keydown', function(evt) {
		if (evt.key == 'Enter') {
			var text = evt.target.value;
			createEmptyFile(text);
			regenerateTree();
		}
	});

	container.appendChild(input);
	input.focus();
}

function createNewFolder() {
	if (!project_info["rp_folder"] && openedBrowser == 0) {
		// If no resource pack and opening RP browser
		return;
	}
	var container = document.getElementById("browsercontent");
	var input = document.createElement('input');
	input.classList.add('browserinput');
	input.type = 'text';
	input.setAttribute('tabindex', '-1');
	input.addEventListener('focusout', function(evt) {
		var text = evt.target.value;
		createEmptyFolder(text);
		regenerateTree();
	});
	input.addEventListener('keydown', function(evt) {
		if (evt.key == 'Enter') {
			var text = evt.target.value;
			createEmptyFolder(text);
			regenerateTree();
		}
	});

	container.appendChild(input);
	input.focus();
}

function dupplicateClicked(defaultFilename, src) {
	// Optional arguments
	defaultFilename = typeof defaultFilename !== 'undefined' ? defaultFilename : '';
	src = typeof src !== 'undefined' ? src : '';

	if (!contextobj) return console.log('Object to dupplicate is undefined');
	var path = contextobj.getAttribute('data-path').split('\\');
	var filename = path.pop();
	path = path.join("\\");

	var container = document.getElementById("browsercontent");
	var input = document.createElement('input');
	input.classList.add('browserinput');
	input.type = 'text';
	input.value = defaultFilename;
	input.setAttribute('tabindex', '-1');
	input.addEventListener('focusout', function(evt) {
		var text = evt.target.value;
		if (text !== '') {
			if (src == '')
				dupplicatePath(path + '\\' + filename, path + '\\' + text);
			else
				dupplicatePath(src, getCurrentOpenedFolderPath() + '\\' + text);
		}
		regenerateTree();
	});
	input.addEventListener('keydown', function(evt) {
		if (evt.key == 'Enter') {
			var text = evt.target.value;
			if (text !== '') {
				if (src == '')
					dupplicatePath(path + '\\' + filename, path + '\\' + text);
				else
					dupplicatePath(src, getCurrentOpenedFolderPath() + '\\' + text);
			}
			regenerateTree();
		}
	});

	container.appendChild(input);
	input.focus();
}

function deleteClicked() {
	if (!contextobj) return console.log('Object to delete is undefined');
	var path = contextobj.getAttribute('data-path');
	deleteFile(path);
	regenerateTree();
}

function revealClicked() {
	if (!contextobj) return console.log('Object to view is undefined');

	// Pop the last item in the path
	var path = contextobj.getAttribute('data-path').replace(/\//g, '\\');
	while (path.includes('\\\\')) {
		path = path.replace(/\\\\/g, '\\');
	}
	// path = path.split('\\');
	// path.pop();
	// path = path.join('\\');
	// console.log('explorer.exe /select, "'+path+'"');
	require('child_process').exec('explorer.exe /select, "' + path + '"');
	regenerateTree();
}

function revealCurrentFolder() {
	if (!contextobj) return console.log('Object to view is undefined');

	// Pop the last item in the path
	var path = normalizePath(getCurrentOpenedFolderPath());
	require('child_process').exec('explorer.exe /select, "' + path + '"');
	regenerateTree();
}

function copy(path, newpath) {
	if (fs.statSync(path).isDirectory())
		copyDir(path, newpath, '');
	else
		fs.copyFileSync(path, newpath);
}

// Context Menu part 1
// Copy
function copyClicked() {
	if (!contextobj) return console.log('Object to selected is undefined');
	var path = contextobj.getAttribute('data-path');
	clipboard_path = path;
	cut = false;
	regenerateTree();
}
// Cut
function cutClicked() {
	if (!contextobj) return console.log('Object to selected is undefined');
	var path = contextobj.getAttribute('data-path');
	clipboard_path = path;
	cut = true;
	regenerateTree();
}
// Paste
function pasteClicked() {
	if (!contextobj) return console.log('Object to selected is undefined');
	var path = contextobj.getAttribute('data-path');
	var folder = popOnPath(path);

	if (path == clipboard_path || popOnPath(clipboard_path) == folder) {
		dupplicateClicked(getFilenameFromPath(clipboard_path));
	} else {
		copy(clipboard_path, folder + '\\' + getFilenameFromPath(clipboard_path));
		if (cut) {
			deleteFile(clipboard_path);
		}
	}
}

function pasteCurrentFolder() {
	// Paste from clipboard into the current opened folder
	if (!contextobj) return console.log('Object to view is undefined');

	// Pop the last item in the path
	var path = normalizePath(getCurrentOpenedFolderPath());
	var filename = getFilenameFromPath(clipboard_path);
	var target = path + '\\' + filename;

	if (!fs.existsSync(target)) {

		dupplicatePath(clipboard_path, target);
		if (cut) {
			deleteFile(clipboard_path);
		}
		regenerateTree();
	} else
		dupplicateClicked(filename, clipboard_path);
}

function saveCurrentFile() {
	var current = items_source[chromeTabs.activeTabEl.id].data;
	if (current.path == null) {
		// Means the file is untitled
		return;
	} else {
		// Save to the path
		var content = current.session.getValue();
		fs.writeFileSync(current.path, content);
		current.saved = true;
		var rel = absoluteToRelativePath(current.path, pathIsBP(current.path)? project_info["bp_folder"] : project_info["rp_folder"]);
		if(rel.startsWith("\\items")){
			refreshCurrentItemTextures();
		}
		// Updates the tab title
		var prop = JSON.parse(unescape(chromeTabs.activeTabEl.getAttribute('data-properties-original')));
		// console.log(prop);
		chromeTabs.updateTab(chromeTabs.activeTabEl, {
			title: prop.title,
			favicon: prop.favicon,
			noclose: prop.noclose
		});
	}

	regenerateTree();
}
function createEmptyFile(filename) {
	if (filename == '') return;
	var path = viewingpath + '\\' + relativePath[openedBrowser] + '\\' + filename;
	if (!fs.existsSync(path)) {
		try {
			if (filename.endsWith('.json'))
				fs.writeFileSync(path, '{\n\t\n}');
			else
				fs.writeFileSync(path, '');
		} catch (e) {
			console.log(e);
		}
	}
	openFile(path);
}

function createEmptyFolder(filename) {
	var path = viewingpath + '\\' + relativePath[openedBrowser] + '\\' + filename;
	if (!fs.existsSync(path)) {
		try {
			fs.mkdirSync(path);
		} catch (e) {
			console.log(e);
		}
	}
}

function dupplicatePath(path, newpath) {
	if (fs.existsSync(newpath)) return console.log('file already exists, dupplication canceled');
	if (path === newpath) return;

	if (fs.statSync(path).isDirectory()) {
		// Dupplicate a folder
		copyDir(path, newpath, '');
	} else {
		// Dupplicate a file
		fs.copyFileSync(path, newpath);
	}
}

function deleteFile(path) {
	if (fs.statSync(path).isDirectory()) {
		fs.rmdirSync(path, {
			recursive: true
		});
	} else {
		fs.unlinkSync(path);
	}
}

function copyDir(path, newpath, relativePath) {
	// Copy all files synchronously
	// TODO: Make the asynchronous version
	// If empty then returns
	if (path == '') return [];

	if (!fs.existsSync(newpath + '\\' + relativePath)) {
		fs.mkdirSync(newpath + '\\' + relativePath);
	}
	var files = fs.readdirSync(path + '\\' + relativePath);
	files.forEach(file => {
		let stat = fs.lstatSync(path + '\\' + relativePath + '\\' + file);
		if (stat.isDirectory()) {
			// Recursive!
			copyDir(path, newpath, relativePath + '\\' + file);
		} else {
			// Copyfile!
			fs.copyFileSync(path + '\\' + relativePath + '\\' + file, newpath + '\\' + relativePath + '\\' + file);
		}
	});
}

function _createNewFile() {
	chromeTabs.addTab({
		title: 'Untitled',
		favicon: "images/025-files-and-folders.png"
	});
	//console.log(chromeTabs.tabEls);

	// Giving the tab an unique id
	let div = chromeTabs.activeTabEl;
	div.id = "tab_" + new Date().getTime().toString();
	items_source[div.id] = {
        type : "ace",
        data : {
            source: "",
            session: new EditSession("{\n\t\n}", "ace/mode/javascript"),
            saved: true,
            filename: "",
            readonly: false,
            path: null
        }
	};
	items_source[div.id].data.session.setUndoManager(new UndoManager());
	items_source[div.id].data.session.on('change', function(delta) {
		// delta.start, delta.end, delta.lines, delta.action
		onSessionChange(delta, this);
	});
	setEditSession(div.id);
	// Move the cursor position
	editor.focus();
	editor.gotoLine(2, 3, true);
	//console.log(div);

	if (editor) {
		var edit = document.getElementById("editor");
		if (edit.style.display === "none") {
			edit.style.display = "block";
		}
	}
}

function setEditSession(par1str) {
	// editor = ace.edit('editor')
	var session = items_source[par1str].data.session;
	editor.setSession(session);
}


function loadPreferences() {

}

function saveFile() {
	_saveFile("", "");
}

function _saveFile(path, source) {

}


/* * UI JAVSCRIPT CODES * */

function openPrefModal() {
	// Get the modal
	var modal = document.getElementById("prefmodal");

	// Open the modal
	modal.style.display = "block";

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		modal.style.display = "none";
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
}

function openBrowser(id) {
	var midpane = document.getElementById("midpane");
	var content = document.getElementById("content");
	var rpbtn = document.getElementById("openRPBrowser");
	var bpbtn = document.getElementById("openBPBrowser");
	var elem_editor = document.getElementById("editor");

	// Get the current  button
	var current = (id == 1) ? bpbtn : rpbtn;
	if (midpane.style.display === "none") {
		midpane.style.display = "block";
		midpane.style.width = "250px";
		content.style.left = "calc(var(--left_panel_size) + 250px)";
		elem_editor.style.left = "calc(var(--left_panel_size) + 250px)";
		elem_editor.style.right = "0";
		content.style.right = "0";

		openedBrowser = id;
		rpbtn.classList.remove('active');
		bpbtn.classList.remove('active');
		current.classList.add('active');
		regenerateTree();
	} else {
		if (openedBrowser == id) {
			// the browser already opened, close it
			midpane.style.display = "none";
			midpane.style.width = "0";
			content.style.left = "var(--left_panel_size)";
			elem_editor.style.left = "var(--left_panel_size)";
			elem_editor.style.right = "0";
			content.style.right = "0";
			openedBrowser = -1;
			rpbtn.classList.remove('active');
			bpbtn.classList.remove('active');
		} else {
			// Switch the browser if the id is different
			openedBrowser = id;
			rpbtn.classList.remove('active');
			bpbtn.classList.remove('active');
			current.classList.add('active');
			viewingpath = project_info["bp_folder"];
			regenerateTree();
		}
	}
	/// Force chrometabs to refresh its new size
	chromeTabs.layoutTabs();
}

function toggleMidPane() {
	var midpane = document.getElementById("midpane");
	var content = document.getElementById("content");
	var elem_editor = document.getElementById("editor");
	if (midpane.style.display === "none") {
		midpane.style.display = "block";
		midpane.style.width = "250px";
		content.style.left = "calc(var(--left_panel_size) + 250px)";
		elem_editor.style.left = "calc(var(--left_panel_size) + 250px)";
		elem_editor.style.right = "0";
		content.style.right = "0";
	} else {
		midpane.style.display = "none";
		midpane.style.width = "0";
		content.style.left = "var(--left_panel_size)";
		elem_editor.style.left = "var(--left_panel_size)";
		elem_editor.style.right = "0";
		content.style.right = "0";
	}
	/// Force chrometabs to refresh its new size
	chromeTabs.layoutTabs();
}

function initTitleBar() {
	const customTitlebar = require('custom-electron-titlebar');
	let isElectron = require("is-electron");

	if (isElectron()) {
		//console.log("Electron aww yeahhh !");
		new customTitlebar.Titlebar({
			backgroundColor: customTitlebar.Color.fromHex('#0d0d0d'),
			icon: "../resources/icon.png"
		});
	} else {
		//console.log("Running in other platform as a normal browser");
		document.documentElement.style.setProperty('--top_padding', '0px');
		
	}
}

function notif() {

}

function initTreeCaret() {
	var toggler = document.getElementsByClassName("caret");
	var i;

	for (i = 0; i < toggler.length; i++) {
		toggler[i].addEventListener("click", function() {
			var parent = this.parentElement.querySelector(".nested");
			if (!parent) return;
			parent.classList.toggle("active");
			this.classList.toggle("caret-down");
		});
	}
}


function listFolders(path) {
	if (path == '') return [];
	// console.log('Listing..' + path)
	var result = [];
	//passsing directoryPath and callback function
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
	var files = fs.readdirSync(path);
	files.forEach(file => {
		let stat = fs.lstatSync(path + '\\' + file);
		if(stat.isDirectory())
			result.push(file);
	});
	return result;
}
function listFiles(path, filesOnly) {
	if (path == '') return [];
	// console.log('Listing..' + path)
	var result = [];
	//passsing directoryPath and callback function
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
	var files = fs.readdirSync(path);
	files.forEach(file => {
		if(filesOnly){
			let stat = fs.lstatSync(path + '\\' + file);
			if(stat.isDirectory() == false)
				result.push(file);
		}else
			result.push(file);
	});
	return result;
}
function listFilesRecursive(path) {
	if (path == '') return [];
	// console.log('Listing..' + path)
	var result = [];
	//passsing directoryPath and callback function
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
	var files = fs.readdirSync(path);
	files.forEach(file => {
		let stat = fs.lstatSync(path + '\\' + file);
		if(stat.isDirectory()){
			result = result.concat(listFilesRecursive(path + '\\' + file));
		}else
			result.push(path + '\\' + file);
	});
	return result;
}


function goUpOne() {
	var l = relativePath[openedBrowser].split('\\');
	l.pop();
	relativePath[openedBrowser] = l.join('\\');

	document.getElementById("browserpath").innerText = relativePath[openedBrowser];
}

function goInFolder(_name) {
	var name = unescape(_name);
	relativePath[openedBrowser] += (relativePath[openedBrowser].endsWith('\\') ? name : ('\\' + name));
}

function openFile(_path) {
	if (_path === '') return;
	if(_path.endsWith(".png") || _path.endsWith(".jpeg") || _path.endsWith(".bmp"))
	{
		// Opens a new tab with png image viewer
		var path = normalizePath(unescape(_path));
		var wv = openWebBrowser("file:///" + path, true);
	}
	else{
		var content = '';
		var path = normalizePath(unescape(_path));
		if (path in open_tabs) {
			chromeTabs.setCurrentTab(open_tabs[path]);
			return;
		}
		// console.log(fs.existsSync(path));
		// if(!fs.existsSync(path)) return;
		// if(fs.statSync(path).isDirectory()) return;

		try {
			content = fs.readFileSync(path, 'utf-8');
		} catch (e) {
			console.log(e);
		}
		// Creates a new tab and ace session
		var filename = path.split('\\').pop();
		// Opens a file in a new folder
		var favicon_path = "images/025-files-and-folders.png";
		var rel = "";
		if(pathIsBP(path))
			rel = absoluteToRelativePath(path, project_info["bp_folder"]);
		else
			rel = absoluteToRelativePath(path, project_info["rp_folder"]);
		
		if(rel.startsWith("\\items"))
		try{
			var obj = readJSONUncomment(content);
			
			if(obj["format_version"] === "1.16.100" && obj["minecraft:item"]["description"]["identifier"]){ 
					img = itemNamespaceToTexturePath_1_16_100(obj["minecraft:item"]["components"]["minecraft:icon"]["texture"]);
					favicon_path = normalizePath(unescape(itemNamespaceToTexturePath_1_16_100(getItemIcon(obj)))).replace(/\\/gi, "\\\\");
			}else
			if(obj["minecraft:item"]["description"]["identifier"])
				favicon_path = normalizePath(unescape(itemNamespaceToTexturePath(getItemNamespace(obj)))).replace(/\\/gi, "\\\\");
			custom = true;
		}catch(error){
			console.log(error);
		}
		chromeTabs.addTab({
			title: filename,
			favicon: favicon_path
		});

		// Giving the tab an unique id
		let div = chromeTabs.activeTabEl;
		div.id = "tab_" + new Date().getTime().toString();
		open_tabs[path] = div;
		items_source[div.id] = {
			type : "ace",
			data : {
				source: content,
				session: ace.createEditSession(content), //new EditSession(content, "ace/mode/javscript"),
				saved: true,
				filename: filename,
				readonly: false,
				path: path
			}
		};

		if (filename.endsWith('.json') || filename.endsWith('.js')) {
			items_source[div.id].data.session.setMode("ace/mode/javascript");
		}

		// Creates separate undo manager
		items_source[div.id].data.session.setUndoManager(new ace.UndoManager());
		items_source[div.id].data.session.on('change', function(delta) {
			// delta.start, delta.end, delta.lines, delta.action
			onSessionChange(delta, this);
		});
		setEditSession(div.id);
		//console.log(div);

		if (editor) {
			var edit = document.getElementById("editor");
			if (edit.style.display === "none") {
				edit.style.display = "block";
			}

			// Get the autocompletions
			// console.log(path);
			// console.log(getAutoCompletion(path));
			CURRENT_AUTOCOMP = getAutoCompletion(path);
			var autocomp = AUTOCOMP.default;
			var wordList = Object.keys(autocomp);
			var map = wordList.map(function(word) {
				return {
					caption: word,
					value: word,
					meta: autocomp[word]
				};
			});
			staticWordCompleter = {
				getCompletions: function(editor, session, pos, prefix, callback) {
					callback(null, map);
				}
			}
			editor.completers = [staticWordCompleter]
		}
	}
}

function openWebBrowser(url, image=false){
    /// Open a web browser in a new tab// Opens a file in a new folder
	chromeTabs.addTab({
		title: "Web Browser",
		favicon: "images/web.png"
	});
	chromeTabs.emit("activeTabChange", chromeTabs.activeTabEl);
	// Giving the tab an unique id
	let div = chromeTabs.activeTabEl;
	div.id = "tab_" + new Date().getTime().toString();
    
    // Creates a web browser
	document.getElementById("navBar").style.visibility = "visible";
    var par = document.getElementById("divMain");
    var wv = document.createElement("webview");
    wv.classList.add("tabcontent");
	wv.setAttribute("src", url);
	
	wv.tabEl = chromeTabs.activeTabEl;
    initWebView(wv, image);
    par.appendChild(wv);
    
    // Store the data
	items_source[div.id] = {
        type : "web",
        data : {
            url : url,
            webview : wv
        }
    };
    webviews = webviews.concat(wv);
}

function onSessionChange(delta, session) {
	// console.log(delta);
	// console.log(chromeTabs.activeTabEl);
	var content = unescape(chromeTabs.activeTabEl.getAttribute('data-properties-original'));
	// console.log(content);
	var prop = JSON.parse(content);
	chromeTabs.updateTab(chromeTabs.activeTabEl, {
		title: prop.title + '*',
		favicon: prop.favicon,
		noclose: prop.noclose
	});
	items_source[chromeTabs.activeTabEl.id].data.saved = false;
}

function generateFileItemEl(name, path) {
	var p = normalizePath(path).substring(openedBrowser == 1? project_info["bp_folder"].length : project_info["rp_folder"].length);
	if (name == '..') {
		return `
        <div class="flex-hor filebrowseritem" data-path="` + path + `" onclick="goUpOne(); regenerateTree();">
            <a>` + name + `</a>
        </div>`;
	} else {
		var img = 'images/025-files-and-folders.png';
		if (fs.lstatSync(path).isDirectory()) {
			img = folderIcon;
			if(openedBrowser == 1){
				/// Behavior packs
				if(p == "\\items")
					img = "images/folder-item.png";
				else if(p == "\\blocks")
					img = "images/folder-blocks.png"
				else if(p == "\\entities")
					img = "images/folder-entity.png"
				else if(p == "\\functions")
					img = "images/folder-commands.png"
				else if(p == "\\texts")
					img = "images/folder-book.png"
				else if(p == "\\loot_tables")
					img = "images/folder-chest.png"
				else if(p == "\\biomes")
					img = "images/folder-tree.png"
			}
			else if(openedBrowser == 0){
				/// Resource packs
				if(p == "\\items")
					img = "images/folder-item.png";
				else if(p == "\\blocks")
					img = "images/folder-blocks.png"
				else if(p == "\\entity")
					img = "images/folder-entity.png"
				else if(p == "\\functions")
					img = "images/folder-commands.png"
				else if(p == "\\texts")
					img = "images/folder-book.png"
			}
			var val = `
            <div class="flex-hor filebrowseritem" data-path="` + path + `" onclick=\'goInFolder("` + escape(name) + `"); regenerateTree();\'"\>
                <img src="` + img + `"/>
                <a>` + name + `</a>
            </div>`;
			// console.log(val);
			return val;
		} else if (name.endsWith('.png')) {
			img = 'file:///' + path;
			return `
            <div class="flex-hor filebrowseritem" data-path="` + path + `" onclick="openFile('` + escape(path) + `');">
                <img src="` + img + `" style="image-rendering: pixelated"/>
                <a>` + name + `</a>
            </div>`;
		} else {
			var custom = false;
			if(p.startsWith("\\items\\") && p.endsWith(".json") && typeof(project_info["rp_folder"]) != "undefined"){
				/// If file in the "items" folder
				try{
					var obj = readJSONUncomment(fs.readFileSync(path).toString());
					/// TODO: Checks for format version
					// console.log(obj["minecraft:item"]["description"]["identifier"]);
					if(obj["format_version"] === "1.16.100"){
						if(obj["minecraft:item"]["description"]["identifier"])
							img = itemNamespaceToTexturePath_1_16_100(obj["minecraft:item"]["components"]["minecraft:icon"]["texture"]);
					}else
					if(obj["minecraft:item"]["description"]["identifier"])
						img = itemNamespaceToTexturePath(obj["minecraft:item"]["description"]["identifier"]);
					custom = true;
				}catch(e){
					console.log(e);
					img = "images/file-error.png"
					custom = true;
				}
			}else if(p.endsWith(".json")){
				try{
					readJSONUncomment(fs.readFileSync(path).toString());
				}catch(e){
					img = "images/file-error.png"
					custom = true;
					/// TODO: add to error files list
					console.log(e);
				}
			}
			if(!custom)
			for (var i in fileIcons) {
				if (name.endsWith(i)) {
					img = fileIcons[i];
					break;
				}
			}
			return `
            <div class="flex-hor filebrowseritem" data-path="` + path.replace(/\\/g, '\\\\') + `" onclick="openFile('` + escape(path) + `');">
                <img src="` + img + `"/>
                <a>` + name + `</a>
            </div>`;
		}
	}
}

function getIcon(path) {
	// Get icon by using the path's file extension 
	var img = 'images/025-files-and-folders.png';

	if (fs.lstatSync(path).isDirectory()) {
		img = folderIcon;
	} else
		for (var i in fileIcons) {
			if (path.endsWith(i)) {
				img = fileIcons[i];
				break;
			}
		}

	return img;
}

function regenerateTree() {
	if (openedBrowser == -1)
		return;
	var treeContainer = document.getElementById("browsercontent");

	document.getElementById("browserpath").innerText = relativePath[openedBrowser];
	document.getElementById("midpaneTitle").innerText = openedBrowser == 1 ? translations['editor.sidebar.behaviour'] : translations['editor.sidebar.resource'];

	if (!project_info["rp_folder"] && openedBrowser == 0) {
		// If no resource pack and opening RP browser
		treeContainer.innerHTML = '<a style="color: white; margin: 8px; margin: 0;">' + translations["editor.sidebar.resourceNotFound"] + '<a/>';
		return;
	}

	// Clears the html code for the list
	treeContainer.innerHTML = "";

	var path = getCurrentOpenedFolderPath();
	var html = relativePath[openedBrowser] == '' ? '' : generateFileItemEl('..', '');
	var folderList = listFolders(path);
	for (var f in folderList) {
		html += generateFileItemEl(folderList[f], path + '\\' + folderList[f]);
	}
	var fileList = listFiles(path, true);
	for (var f in fileList) {
		html += generateFileItemEl(fileList[f], path + '\\' + fileList[f]);
	}

	// Add it to the page
	treeContainer.innerHTML = html;

	// Add aditional footer below to detect nonfile context menu
	// treeContainer.innerHTML += '<div style="flex-grow: 1" id="browserfooter"></div>';
	initBrowserContextMenu();

	var context = document.getElementById('contextNonFile');
	treeContainer.addEventListener('contextmenu', function(e) {
		// // Prevent the other context menu to show up
		var context1 = document.getElementById('contextFile');
		if (context1.style.display == "block") {
			return;
		}
		context.style.left = String(Math.min(e.x, window.innerWidth - context.offsetWidth)) + 'px';
		context.style.top = String(Math.min(e.y, window.innerHeight - context.offsetHeight)) + 'px';
		context.style.display = "block";

		// The paste button
		var ePaste = document.getElementById("contextPaste");

		if (clipboard_path == '') {
			ePaste.classList.add('locked');
		} else {
			ePaste.classList.remove('locked');
		}
	});
	// generateFromList(fileList, ul);

	// initTreeCaret();
	// console.log(treeContainer);
	// console.log(project_info['bp_folder'] + '\\' + relativePath);
}

function getCurrentOpenedFolderPath() {
	var path = '';
	if (openedBrowser == 1) {
		viewingpath = project_info["bp_folder"];
		path = project_info['bp_folder'] + '\\' + relativePath[openedBrowser];
	} else if (openedBrowser == 0) {
		viewingpath = project_info["rp_folder"];
		path = project_info['rp_folder'] + '\\' + relativePath[openedBrowser];
	}
	return path;
}

function normalizePath(path) {
	// Normalizes a path so it's ready to use even on commands prompt
	if (path == null) return console.log('NormalizePathError: path is null');
	r = path;
	while (r.includes('\\\\')) {
		r = r.replace(/\\\\/g, '\\');
	}
	return r.replace(/\//g, '\\');
}

function getFilenameFromPath(path) {
	return normalizePath(path).split('\\').pop();
}

function popFromPath(path) {
	path = normalizePath(path).split('\\');
	return path.pop();
}

function popOnPath(path) {
	path = normalizePath(path).split('\\');
	path.pop();
	return path.join('\\');
}

function initBrowserContextMenu() {
	var items = document.querySelectorAll('.filebrowseritem');
	var context = document.getElementById('contextFile');
	for (i = 0; i < items.length; i++) {
		items[i].addEventListener('contextmenu', function(e) {

			// Prevent the other context menu to show up
			var context1 = document.getElementById('contextNonFile');
			if (context1.style.display == "block")
				context1.style.display = "none";

			context.style.left = String(Math.min(e.x, window.innerWidth - context.offsetWidth)) + 'px';
			context.style.top = String(Math.min(e.y, window.innerHeight - context.offsetHeight)) + 'px';
			context.style.display = "block";
			contextobj = this;

			// Display the file stats
			var eIcon = document.getElementById("fileStat").children[0];
			var eName = document.getElementById("fileStat").children[1];
			// document.getElementById("fileStat").children[2]; - SEPARATOR
			var eSize = document.getElementById("fileStat").children[3];
			var ePaste = document.getElementById("contextPaste");

			var p = normalizePath(this.getAttribute('data-path'));
			var filename = getFilenameFromPath(p);
			var stat = fs.statSync(p);

			eName.innerText = filename;
			eSize.innerText = String((stat.size / 1000).toFixed(1)) + 'kb';
			eIcon.setAttribute('src', getIcon(p));

			if (clipboard_path == '') {
				ePaste.classList.add('locked');
			} else {
				ePaste.classList.remove('locked');
			}

		});
	}

	document.addEventListener('keyup', function(e) {
		if (e.keyCode === 27) {
			hideBrowserContext();
		}
	});
	document.addEventListener('click', function(e) {
		// if((e.which || e.button) === 1){
		// }
		hideBrowserContext();
	});
	window.addEventListener('resize', function(e) {
		hideBrowserContext();
	});

}

function hideBrowserContext() {
	var context1 = document.getElementById('contextFile');
	context1.style.display = "none";
	var context2 = document.getElementById('contextNonFile');
	context2.style.display = "none";
}

function generateFromList(list, listElement) {
	for (item in list) {
		if (typeof list[item] === "string") {
			// Add it to the list
			listItem = document.createElement("li");

			span = document.createElement("span");
			span.innerText = list[item];
			listItem.appendChild(span);
			listElement.appendChild(listItem);
		} else if (Array.isArray(list[item])) {
			// Recursive!
			var li = document.createElement('li');
			var span = document.createElement('span');
			span.classList.add('caret');
			span.innerText = list[item][0];
			li.appendChild(span);
			var ul = document.createElement('ul');
			ul.classList.add('nested');
			li.appendChild(ul);
			listElement.appendChild(li);

			generateFromList(list[item][1], ul);
		}
	}
}

AUTOCOMP = {
	bp_item: {},
	rp_item: {},
	items_texture: {},
	bp_block: {},
	rp_block: {},
	block_texture: {},
	manifest_rp: {},
	manifest_bp: {},
	bp_entity: {},
	rp_entity: {},
	biome_features: {},
	functionpack: {},
	molang: {},
	animations: {},
	render_controllers: {},
	animation_controllers: {},
	scripting: {},
	default: {}
};

CURRENT_AUTOCOMP = {};

function getAutoCompletion(filepath) {
	// Get autocompletion sets from the file location, filename, etc.
	var filename = getFilenameFromPath(filepath);
	var parent_path = popOnPath(filepath);
	var parent_folder = popFromPath(parent_path);
	var is_bp = pathIsBP(filepath);

	// console.log(parent_folder);
	// console.log(is_bp);

	// If the file is manifest.json
	if (filename == "manifest.json") {
		if (is_bp)
			return AUTOCOMP.manifest_bp;
		else
			return AUTOCOMP.manifest_rp;
	}

	// If the file is an item
	if (parent_folder == "items") {
		if (is_bp)
			return AUTOCOMP.bp_item;
		else
			return AUTOCOMP.rp_item;
	}

	// If the file is a block
	// UNIMPLEMENTED

	// If the file is an entity
	if (parent_folder == 'entities') {
		if (is_bp)
			return AUTOCOMP.bp_entity;
		else
			return AUTOCOMP.rp_entity;
	}

	// If the file is a scriptin api file
	if (filename.endsWith('.js')) {
		return AUTOCOMP.scripting;
	}

	return {
		'true': 'bool',
		'false': 'bool'
	};
}

function readAutocompletionFile() {
	var path = Preferences.CC_PATH + '\\autocomp.json';
	if (fs.existsSync(path)) {
		AUTOCOMP = JSON.parse(fs.readFileSync(path));
		// console.log(AUTOCOMP);
	} else {
		// If doesn't exists, then create it
		fs.writeFileSync(path, JSON.stringify(AUTOCOMP));

		// Then tries to fetch it from the internet
		// TODO
	}
}

function init() {
	// Run after the entire editor finished loading
	document.getElementById("editor").style.display = "none";
	document.getElementById("navBar").style.visibility = "collapse";

	ace.config.loadModule('ace/ext/language_tools');
	// Initialization
	initTreeCaret();
	readProjectData();
	regenerateTree();
	refreshCurrentItemTextures();
	openBrowser(1);
	// Editor Autocomplete
	// editor.commands.bindKey("ctrl-space", "startAutocomplete") // do nothing on ctrl-space
	// editor.commands.addCommand({
	// 	name: "autocompleteCustom",
	// 	bindKey: {
	// 		win: "ctrl-space"
	// 	},
	// 	exec: function(e) {
	// 		refreshCurrentAutoComp();
	// 		e.commands.byName.startAutocomplete.exec(e);
	// 	}
	// });
	// Execute a function when the user releases a key on the keyboard
	var input = document.getElementById("navBarInput");
	input.addEventListener("keyup", function(event) {
		// Number 13 is the "Enter" key on the keyboard
		if (event.keyCode === 13) {
			// Cancel the default action, if needed
			event.preventDefault();
			if(!(input.value.startsWith("https://") || input.value.startsWith("file://") || input.value.startsWith("http://")))
				input.value = "https://" + input.value
			items_source[chromeTabs.activeTabEl.id].data.webview.src = input.value;
			//items_source[chromeTabs.activeTabEl.id].data.webview.reload();
		}
	});
	readAutocompletionFile();
}

function getCurrentAutoCompletePath(pos) {
	var index = editor.session.doc.positionToIndex(pos);
	var source = editor.getValue().substring(0, index);
	var path = [];
	var level = 0;

	// Iterate through the file
	for (var i = 0; i < source.length; i++) {
		if (source[i] == "{") {

		}
	}

	return path;
}


function refreshCurrentAutoComp() {
	var autocomp = Object.assign(AUTOCOMP.default, CURRENT_AUTOCOMP);
	var wordList = Object.keys(autocomp);
	var map = wordList.map(function(word) {
		return {
			caption: word,
			value: word,
			meta: autocomp[word]
		};
	});
	staticWordCompleter = {
		getCompletions: function(editor, session, pos, prefix, callback) {
			var path = console.log(getCurrentAutoCompletePath(pos));
			console.log(path);
			callback(null, map);
		}
	}
	editor.completers = [staticWordCompleter]
}


function initWebView(webview, image) {
	// Allow permissions on a <webview>
	// webview.addEventListener('permissionrequest', function(e) {
	// 	if (e.permission === 'media' || e.permission === 'download') {
	// 		e.request.allow();
	// 	}
	// });
	// Allow creating a new window
	webview.setAttribute("disablewebsecurity", "");
	webview.setAttribute("nodeintegration", "");
	webview.setAttribute("plugins", "");
	
	webview.addEventListener('console-message', (e) => {
		if(e.message.startsWith("xCORCOD")){
			var msg = e.message.split(" ")[1];
			if(msg == "zoomout"){
				currentWebBrowserZoomOut();
			}
			else if(msg == "zoomin"){
				currentWebBrowserZoomIn();
			}
		}else
		console.log('WebBrowser:', e.message)
	});
	webview.addEventListener('dom-ready', function(e) {
		// Set the user agent to prevent errors
		webview.setUserAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko");
		webview.insertCSS('::-webkit-scrollbar{width:15px}::-webkit-scrollbar-track{background:rgba(0,0,0,0)}::-webkit-scrollbar-thumb{background:#555;background:rgba(85,85,85,.5)}::-webkit-scrollbar-thumb:hover{background:#888;background:rgba(136,136,136,.5)}');
		if(image){
			webview.insertCSS('img{image-rendering: pixelated}');
			webview.setZoomFactor(20);
		}
		webview.executeJavaScript(`
		window.addEventListener('wheel', (event) => {
			if(event.ctrlKey){
				if(event.deltaY > 0)
					console.log("xCORCOD zoomin");
				if(event.deltaY < 0)
					console.log("xCORCOD zoomout");
			}
		});
		`);
	});
	webview.addEventListener('new-window', function(e) {
		openWebBrowser(e.url);
	});
	webview.addEventListener("did-start-loading", (e) => {
		/// When loads starts
		if(chromeTabs.activeTabEl == webview.tabEl){
			/// If is the active tab
			if(e.url != "undefined")
				document.getElementById("navBarInput").value = e.url;
		}
		chromeTabs.setFavicon(webview.tabEl, "images/loading.gif");
		getTitleAtUrl(webview.src, function(title){
			if(title != "undefined"){
				chromeTabs.setTitle(webview.tabEl, title);
			}
		});
	})
	webview.addEventListener("did-stop-loading", (e) => {
		/// When loads stops
		if(chromeTabs.activeTabEl == webview.tabEl){
			/// If is the active tab
			if(webview.src != "undefined")
				document.getElementById("navBarInput").value = webview.src;
		}
		getFavicons(webview.src).then(data=>{
			if(data["icons"].length > 0)
				chromeTabs.setFavicon(webview.tabEl, data["icons"][0]["src"]);
			else
				chromeTabs.setFavicon(webview.tabEl, "https://s2.googleusercontent.com/s2/favicons?domain_url=" + webview.src);
		});
	});
	webview.addEventListener("did-fail-load", (e) => {
		/// When loads failed
		webview.loadURL(__dirname + "/pages/failed_to_load.html");
	});

	webview.addEventListener('crashed', (e)=>{
		// 
		webview.loadURL(__dirname + "/pages/failed_to_load.html");
	});
	webview.addEventListener("page-title-updated", (title, explicitSet) => {
		if(explicitSet)
			chromeTabs.setTitle(webview.tabEl, title);
		else
			chromeTabs.setTitle(webview.tabEl, webview.src);
	});
	webview.addEventListener("page-favicon-updated", (favicons) => {
		if(favicons.length > 0)
			chromeTabs.setFavicon(webview.tabEl, data["icons"][0]["src"]);
		else
			chromeTabs.setFavicon(webview.tabEl, "https://s2.googleusercontent.com/s2/favicons?domain_url=" + webview.src);
	});
}

function currentWebBrowserZoomIn(){
	// Zoom in on the current webview
	var wv = items_source[chromeTabs.activeTabEl.id].data.webview;
	wv.setZoomFactor(wv.getZoomFactor() + .1);
	if(wv.getZoomFactor() > 30)
		wv.setZoomFactor(30);
}
function currentWebBrowserZoomOut(){
	// Zoom in on the current webview
	var wv = items_source[chromeTabs.activeTabEl.id].data.webview;
	wv.setZoomFactor(wv.getZoomFactor() - .1);
	if(wv.getZoomFactor() < 0.1)
		wv.setZoomFactor(0.1);
}

function reloadBrowser(){
	/// Reload the currently opened browser
	items_source[chromeTabs.activeTabEl.id].data.webview.reload();
}

function stopBrowser(){
	/// Stop the currently loading browser
	items_source[chromeTabs.activeTabEl.id].data.webview.stop();
}

function browserGoHome(){
	// var __dirname = document.location.origin;
	// console.log(__dirname +'/src/content/tabs-demo.html');
	// items_source[chromeTabs.activeTabEl.id].data.webview.src = __dirname +'/src/content/tabs-demo.html';

	items_source[chromeTabs.activeTabEl.id].data.webview.loadURL("file://" + __dirname + "\\pages\\home.html");
}

function browserExecute(webview, string){
	/// Load string into the <webview>
	webview.executeScript(InjectDetails(string), (result) => {
		/// Result
		console.log(result);
	});
}

function browserLoadFromString(webview, string){
	/// Load string into the <webview>
	webview.executeScript(InjectDetails(string), (result) => {
		/// Result
		console.log(result);
	});
}
const bookmark_dir = "C:\\CoreCoder\\bookmarks\\";
function addBookmark(){
	// Add the current web browser opened url to bookmarks
	var i = 0;
	var filename = bookmark_dir + String(i) + ".json";
	while(fs.existsSync(filename)){
		i++;
		filename = bookmark_dir + String(i) + ".json";
	}
	console.log(i);

	var webview = items_source[chromeTabs.activeTabEl.id].data.webview;
	getFavicons(webview.src).then(data=>{
		var url = new URL(webview.src);
		if(data["icons"].length > 0)
			downloadSimple(data["icons"][0]["src"], bookmark_dir + String(i) + ".png", function(){
				// Fetch the favicon, then downloads it, either way, will still write the bookmark
			});
		else{
			// Download from google
			downloadSimple("https://s2.googleusercontent.com/s2/favicons?domain=" + url.host, bookmark_dir + String(i) + ".png", function(){
				// Fetch the favicon, then downloads it, either way, will still write the bookmark
			});
		}
		fs.writeFileSync(bookmark_dir + String(i) + ".json", JSON.stringify({
			"name" : urlToHostName(url.hostname),
			"desc" : url.href,
			"icon" : String(i) + ".png",
			"link" : url.href
		}));
	});
}
function capitalizeFirstLetter(string) {
	if(string == undefined)
		return "undefined";
	return string.charAt(0).toUpperCase() + string.slice(1);
}
var http = require('http');
var https = require('https');
function downloadSimple(url, dest, cb) {
	var file = fs.createWriteStream(dest);
	var module = null;
	if(url.startsWith("https"))
		module = https;
	else
		module = http;
	var request = module.get(url, function(response) {
	  response.pipe(file);
	  file.on('finish', function() {
		file.close(cb);  // close() is async, call cb after close completes.
	  });
	}).on('error', function(err) { // Handle errors
	  fs.unlink(dest); // Delete the file async. (But we don't check the result)
	  if (cb) cb(err.message);
	});
  };


  function urlToHostName(str){
	  const prefix = [
		  "www","m"
	  ];
	  const suffix = [
		  "co","id","com","net","org","github","io","wordpress","blogspot"
	  ];
	  var result = "";
	  var s = false;
	  str.split(".").forEach(word => {
			if(!s){
				s = true;
			}else{
				result += " ";
			}
		  if(!(prefix.includes(word) || suffix.includes(word))){
			result += capitalizeFirstLetter(word);
		  }
	  });
	  return result;
  }