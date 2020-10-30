const { BrowserWindow } = require('electron').remote;
const url = require('url');
const https = require('https');
const open = require("open");
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const { machine, machineSync } = require('node-unique-machine-id');
const gui = require('nw.gui');
itchAuthKey = "";

function itchIoAuth(){
    // Try to auth to itch io server
    win = nw.Window.open('https://itch.io/user/oauth?client_id=e022186f7c25195cf2e117cbd73eae20&scope=profile%3Ame&response_type=token&redirect_uri=https%3A%2F%2Fhanprogramer.github.io%2Ffinished_loading.html', {}, function(win) {});
    win.on('navigation', function(frame, url, policy) {
        console.log('New window is navigating');
      });
    contents = win.webContents;
    contents.once('will-redirect', (
        event ,
        _url ,
        isInPlace ,
        isMainFrame ,
        frameProcessId ,
        frameRoutingId) => {
            // If the page is failed to load
            var u = new url.URL(_url);
            // console.log(u);
            if(u.host == "hanprogramer.github.io"){
                // Authorized
                win.close();
                itchAuthKey = u.hash.split('=')[1];
                userid = '';
                https.get('https://itch.io/api/1/'+itchAuthKey+'/me', (resp) => {
                    let data = '';
                  
                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                      data += chunk;
                    });
                  
                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        user = JSON.parse(data).user;
                        userid = JSON.parse(data).user.id;
                        /* cover_url: "https://img.itch.zone/aW1nLzI5ODg3MjMucG5n/100x100%23/d8RLD%2B.png"
                        developer: true
                        display_name: "Hanprogramer"
                        gamer: true
                        id: 578399
                        press_user: false
                        url: "https://hanprog.itch.io"
                        username: "hanprog" */
                        // console.log(userid);

                        // GET succesfull, now try to get the download keys
                        var target = url.parse(url.format({
                            protocol: 'https',
                            hostname: 'itch.io',
                            pathname: '/api/1/'+asdasdkjfnerlnjeprjtwpotjpri+'/game/690184/download_keys',
                            query: {
                                user_id: userid
                            }
                        }));

                        https.get({
                            hostname: target.hostname,
                            path: target.path,
                        }, (resp) => {
                            let data = '';
                        
                            // A chunk of data has been recieved.
                            resp.on('data', (chunk) => {
                            data += chunk;
                            });
                        
                            // The whole response has been received. Print out the result.
                            resp.on('end', () => {
                                var obj = JSON.parse(data);
                                var userdata;
                                console.log(obj);
                                // Make sure he owns the download key
                                if('owner' in obj){
                                    if(obj.download_key.owner.id == userid){
                                        // Then accepts it as verified
                                        userdata = obj.download_key.owner;
                                        fs.writeFileSync("C:\\CoreCoder\\" + "lajniuhwqwrhq" + "wrhsldkfjnaew", getASklsfnaklnlqjw());
                                        window.location = "./welcome.html";
                                        localStorage.setItem('user_data', escape(JSON.stringify(userdata)));
                                    }
                                    console.log(obj);
                                }else{
                                    // Key not found, check if you're han
                                    if(userid == alksdjhsfhaksldjhfalskdhjfaj){
                                        userdata = user;
                                        fs.writeFileSync("C:\\CoreCoder\\" + "lajniuhwqwrhq" + "wrhsldkfjnaew", getASklsfnaklnlqjw());
                                        window.location = "./welcome.html";
                                        localStorage.setItem('user_data', escape(JSON.stringify(userdata)));
                                    }
                                }
                                /* cover_url: "https://img.itch.zone/aW1nLzI5ODg3MjMucG5n/100x100%23/d8RLD%2B.png"
                                developer: true
                                display_name: "Hanprogramer"
                                gamer: true
                                id: 578399
                                press_user: false
                                url: "https://hanprog.itch.io"
                                username: "hanprog" */
                                // console.log(userid);
                            });
                        
                        }).on("error", (err) => {
                            console.log("Error: " + err.message);
                        });
                    });
                  
                  }).on("error", (err) => {
                    console.log("Error: " + err.message);
                  });
            }else{
                win.loadFile('./content/pages/failed_to_load.html');
            }
        });
    // contents.once('did-finish-load', () => {
    //     // Start loading
    //     var u = new URL(win.getURL());
    //     console.log(u);
    //     if(u.host == "127.0.0.1:55888"){
    //         // Authorized
    //         win.close();
    //         console.log(u.hash);
    //     }
    // });
}


function initiateWelcomeScreen(){
    var userdata = JSON.parse(unescape(localStorage.getItem('user_data')));
    // Change data on next Window
    document.getElementById("nametag").innerText = userdata.username;
    document.getElementById("proftag").src = userdata.cover_url;
}
function getASklsfnaklnlqjw(){
    var id = String(machineSync(true));
    var c = String(JSON.stringify(os.userInfo())) + id;
    var mykey = crypto.createCipher('aes-128-cbc', c);
    var mystr = mykey.update(c, 'utf8', 'hex')
    mystr += mykey.final('hex');
    return mystr;
}
function onSuccess(){

}