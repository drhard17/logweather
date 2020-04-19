const fs = require('fs');
const path = require('path');
const moment = require('moment');

const folder = '../csv'

// Данные берутся из CSV или mySQL, следующим образом:
// - сервисы (service) выбираются все, что есть, в том числе STREET
// - даты (date) для прогнозов c firstDay - depth по lastDay - depth
// - даты (date) для STREET выбираются с firstDay по lastDay включительно
// - время - часы должны быть равны opts.hour
// (- температура для прогнозов выбирается из массива по индексу depth + 1)
// (- температура для STREET единственная, что есть)
//
// Цепочка вызовов:
// getChartPoint: readCsvFiles => convertCsvData => extractRequestedData => countPoints
//
// Результат работы convertCsvData - массив объектов вида:
// 
// [
//     {
//         service: 'YANDEX',
//         date: '1.02.20',
//         time: '14:00:00',
//         temps: [0, 3, 4, _5_, 6, 7, 7]
//     }, {
//         service: 'YANDEX',
//         date: '1.02.20',
//         time: '14:15:00',
//         temps: [0, 4, 5, _6_, 7, 8, 9]
//     }, {
//         service: 'STREET',
//         date: '1.02.20',
//         time: '14:15:00',
//         temps: [_9_]
//     }
// ]
//
// На основании данных для каждого сервиса/дня считается средняя температура (countPoints) 
// В коллбэк cb передаются данные для построения графиков 
//
// [
//     {
//         service: 'YANDEX',
//         temps: [0, 2, 3, 5, 0, 3, 4]
//     }, {
//         service: 'GISMETEO',
//         temps: [1, 3, -4, 4, 5, 1, 1]
//     }, {
//         service: 'STREET',
//         temps: [-5]
//     }
// ]

function readCsvFiles (dirname, cb) {
    fs.readdir(dirname, (err, files) => {
        if (err) {
            cb(err)
            return
        }
        let fileData = []
        files.filter(filename => {
            return path.extname(filename) === '.csv'
        }).forEach((filename, i, files) => {
            fs.readFile(`${dirname}/${filename}`, 'utf-8', (err, data) => {
                if (err) {
                    cb(err)
                    return
                }
                fileData.push({
                    filename,
                    data
                })
                if (i === files.length - 1) {
                    cb(null, fileData)
                }
            })
        })
    })
}

function convertCsvData(data) {
    let results = []
    for (item of data) {
        let csvStrings = item.data.split('\r\n')
        csvStrings.pop()
        console.log(item.filename)
        for (str of csvStrings) {
            let values = str.split(',')
            values.pop()
            values.unshift(path.basename(item.filename, '.csv'))
            results.push(values)
        }
    }
    return results.map((a) => {
        return {
            service: a[0],
            csvDate: a[1] + ' ' + a[2],
            time: convertDate(a[1], a[2]),
            temps: a.slice(3)
                    .map(i => parseInt(i, 10))
        }
    })
}

function convertDate(csvDate, csvTime) {
    const format = 'DD.MM.YYYY HH:mm:ss'
    return moment(csvDate + ' ' + csvTime, format)
}

function extractRequestedData(data, req, opts) {
    const firstDay = moment(req.firstDay)
    const lastDay = moment(req.lastDay).add(1, 'd')
    return data
        .filter((item) => {
            return item.service === 'STREET'
        })
        .filter((item) => {
            return item.time >= firstDay && item.time < lastDay
        })
        .filter((item) => {
            return moment(item.time).hours() === opts.hour
        })
}

/* 
function countPoints(data) {
    //..TBD
    return data
}

 */

module.exports = {
    getChartPoints: function(req, opts, cb) {
        readCsvFiles(folder, (err, data) => {
            if (err) {
                cb(err)
                return
            }
            const allTempData = convertCsvData(data)
            const result = extractRequestedData(allTempData, req, opts)
            
            cb(null, result)
            console.log(`Total results: ${result.length}`)
        })
    }
}

function test() {
    const req = {
        firstDay: new Date('2020-04-06'),
        lastDay: new Date('2020-04-12'),
        depth: null
    }
    const opts = {
        hour: 14
    }
    module.exports.getChartPoints(req, opts, (err, data) => {
        if (err) {
            console.log(err)
            return
        }
        console.log(data)
    })
}

test()