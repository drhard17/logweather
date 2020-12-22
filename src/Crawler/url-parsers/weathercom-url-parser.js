const fs = require('fs')
const needle = require('needle')

function getLocNames() {
    const locData = fs.readFileSync('./locations.json', 'utf8')
    const locations = JSON.parse(locData)
    return locations.map(location => location.name).slice(0, 10)
}

const initUrl = 'https://weather.com/api/v1/p/redux-dal'
const options = {
    headers: { 'content-type': 'application/json' },
    user_agent: 'PostmanRuntime/7.24.1',
}

const locData = fs.readFileSync('./locations.json', 'utf8')
let locations = JSON.parse(locData)

async function getUrl() {
    for (let location of locations) {
                
        const locName = location.name
        const body = `[{"name":"getSunV3LocationSearchUrlConfig","params":{"query":"${locName}","language":"en-US","locationType":"locale"}}]`
        
        const response = await needle('post', initUrl, body, options)  

        try {
            const placeId = response.body   
                .dal
                .getSunV3LocationSearchUrlConfig[`language:en-US;locationType:locale;query:${locName}`]
                .data
                .location
                .placeId[0]
            
            const timeZone = response.body   
                .dal
                .getSunV3LocationSearchUrlConfig[`language:en-US;locationType:locale;query:${locName}`]
                .data
                .location
                .ianaTimeZone[0]
                
            // console.log('/ru-RU/weather/tenday/l/' + placeId)
            console.log(`${locName}: ${timeZone}`);
            location.timeZone = timeZone
        } catch (error) {
            if (response.statusCode !== 200) {
                console.log(locName.toUpperCase(), error, response.statusCode)
                return
            }
            console.log(`${locName}: REJECTED: ${error.message}`)
        }
    }
    const result = JSON.stringify(locations)
    fs.writeFileSync('./locations-tz.json', result)
}

getUrl()
