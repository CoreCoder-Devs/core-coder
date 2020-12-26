const YAML = require('yaml')
const fs = require('fs')
const file = fs.readFileSync(require('electron').remote.app.getAppPath() + "/src/content/docs/doc.yaml", 'utf8');

module.exports = {
    /**
     * Search in documentation
     * @param {string} string string to search
     * @returns {object} array of entry obj
     */ 
    
    search: (string) => {
        let queryObj = []
        for(const [key, value] of Object.entries(YAML.parse(file))) {
            queryObj.push({
                entry: key,
                docs: value.text || "No documentation",
                type: value.doctype || "",
                link: value.url || "www.google.com"
            })
        }
        var result = queryObj.filter(e => e.entry.search(string) !== -1);
        return result;
    },
    searchAsync: (string) => {
        return new Promise((resolveFunction,rejectFunction) => {
            let queryObj = []
            for(const [key, value] of Object.entries(YAML.parse(file))) {
                queryObj.push({
                    entry: key,
                    docs: value.text || "No documentation",
                    type: value.doctype || "",
                    link: value.url || "www.google.com"
                })
            }
            var result = queryObj.filter(e => e.entry.search(string) !== -1);
            resolveFunction(result);
        });
    }
}