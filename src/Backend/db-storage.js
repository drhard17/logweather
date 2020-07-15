const { getLogweatherDb } = require('./db-creator.js')
const { TempRecord } = require('./TempRecord');

function getDbDate(date) {
    if (!(date instanceof Date)) {
        throw new Error('INVALID_DATE_RECORD_FORMAT')
    }
    return Math.floor(date.getTime() / 1000)
}

function trsToSQL(tempRecords) {
    const allForecastData = tempRecords.flatMap(tempRecord => {
        const timeStamp = Math.floor(tempRecord.datetime.getTime() / 1000)
        const forecastData = tempRecord.temps.map((temp, index) => {
            let dbTemp
            temp === null || Number.isNaN(temp) ? dbTemp = 'NULL' : dbTemp = temp
            const serviceNameExp = `(SELECT id FROM services WHERE name = '${tempRecord.serviceName}')`
            return [timeStamp, serviceNameExp, tempRecord.locId, index, dbTemp]
        })
        return forecastData
    })    

    return `INSERT INTO forecasts (datetime, service_id, location_id, depth, temp)
            SELECT ${allForecastData[0][0]} AS datetime, 
                    ${allForecastData[0][1]} AS service_id, 
                    ${allForecastData[0][2]} AS location_id, 
                    ${allForecastData[0][3]} AS depth, 
                    ${allForecastData[0][4]} AS temp
                    ${allForecastData.slice(1).map(string => `UNION ALL SELECT ${string.toString()}`).join('\r\n')}                            
    `
}

module.exports = {
    storeTempRecords: function (tempRecords) {
        if (!(tempRecords instanceof Array)) {
            tempRecords = [tempRecords]
        }
        if (tempRecords.some(tr => !(tr instanceof TempRecord))) {
            throw new Error('INVALID_TEMP_RECORD_FORMAT')
        }

        const sql = trsToSQL(tempRecords)
        const db = getLogweatherDb()
        const locId = tempRecords.map(tempRecord => tempRecord.locId)[0] //for log
        db.run(sql, (err) => {
            if (err) return console.log(err);
            console.log(`${locId} - ${tempRecords.length} temprecords added to DB`)
        })

        db.close((err) => {
            if (err) return console.log(err);
        })
    },

    getLastTemp: function(serviceName, locId, cb) {
        const db = getLogweatherDb()
        const sql = `SELECT MAX(datetime) AS datetime, service_id, location_id, temp FROM forecasts
                        WHERE depth = 0 
                        AND service_id = (SELECT id FROM services WHERE name = '${serviceName}')
                        AND location_id = ${parseInt(locId, 10)}
                    `
        db.all(sql, (err, rows) => {
            console.log(serviceName, locId, err);
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
        const hour = req.hour
        const locId = req.locId
        
        const db = getLogweatherDb()
        const sql = `
            SELECT datetime AS timeStamp, services.name AS serviceName, depth, temp
            FROM forecasts
            INNER JOIN services ON forecasts.service_id = services.id
            WHERE datetime BETWEEN ${firstDay} AND ${lastDay}
                AND location_id = ${locId}
                AND (SELECT strftime('%H', datetime(datetime, 'unixepoch'))) = '${hour}'
        `
        
        db.all(sql, (err, rows) => {
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
