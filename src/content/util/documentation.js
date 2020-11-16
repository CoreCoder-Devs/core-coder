const YAML = require('yaml')
const fs = require('fs')


module.exports = {
    /**
     * Search in documentation
     * @param {string} string string to search
     * @returns {object} array of entry obj
     */ 
    search: (string) => {
        let queryObj = []
        const file = fs.readFileSync("./src/content/docs/doc.yaml", 'utf8')
        for(const [key, value] of Object.entries(YAML.parse(file))) {
            queryObj.push({
                entry: key,
                docs: value.text,
                type: value.doctype,
                link: value.url
            })
        }
        return queryObj.filter(e => e.entry.search(string) !== -1)
    }
}