const fs = require('fs')
const path = require('path')

const { TempRecord } = require('./TempRecord')
const csvFolder = '../csv'

function convertRecordToCsv(record) {
    const time = new Date(record.time)
    const csvString = time.toISOString() + ',' + record.temps.join() + '\r\n'
    return {
        filename: record.service + '.csv',
        str: csvString
    }
}

function storeCsvData(folder, filename, data) {
    try {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder)
        }
    } catch (err) {
        console.error(err)
    }

    fs.appendFile(`${folder}/${filename}`, data, (err) => {
        const time = new Date().toLocaleString()
        const logString = `${time} Added to ${filename}: ${data.slice(0, -2)}`
        console.log(err || logString);
    });
}

function readCsv(folder, filename, cb) {
    fs.readFile(`${folder}/${filename}.csv`, 'utf-8', (err, data) => {
        if (err) {
            cb(err)
            return
        }
        cb(null, data)
    })
}

/**
 * Reads *.csv files from specified folder
 * 
 * @param {string} folder - folder name
 * @param {function cbFile(err, filename, data) {} } - callback running after each file read
 * @param {function cbAllFiles()} - callback running after all files read
 * 
 */

function readCsvFiles(folder, cbFile, cbAllFiles) {
    fs.readdir(folder, (err, files) => {
        if (err) {
            cbAllFiles(err)
            return
        }
        const csvFiles = files.filter(filename => {
            return path.extname(filename) === '.csv'
        })
        let filesLeft = csvFiles.length
        csvFiles.forEach((filename) => {
            fs.readFile(`${folder}/${filename}`, 'utf-8', (err, data) => {
                if (err) {
                    cbFile(err)
                    return
                }
                cbFile(null, filename, data)
                filesLeft--
                if (!filesLeft) {
                    cbAllFiles(null)
                }
            })
        })
    })
}

function joinFiles(dirname, cb) {
    let csvData = []
    readCsvFiles(dirname,
        (err, filename, data) => {
            if (err) {
                cb(err)
                return
            }
            csvData.push({
                filename: filename,
                filedata: data
            })
        },
        (err) => {
            if (err) {
                cb(err)
                return
            }
            cb(null, csvData)
        }
    )
}

/**
 * Converts CSV data to array of objects
 * 
 * @param {{filename: String, filedata: String}[]} data 
 * @returns {{service: String, city: String, time: Date, temps: Number[]}[]}
 * 
 */

function convertCsvData(data) {
    let results = []
    for (item of data) {
        let csvStrings = item.filedata.split('\r\n')
        if (csvStrings[csvStrings.length - 1] === '') {
            csvStrings.pop()
        }
        for (str of csvStrings) {
            let values = str.split(',')
            const service = path.basename(item.filename, '.csv') 
            values.unshift(service)
            results.push(values)
        }
    }
    return results.map((a) => {
        return {
            service: a[0],
            city: '',
            time: a[1],
            temps: a.slice(2)
                .map(i => parseInt(i, 10))
        }
    })
}

module.exports = {
    getAllTempData: function (cb) {
        joinFiles(csvFolder, (err, data) => {
            if (err) {
                cb(err)
                return
            }
            const tempData = convertCsvData(data)
            cb(null, tempData)
        })
    },

    /**
     * 
     * @param {TempRecord} record 
     */

    storeTempRecord: function(record) {
        if (!(record instanceof TempRecord)) {
            throw new Error('INVALID_TEMP_RECORD_FORMAT')
        }
        const csvData = convertRecordToCsv(record)
        storeCsvData(csvFolder, csvData.filename, csvData.str)
    },

    getLastRecord: function(serviceName, cb) {
        readCsv(csvFolder, serviceName, (err, data) => {
            if (err) {
                cb(err)
                return
            }
            const strings = data.split('\r\n')
            const lastString  = strings[strings.length - 2].split(',')
    
            const time = new Date(lastString[0])
            const temps = parseInt(lastString.slice(1), 10)

            const tr = new TempRecord(serviceName, time, temps)

            cb(null, tr)

        })
    }
}

/* 
if (!module.parent) {
    const tr = new TempRecord('TEST', 'Krasnogorsk', new Date(), [1, 2, 3])
    module.exports.storeTempRecord(tr)
}

 */