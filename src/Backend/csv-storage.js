const fs = require('fs')
const path = require('path')

const { TempRecord } = require('./TempRecord')
const csvFolder = '../csv'

function convertRecordToCsv(record) {
    const time = record.time
    const locId = record.locId
    const temps = record.temps
    return time.toISOString() + ',' + locId + ',' + temps.join() + '\r\n'
}

function storeCsvData(folder, filename, data, cb) {
    try {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder)
        }
    } catch (err) {
        cb(err)
        return
    }
    fs.appendFile(`${folder}/${filename}`, data, (err) => {
        if (err) {
            cb(err)
            return 
        }
        cb(null, filename, data)
    })
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
 * @param {{filename: string, filedata: string}[]} data 
 * @returns {{service: string, locId: number, time: Date, temps: number[]}[]}
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
            time: new Date(a[1]),
            locId: parseInt(a[2], 10),
            temps: a.slice(3)
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
        const csvString = convertRecordToCsv(record)
        const filename = record.service + '.csv'
        storeCsvData(csvFolder, filename, csvString, (err, filename, csvString) => {
            if (err) {
                console.log(err)
                return
            }
            const time = new Date().toLocaleString()
            const toGreen = '\x1b[32m', resetColor = '\x1b[0m'
            console.log(`${time} Added to ${filename}:`)
            console.log(toGreen, csvString, resetColor)
        })
    },

    getLastRecord: function(serviceName, locId, cb) {
        readCsv(csvFolder, serviceName, (err, data) => {
            if (err) {
                cb(err)
                return
            }
            const strings = data.split('\r\n')
            if (strings[strings.length - 1] === '') strings.pop()

            strings.reverse()
            const lastString = strings
                .find(string => {
                    return parseInt(
                        string.split(',')[1]
                    , 10) === locId
                })
                .split(',')

            const time = new Date(lastString[0])
            const temps = parseInt(lastString.slice(2)[0], 10)

            const tr = new TempRecord(serviceName, locId, time, temps)
            cb(null, tr)
        })
    },
/**
 * 
 * @param {string} site - service name
 * @param {number} locLimit - limit of locations to parse temperatures from 
 * @returns {string[]} - urls for locations
 */
    getSiteLocations: function(site, locLimit) {
        if (!locLimit) locLimit = undefined
        const locFilename = `${csvFolder}/locations/locations-${site}.txt`
        const locData = fs.readFileSync(locFilename, 'utf8')
        return locData.split('\r\n').slice(0, locLimit)
    },

    getAllLocations: function(locLimit) {
        if (!locLimit) locLimit = undefined
        const locFilename = `${csvFolder}/locations/locations.csv`
        const data = fs.readFileSync(locFilename, 'utf8').slice(1).split('\r\n')
        if (data[data.length - 1] === '\r\n') {data.pop()}
        const headers = data.shift().split(';')
        const locData = data.slice(0, locLimit)
        return locData.map(string => {
            const values = string.split(';')
            let location = {}
            for (let i = 0; i < headers.length; i++) {
                location[headers[i]] = values[i]
            }
            return location
        })
    }
}
