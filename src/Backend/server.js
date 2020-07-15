const fs = require('fs')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const storage = require('./db-storage.js')
const bl = require('./chart-builder.js')
const { TempRecord } = require('./TempRecord')

const config = JSON.parse(fs.readFileSync('./config.json'))
const locations = JSON.parse(fs.readFileSync('./locations.json'))

const hostname = config.webserver.host;
const port = config.webserver.port;

const storeTemp = function(req, res, next) {
    const temp = req.query.temp
    if (temp) {
        const tr = new TempRecord(new Date(), 'STREET', 101, parseInt(temp, 10))
        storage.storeTempRecords(tr)
        console.log(`Added temp: ${temp}`)
    }
    next()
}

const logIP = function(req, res, next) {
    const ip = res.socket.remoteAddress
    console.log(`${ip} requested ${req.url}`)
    next()
}

app.engine('html', (filePath, options, cb) => {
    fs.readFile(filePath, (err, content) => {
        if (err) return cb(new Error(err))

        storage.getLastTemp('STREET', 101, (err, temp) => {
            if (err) return cb(new Error(err))

            if (temp > 0) {
                temp = '+' + temp
            }
            
            const locOptions = locations.map(location => {
                return `<option value=${location.id}>${location.name}</option>`
            }).join('\r\n')
                
            const rendered = content.toString()
                .replace('#temp#', temp)
                .replace('#locations#', locOptions)
            return cb(null, rendered)
        })
    })
})

app.set('views', './frontend')
app.set('view engine', 'html')
app.use(logIP)
app.use(storeTemp)
app.use(bodyParser.json());

app.use(express.static('./frontend/static'))
app.use(express.static('./node_modules/moment'))
app.use(express.static('./node_modules/chart.js/dist'))

app.post('/getchartdata', (req, res) => {
    console.log(`XHR recieved: ${req.xhr}`)
    res.type('json')
    bl.getChartPoints(req.body, (err, data) => {
        if (err) {
            res.send(err)
            return
        }
        res.send(JSON.stringify(data))
    })
})

app.post('/getlasttemp', (req, res) => {
    console.log(`XHR recieved: ${req.xhr}`)
    res.type('json')
    storage.getLastTemp(req.body.service, req.body.locId, (err, temp) => {
        if (err) return cb(new Error(err))
        if (temp > 0) {
            temp = '+' + temp
        }
        res.send(JSON.stringify({temp}))
    })
})

app.get('/', (req, res) => {
    res.render('index')
});

app.listen(port, hostname, () => {
    console.log(`Express server running at http://${hostname}:${port}/`)
});


