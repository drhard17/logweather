const { getLogweatherDb } = require('./db-creator.js')
const { TempRecord } = require('./TempRecord.js');

const config = require('../config.json')
const { storing: { busyTimeout } } = config


function getDbDate(date) {
    if (!(date instanceof Date)) {
        throw new Error('INVALID_DATE_RECORD_FORMAT')
    }
    return Math.floor(date.getTime() / 1000)
}

function getDbHour(hour){
    return hour < 10 ? '0' + hour : String(hour)
}

function extractParams(tempRecords) {
    return tempRecords.flatMap(tempRecord => {
        const dbTime = Math.floor(tempRecord.datetime.getTime() / 1000)
        const params = tempRecord.temps.flatMap((temp, index) => {
            if (Number.isNaN(temp)) {
                temp = null
            }
            return [dbTime, tempRecord.serviceName, tempRecord.locId, index, temp]
        })
        return params
    })
}

function formPlaceholders(holder, tempRecords) {
    return tempRecords.flatMap(tempRecord => {
        return tempRecord.temps.map(temp => holder)
    }).join(',' + '\n')
}

module.exports = {
    storeTempRecords: async function(tempRecords) {
        if (!(tempRecords instanceof Array)) {
            tempRecords = [tempRecords]
        }
        if (tempRecords.some(tr => !(tr instanceof TempRecord))) {
            throw new Error('INVALID_TEMP_RECORD_FORMAT')
        }
        
        const clause = 'INSERT INTO forecasts (datetime, service_id, location_id, depth, temp) VALUES '
        const placeholder = '(?, (SELECT id FROM services WHERE name = ?), ?, ?, ?)'
        
        const sql =  clause + formPlaceholders(placeholder, tempRecords)
        const params = extractParams(tempRecords)
        
        const db = await getLogweatherDb()
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(`PRAGMA busy_timeout = ${busyTimeout}`)
                .run(sql, params, (err) => {
                    if (err) { 
                        console.log('DB_ERROR');
                        return reject(err) 
                    }
                })
            })
            db.close((err) => {
                if (err) return reject(err)
                resolve()
            })
        })
    },

    getLastTempData: async function(serviceName, locId) {
        db = await getLogweatherDb()
        const sql = `SELECT MAX(datetime) AS datetime, service_id, location_id, temp FROM forecasts
                        WHERE service_id = (SELECT id FROM services WHERE name = ?)
                        AND location_id = ?
                        AND depth = 0
                    `
        const locationId = parseInt(locId, 10)
        return new Promise((resolve, reject) => {
            db.all(sql, [serviceName, locationId], (err, rows) => {
                if (err) { reject(err) }
                if (!rows) { resolve(null) }
                const temp = rows[0].temp
                const datetime = new Date(rows[0].datetime * 1000)
                resolve( {temp, datetime} )
            })
            db.close()
        })
    },

    /**
     * 
     * @param {TempRequest} tempRequest 
     */

    getTempData: async function (req) {
        const firstDay = getDbDate(req.firstDay)
        const lastDay = getDbDate(req.lastDay)
        const hour = getDbHour(req.hour)
        const locId = req.locId
        
        const db = await getLogweatherDb()
        const sql = `
            SELECT datetime AS timeStamp, services.name AS serviceName, depth, temp
            FROM forecasts
            INNER JOIN services ON forecasts.service_id = services.id
            WHERE datetime BETWEEN ? AND ?
                AND location_id = ?
                AND (SELECT strftime('%H', datetime(datetime, 'unixepoch'))) = ?
        `
        return new Promise((resolve, reject) => {
            db.all(sql, [firstDay, lastDay, locId, hour], (err, rows) => {
                if (err) { return reject(err) }
                const result = rows.map(row => {
                    return {
                        datetime: new Date(row.timeStamp * 1000),
                        serviceName: row.serviceName,
                        depth: row.depth,
                        temp: row.temp
                    }
                })
                resolve(result)
            })
            db.close()
        })
    }
}
