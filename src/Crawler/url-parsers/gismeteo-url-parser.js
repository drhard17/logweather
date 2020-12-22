const fs = require('fs')
const needle = require('needle')

function getLocations() {
    const locData = fs.readFileSync('../csv/locations-eng.txt', 'utf8')
    return locData.split('\r\n')
}

const locations = getLocations()

function getUrl() {
    loc = locations.shift()
    const initUrl = 'https://www.gismeteo.ru/api/v2/search/searchresultforsuggest/' + loc + '/?lang=ru&domain=ru'
    needle.get(initUrl, function (error, response) {
        if (error || response.statusCode !== 200) {
            console.log(loc.toUpperCase(), error, response.statusCode)
            return
        }
    
        const path = (response.body.items[0].url) + '10-days/'
        console.log(path)
        fs.appendFileSync('../csv/locations-gismeteo.txt', path + '\r\n')
        
        if(locations.length) getUrl()
    })
}

getUrl()
