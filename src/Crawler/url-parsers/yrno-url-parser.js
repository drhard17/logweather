const fs = require('fs')
const needle = require('needle')

function getYrnoUrl(locationName) {
    return new Promise((resolve, reject) => {
        const initUrl = 'https://www.yr.no/api/v0/locations/suggest?language=en&q=' + locationName
        needle.get(initUrl, (err, res) => {
            if (err || res.statusCode !== 200) {
                resolve(`${locationName.toUpperCase()}: request error`)
            }
            let result
            try {
                const apiLocation = res.body._embedded.location[0]
                result = `/en/forecast/daily-table/${apiLocation.id}/${apiLocation.urlPath}`  
            } catch (err) {
                result = `${locationName.toUpperCase()}: unknown location`
            } finally {
                resolve(result)
            }
        })
    })
}

(async () => {
    const locations = fs
        .readFileSync('../csv/locations-eng.txt', 'utf8')
        .split('\r\n')
    const jsonPath = '../src/locations.json'
    const locJSON = JSON.parse(fs.readFileSync(jsonPath))
    let i = 100
    for (const locName of locations) {
        const result = await getYrnoUrl(locName)
        locJSON[i - 100].routes.YRNO = result
        console.log(i + 1, result);
        i++  
    }
    fs.writeFileSync(jsonPath, JSON.stringify(locJSON))
})()
