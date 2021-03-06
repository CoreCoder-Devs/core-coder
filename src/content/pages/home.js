const fs = require("fs");
const {settings} = require('../../global_settings')
const bookmark_dir = settings.appFolder + "\\bookmarks"
async function init(){
    const cont = document.getElementById("bookmark");
    settings.initGlobalTheme()
    // Generate the bookmarks 
    if(!fs.existsSync(bookmark_dir)){
        fs.mkdirSync(bookmark_dir);
    }
    cont.innerHTML = "";
    const bookmark_files = await fs.readdirSync(bookmark_dir).filter(f => f.endsWith('.json'))
    console.log(bookmark_files)
    if(!bookmark_files.length) {
        const text = document.createElement('div')
        text.innerHTML = "<h6 style=\"margin-block-start: 0;\">You do not have any bookmarks yet.</h6>"
        cont.appendChild(text)
    }
    else {
        bookmark_files.forEach(f => {
            try{createBookmarkCard(JSON.parse(fs.readFileSync(bookmark_dir + "\\" + f)))} catch(e){console.log(e)};
        });
    }
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

    var head = document.createElement("h5");
    head.innerText = data["name"];

    div.appendChild(img);
    div.appendChild(head);
    cont.appendChild(div);
}