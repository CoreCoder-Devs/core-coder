function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
      elmnt = z[i];
      /*search for elements with a certain atrribute:*/
      file = elmnt.getAttribute("w3-include-html");
      if (file) {
        /* Make an HTTP request using the attribute value as the file name: */
        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
            /* Remove the attribute, and call this function once more: */
            elmnt.removeAttribute("w3-include-html");
            includeHTML();
          }
        }
        xhttp.open("GET", file, true);
        xhttp.send();
        /* Exit the function: */
        return;
      }
    }
}


function pathIsBP(path) {
	return (path.includes('behavior_packs') || path.includes('development_behavior_packs'));
}

function pathIsRP(path) {
	return (path.includes('resource_packs') || path.includes('development_resource_packs'));
}

function readProjectData() {
	var data = JSON.parse(unescape(localStorage.getItem("project_data")));
	// console.log(data);
	project_info["bp_folder"] = Preferences.COM_MOJANG_PATH + '\\' + data['folder'];
	project_info["bp_name"] = data['name'];

	if (data["dependencies"].length > 0) {
		project_info["rp_folder"] = Preferences.COM_MOJANG_PATH + '\\' + data['dependencies'][0].folder;
		project_info["rp_name"] = data['dependencies'][0].name;
  }
  titleBar.updateTitle(`${project_info["bp_name"]} - CoreCoder`);
  titleBar.updateIcon(unescape(project_info["bp_folder"]).replace(/\\/gi, "/") + '/pack_icon.png');
}
function readJSONUncomment(string) {
  var result;
  // console.log(string);
  try {
      result = JSON.parse(string.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m));
  }catch(error){
      console.log("Error : " + error + string);
      result = null;
  }
  return result;
}