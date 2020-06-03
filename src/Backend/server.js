const fs = require('fs')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const storage = require('./csv-storage.js')
const bl = require('./chart-builder.js')
const { TempRecord } = require('./TempRecord')
const config = JSON.parse(fs.readFileSync('./config.json'))

const hostname = config.webserver.host;
const port = config.webserver.port;

const storeTemp = function(req, res, next) {
    const temp = req.query.temp
    if (temp) {
        const tr = new TempRecord('STREET', new Date(), parseInt(temp, 10))
        storage.storeTempRecord(tr)
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

        storage.getLastRecord('STREET', 101, (err, data) => {
            if (err) return cb(new Error(err))

            let temp = data.temps[0]
            if (temp > 0) {
                temp = '+' + temp
            }
            const rendered = content.toString().replace('#temp#', temp)
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

app.get('/', (req, res) => {
    res.render('index')
});

app.listen(port, hostname, () => {
    console.log(`Express server running at http://${hostname}:${port}/`)
});


