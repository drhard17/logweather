const fs = require('fs')
const needle = require('needle')

function getLocations() {
    const locData = fs.readFileSync('../csv/locations-eng.txt', 'utf8')
    return locData.split('\r\n')//.slice(0, 10)
}

const locations = getLocations()

function getUrl() {
    loc = locations.shift()
    const initUrl = 'https://weather.com/api/v1/p/redux-dal'
    const body = `[{"name":"getSunV3LocationSearchUrlConfig","params":{"query":"${loc}","language":"en-US","locationType":"locale"}}]`
    const options = {
        headers: { 'content-type': 'application/json' },
        user_agent: 'PostmanRuntime/7.24.1',
      }

    needle.post(initUrl, body, options, function (error, response) {
        if (error || response.statusCode !== 200) {
            console.log(loc.toUpperCase(), error, response.statusCode)
            return
        }
        try {
            const placeId = response.body   
                .dal
                .getSunV3LocationSearchUrlConfig[`language:en-US;locationType:locale;query:${loc}`]
                .data
                .location
                .placeId[0]
            // console.log(loc + ': ' + placeId)
            console.log('/ru-RU/weather/tenday/l/' + placeId)
        } catch (error) {
            console.log(`${loc}: REJECTED: ${error.message}`)
        }
        //fs.appendFileSync('../csv/locations-gismeteo.txt', path + '\r\n')
        
        if(locations.length) getUrl()
    })
}

getUrl()
