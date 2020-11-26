const fsPromises = require('fs').promises
const bodyParser = require('body-parser')
const express = require('express')
const asyncHandler = require('express-async-handler')

const storage = require('./db-storage.js')
const logger = require('../crawler/cr-logger.js')
const bl = require('./chart-builder.js')
const { TempRecord } = require('./TempRecord.js')

const config = require('../config.json')
const locations = require('../locations.json')

const [ host, port ] = Object.values(config.webserver)

const app = express()

async function formSiteTemp(locId) {
    const location = locations.find(location => location.id === locId)
    serviceName = location.currentTempService || config.defaultForecastService
    const temp = await storage.getLastTemp(serviceName, locId)

    return temp > 0 ? '+' + temp : temp
}

function getLocServices(locId) {
    const location = locations.find(location => location.id === locId)
    const {sensors} = location
    const forecasts = Object.keys(location.routes)
    return sensors ? sensors.concat(forecasts) : forecasts
}

const logIP = function(req, res, next) {
    const ip = res.socket.remoteAddress
    console.log(`${ip} requested ${req.url}`)
    next()
}

app.engine('html', async(filePath, options, cb) => {
    const content = await fsPromises.readFile(filePath, 'utf-8')
    try {
        const siteTemp = await formSiteTemp(101)
        const locOptions = locations.map(location => {
            return `<option value=${location.id}>${location.name}</option>`
        }).join('\r\n')

        const rendered = content.toString()
            .replace('#temp#', siteTemp)
            .replace('#locations#', locOptions)
        return cb(null, rendered)
    } catch (err) {
        return cb(err.message)
    }
})

app.set('views', './frontend')
app.set('view engine', 'html')
app.use(logIP)
app.use(bodyParser.json());

app.use(express.static('./frontend/static'))
app.use(express.static('./node_modules/moment'))
app.use(express.static('./node_modules/chart.js/dist'))


app.post('/getchartdata', asyncHandler(async(req, res) => {
    res.type('json')
    const chartPoints = await bl.getChartPoints(req.body)
    res.send(JSON.stringify(chartPoints))
}))

app.post('/getlasttemp', asyncHandler(async(req, res) => {
    res.type('json')
    const siteTemp = await formSiteTemp(req.body.locId)
    res.send(JSON.stringify({temp: siteTemp}))
}))

app.post('/getlocservices', (req, res) => {
    res.type('json')
    console.log(req.body);
    const locServices = getLocServices(req.body.locId)
    res.send(JSON.stringify({locServices}))
})

app.post('/storesensordata', asyncHandler(async(req, res) => {
    res.type('json')
    const [name, locId, temp] = Object.values(req.body)
    try {
        const tempRecord = new TempRecord(new Date, name, locId, temp)
        await storage.storeTempRecords(tempRecord)
        logger.logSuccessStoring([tempRecord])
        res.send(JSON.stringify({response: 'Success!'}))
    } catch (err) {
        res.send({INVALID_REQUEST: err.message})
        res.status(422)
        console.log(err.message);
    }
}))

app.get('/crash', (req, res) => {
    process.exit(1)
})

app.get('/', (req, res) => {
    res.render('index')
});

app.listen(port, host, () => {
    console.log(`Express server running at http://${host}:${port}/`)
});