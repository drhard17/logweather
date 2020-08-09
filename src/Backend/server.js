const fs = require('fs')
const fsPromises = require('fs').promises
const bodyParser = require('body-parser')
const express = require('express')
const asyncHandler = require('express-async-handler')

const storage = require('./db-storage.js')
const logger = require('../crawler/cr-logger.js')
const bl = require('./chart-builder.js')
const { TempRecord } = require('./TempRecord')

const config = require('../config.json')
const locations = require('../locations.json')

const hostname = config.webserver.host;
const port = config.webserver.port;

const app = express()

async function formSiteTemp(serviceName, locId) {
    const temp = await storage.getLastTemp(serviceName, locId)
    return temp > 0 ? '+' + temp : temp
}

const storeTemp = async function(req, res, next) {
    const { temp } = req.query
    if (temp) {
        const tr = new TempRecord(new Date(), 'STREET', 101, parseInt(temp, 10))
        try {
            await storage.storeTempRecords(tr)
            logger.logSuccessStoring([tr])
        } catch (err) {
            logger.logStorageError(err)
        }
    }
    next()
}

const logIP = function(req, res, next) {
    const ip = res.socket.remoteAddress
    console.log(`${ip} requested ${req.url}`)
    next()
}

app.engine('html', async(filePath, options, cb) => {
    const content = await fsPromises.readFile(filePath, 'utf-8')
    try {
        const siteTemp = await formSiteTemp('STREET', 101)
        
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
app.use(storeTemp)
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
    const siteTemp = await formSiteTemp(req.body.service, req.body.locId)
    res.send(JSON.stringify({temp: siteTemp}))
}))

app.get('/', (req, res) => {
    res.render('index')
});

app.listen(port, hostname, () => {
    console.log(`Express server running at http://${hostname}:${port}/`)
});


