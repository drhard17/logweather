const fs = require('fs')
const needle = require('needle')
const tempParser = require('./temp-parsers/accuweather-temp-parser.js')

function getLocations() {
    const locData = fs.readFileSync('../csv/locations-eng.txt', 'utf8')
    return locData.split('\r\n')
}

const locations = getLocations()//.slice(0, 10)

const opts = {
    accept: "text/plain",
    user_agent: "PostmanRuntime/7.22.0"
}

function getUrl() {
    loc = locations.shift()
    const initUrl = 'https://www.accuweather.com/web-api/autocomplete?query=' + loc + '&language=en-us'
    needle.get(initUrl, opts, function (error, response) {
        if (error || response.statusCode !== 200) {
            console.log(loc.toUpperCase(), error, response.statusCode)
            return
        }
        
        const name = response.body[0].localizedName.toLowerCase().replace(/\s/g, '-')
        const key = response.body[0].key
        const path = `/ru/ru/${name}/${key}/daily-weather-forecast/${key}`
        const URL = 'https://www.accuweather.com' + path
        
        console.log(loc, path)
        fs.appendFileSync('../csv/locations-accuweather.txt', path + '\r\n')
        
        if(locations.length) getUrl()

/*         
        needle.get(URL, opts, (err, res) => {
            const temp = tempParser.parseFunc(res.body)[0]
            console.log(temp, loc, path)
            if(locations.length) getUrl()
        })
*/        
        
    })
}

getUrl()

