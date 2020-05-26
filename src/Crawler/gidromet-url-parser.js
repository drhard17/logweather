const fs = require('fs')
const needle = require('needle')

function getLocations() {
    const locData = fs.readFileSync('../csv/locations-rus.txt', 'utf8')
    return locData.split('\r\n').map(city => encodeURI(city))//.slice(0, 10)
}

const locations = getLocations()

function getUrl() {
    loc = locations.shift()
    const initUrl = 'http://www.meteorf.ru/ajax/change_user_location_autocomplete.php?term=' + loc + '&country=0'
    needle.get(initUrl, function (error, response) {
        if (error || response.statusCode !== 200) {
            console.log(loc.toUpperCase(), error, response.statusCode)
            return
        }
        
        try {
            const path = JSON.parse(response.body)[0].value
            console.log(decodeURI(loc) + ': ' + path)
        } catch (error) {
            console.log(decodeURI(loc) + ': REJECTED')            
        }
        //fs.appendFileSync('../csv/locations-gismeteo.txt', path + '\r\n')
        
        if(locations.length) getUrl()
    })
}

getUrl()
