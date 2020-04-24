const fs = require('fs');
const path = require('path');
const moment = require('moment');

const csvFolder = '../csv'

module.exports = {
    getCsvData: function (cb) {
        joinFiles(csvFolder, (err, data) => {
            if (err) {
                cb(err)
                return
            }
            const csvData = convertCsvData(data)
            cb(null, csvData)
        })
    }
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
                filename,
                data
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
 * Reads *.csv files from specified folder
 * 
 * @param {string} dirname - folder name
 * @param {function cbFile(err, filename, data) {} } - callback running after each file read
 * @param {function cbAllFiles()} - callback running after all files read
 * 
 */

function readCsvFiles(dirname, cbFile, cbAllFiles) {
    fs.readdir(dirname, (err, files) => {
        if (err) {
            cbAllFiles(err)
            return
        }
        const csvFiles = files.filter(filename => {
            return path.extname(filename) === '.csv'
        })
        let filesLeft = csvFiles.length
        csvFiles.forEach((filename) => {
            fs.readFile(`${dirname}/${filename}`, 'utf-8', (err, data) => {
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

/**
 * Converts CSV data to array of objects
 * 
 * @param {{filename: String, data: String}} data 
 * @returns {{service: String, time: Date, temps: Number[]}[]}
 * 
 */

function convertCsvData(data) {
    let results = []
    for (item of data) {
        let csvStrings = item.data.split('\r\n')
        csvStrings.pop()
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
            time: convertCsvDate(a[1], a[2]),
            temps: a.slice(3)
                .map(i => parseInt(i, 10))
        }
    })
}

/**
 * Converts date and time from csv to ISO format
 * @param {String} csvDate 
 * @param {String} csvTime 
 */

function convertCsvDate(csvDate, csvTime) {
    const format = 'DD.MM.YYYY HH:mm:ss'
    const d = moment(csvDate + ' ' + csvTime, format)
    return new Date(d.toISOString())
}