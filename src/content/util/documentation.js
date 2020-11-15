const YAML = require('yaml')
const fs = require('fs')

function searchQuery(string){
    let queryObj = []
    const file = fs.readFileSync("./src/content/docs/molang.yaml", 'utf8')
    //TODO: path somehow incorrect
    for(const [key, value] of Object.entries(YAML.parse(file))) {
        queryObj.push({
            entry: key,
            docs: value
        })
    }
    return queryObj.filter(e => e.entry.search(string) !== -1)
}

module.exports = {
    /**
     * Search in documentation
     * @param {string} string string to search
     * @param {string} type Type of doc, any of molang/entity
     * @returns {object} array of entry obj
     */ 
    search: (string, type) => {
        switch(type) {
            case 'molang':
                return searchQuery(string);
            case 'entity':
                break;
        }
    }
}