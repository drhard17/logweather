const { getLogweatherDb } = require('./db-creator.js')
const { TempRecord } = require('./TempRecord');

function getDbDate(date) {
    if (!(date instanceof Date)) {
        throw new Error('INVALID_DATE_RECORD_FORMAT')
    }
    return Math.floor(date.getTime() / 1000)
}

function extractParams(tempRecords) {
    return tempRecords.flatMap(tempRecord => {
        const dbTime = Math.floor(tempRecord.datetime.getTime() / 1000)
        const params = tempRecord.temps.map((temp, index) => {
            if (Number.isNaN(temp)) {
                temp = null
            }
            return [dbTime, tempRecord.serviceName, tempRecord.locId, index, temp]
        })
        return params
    })
}

module.exports = {
    storeTempRecords: function(tempRecords) {
        if (!(tempRecords instanceof Array)) {
            tempRecords = [tempRecords]
        }
        if (tempRecords.some(tr => !(tr instanceof TempRecord))) {
            throw new Error('INVALID_TEMP_RECORD_FORMAT')
        }
        const db = getLogweatherDb()
        const sql = `INSERT INTO forecasts (datetime, service_id, location_id, depth, temp)
                     VALUES (?, (SELECT id FROM services WHERE name = ?), ?, ?, ?)`
        const paramsArr = extractParams(tempRecords)
        db.serialize(() => {
            const stmt = db.prepare(sql)
            for (const params of paramsArr) {
                stmt.run(params, (err) => {
                    if (err) return console.log(err)
                })
            }
            stmt.finalize()
        })
        db.close((err) => {
            if (err) return console.log(err)
            const time = new Date().toLocaleTimeString()
            const locId = tempRecords[0].locId
            console.log(`${time} - locId ${locId} - ${tempRecords.length} temprecords added`)
        })
    },

    getLastTemp: function(serviceName, locId, cb) {
        const db = getLogweatherDb()
        const sql = `SELECT MAX(datetime) AS datetime, service_id, location_id, temp FROM forecasts
                        WHERE service_id = (SELECT id FROM services WHERE name = ?)
                        AND location_id = ?
                        AND depth = 0
                    `
        const locationId = parseInt(locId, 10)                     
        db.all(sql, [serviceName, locationId], (err, rows) => {
            if (err) { return cb(err) }
            if (!rows.length) { return cb(null, null) }
            const temp = rows[0].temp
            cb(null, temp)
        })
    },

    /**
     * 
     * @param {TempRequest} tempRequest 
     */

    getTempData: function (req, cb) {
        const firstDay = getDbDate(req.firstDay)
        const lastDay = getDbDate(req.lastDay)
        const hour = String(req.hour)
        const locId = req.locId
        
        const db = getLogweatherDb()
        const sql = `
            SELECT datetime AS timeStamp, services.name AS serviceName, depth, temp
            FROM forecasts
            INNER JOIN services ON forecasts.service_id = services.id
            WHERE datetime BETWEEN ? AND ?
                AND location_id = ?
                AND (SELECT strftime('%H', datetime(datetime, 'unixepoch'))) = ?
        `
        db.all(sql, [firstDay, lastDay, locId, hour], (err, rows) => {
            if (err) { return cb(err) }
            const result = rows.map(row => {
                return {
                    datetime: new Date(row.timeStamp * 1000),
                    serviceName: row.serviceName,
                    depth: row.depth,
                    temp: row.temp
                }
            })
            cb(null, result)
        })
        db.close()
    }
}
