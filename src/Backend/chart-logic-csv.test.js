const csvStorage = require('./csv-reader.js')
const logic = require('./chart-logic.js')

 /**
  * 
  * @param {{firstDay: Date, lastDay: Date, hour: Number, services: {name: String, depth: Number}[]}} req - request for getting chart data
  * 
  */

function getChartPoints(req, cb) {
    csvStorage.getCsvData((err, data) => {
        if (err) {
            console.log(err)
            return
        }
        const chartPoints = logic.calculatePoints(data, req)
        cb(null, chartPoints)
    })
}

const tempRequest = {
    firstDay: new Date('2020-04-06'),
    lastDay: new Date('2020-04-12'),
    hour: 14,
    services: [
        {
            name: 'STREET',
            depth: 0
        }, {
            name: 'GIDROMET',
            depth: 3
        }, {
            name: 'YANDEX',
            depth: 3
        }, {
            name: 'GISMETEO',
            depth: 3
        }, {
            name: 'YRNO',
            depth: 3
        }, {
            name: 'RP5',
            depth: 3
        }
    ]
}    

getChartPoints(tempRequest, console.log)
