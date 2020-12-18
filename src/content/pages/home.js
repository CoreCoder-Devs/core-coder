const fs = require("fs");
const settings = require('../../global_settings')
const bookmark_dir = settings.appFolder + "\\bookmarks"
var cont = document.getElementById("bookmark");
function init(){
    cont = document.getElementById("bookmark");
    // Generate the bookmarks 
    if(!fs.existsSync(bookmark_dir)){
        fs.mkdirSync(bookmark_dir);
    }
    cont.innerHTML = "";
    fs.readdirSync(bookmark_dir).forEach(f => {
        if(f.endsWith(".json"))
            try{createBookmarkCard(JSON.parse(fs.readFileSync(bookmark_dir + "\\" + f)))} catch(e){console.log(e)};
    });
}

function createBookmarkCard(data){
    // Create a bookmark element and add it to the page
    var div = document.createElement("div");
    div.classList.add("card");
    div.addEventListener("click", (e)=>{
        // Open the link
        document.location = data["link"];
    });

    var img = document.createElement("img");
    img.src = "file://" + bookmark_dir + "\\" + data["icon"];
    img.style.imageRendering = "pixelated";

    var head = document.createElement("h1");
    head.innerText = data["name"];

    div.appendChild(img);
    div.appendChild(head);
    cont.appendChild(div);
}