const fs = require('fs')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const output = require('./csv-writer.js')
const bl = require('./chart-logic-csv.js')
const config = JSON.parse(fs.readFileSync('./config.json'))

const hostname = config.webserver.host;
const port = config.webserver.port;

const getLastTempCsv = function(data) {
    const csvStrings = data.toString().split('\r\n')
    const temp = csvStrings[csvStrings.length-2].split(',')[2]
    return temp
}

const storeTempCsv = function(req, res, next) {
    const temp = req.query.temp
    if (temp) {
        console.log(`Added temp: ${temp}`)
        output.toCSV('STREET', [temp])
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

        fs.readFile('../csv/STREET.csv', (err, csvData) => {
            if (err) return cb(new Error(err))

            let temp = getLastTempCsv(csvData)
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
app.use(storeTempCsv)
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


