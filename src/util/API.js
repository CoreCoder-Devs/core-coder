//experimental no touchy qehutiphgiohwrgiowrgio
const download = require('download-file')
const fetch = require('node-fetch')

module.exports = {
    update: new class {
        constructor() {
            fetch('https://corecoder.skybird.ga/api/builds/latest')
            .catch(e => {
                if(e instanceof fetch.FetchError){
                    console.log(e)
                }
                console.log(e)
            })
            .then(res => res.json())
            .then(data => {
                /**
                 * An array of the latest build version, in x.x.x form.
                 */
                this.version = [data.versionMajor, data.versionMinor, data.versionBuilds]
                /**
                 * A string of the version name.
                 */
                this.tag = data.versionName
                /**
                 * A string of the nwjs version name.
                 */
                this.nwjs = data.nwjsVersion
                /**
                 * A URL of the download link
                 */
                this.url = data.releaseLink
                /**
                 * A boolean of whether or not this update should be forced
                 */
                this.forceUpdate = data.forceUpdate
            })
        }
    }
}


const url = "https://corecoder.skybird.ga/releases/cc-v1.5.1.zip"
 
download(url, {
        directory: ".",
        filename: "cc-1.5.zip"
    },
    (err) => {
        if (err) throw err
        console.log("done")
})