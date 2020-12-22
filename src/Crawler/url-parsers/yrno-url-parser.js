const fs = require('fs')
const needle = require('needle')

function getLocations() {
    const locData = fs.readFileSync('../csv/locations-eng.txt', 'utf8')
    return locData.split('\r\n')
}

const locations = getLocations()

function getUrl() {
    loc = locations.shift()
    const initUrl = 'https://www.yr.no/_/websvc/jsonforslagsboks.aspx?s=' + loc + '&s1t=&s1i=&s2t=&s2i='

    //https://www.yr.no/_/websvc/jsonforslagsboks.aspx?s=helsinki&s1t=&s1i=&s2t=&s2i=

    needle.get(initUrl, function (error, response) {
        if (error || response.statusCode !== 200) {
            console.log(loc.toUpperCase(), error, response.statusCode)
            return
        }

        try {
            const path = (response.body[1][0][1]) + 'long.html'
            console.log(path)
            fs.appendFileSync('../csv/locations-yrno.txt', path + '\r\n')
        } catch (error) {
            const str = `${loc.toUpperCase()}: reject`
            console.log(str)            
            fs.appendFileSync('../csv/locations-yrno.txt', str + '\r\n')
        }
        
        if(locations.length) getUrl()
    })
}

getUrl()
