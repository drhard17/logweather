const fs = require('fs')
const sqlite3 = require('sqlite3').verbose();
const array = require('lodash/array');

const { TempRecord } = require('./TempRecord');
const { TempRequest } = require('./TempRequest');
const csvStorage = require('./csv-storage.js');
const { result } = require('lodash');

const dbFolder = '../db'
const dbName = 'logweather.db'

function getLogweatherDb() {
    try {
        if (!fs.existsSync(dbFolder)) {
            fs.mkdirSync(dbFolder)
        }
    } catch (err) {
        console.error(err)
    }

    return new sqlite3.Database(`${dbFolder}/${dbName}`, (err) => {
        if (err) { return console.error(err.message) }
        console.log('Connected to the Logweather database.')
    })
}

function createTables(db) {
    const sql = [`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL UNIQUE
        )
        `,`
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            name_rus TEXT
        )
        `,`
        CREATE TABLE IF NOT EXISTS forecasts (
            id INTEGER PRIMARY KEY NOT NULL,
            datetime INTEGER NOT NULL, 
            service_id INTEGER NOT NULL, 
            location_id INTEGER NOT NULL, 
            depth INTEGER NOT NULL,
            temp REAL,
            FOREIGN KEY (service_id)
                REFERENCES services (id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT,
            FOREIGN KEY (location_id)
                REFERENCES locations (id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
        )
        `,`
        CREATE TABLE IF NOT EXISTS service_routes (
            service_id INTEGER NOT NULL,
            location_id INTEGER NOT NULL,
            path TEXT NOT NULL,
            PRIMARY KEY (service_id, location_id)
            FOREIGN KEY (service_id)
                REFERENCES services (id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT,
            FOREIGN KEY (location_id)
                REFERENCES locations (id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
        )`
    ]

    db.serialize(() => {
        sql.forEach((query) => {
            db.run(query, (err) => {
                if (err) return console.log(err)
                console.log(`Table '${query.match('[a-z_]+')[0]}' created`)
            })
        })
    })
}

function servicesToJson() {
    const services = [
        {id: 1, name: 'STREET'},
        {id: 2, name: 'YANDEX'},
        {id: 3, name: 'GISMETEO'},
        {id: 4, name: 'ACCUWEATHER'},
        {id: 5, name: 'WEATHERCOM'},
        {id: 6, name: 'YRNO'},
        {id: 7, name: 'GIDROMET'},
        {id: 8, name: 'RP5'}
    ]
    const json = JSON.stringify(services)
    fs.writeFile('./services.json', json, (err) => {
        if (err) return console.log(err);
        console.log('OK');
    })
}

function locationsToJson() {
    const locations = csvStorage.getAllLocations()
    const json = JSON.stringify(locations)
    fs.writeFile('./locations.json', json, (err) => {
        if (err) return console.log(err)
        console.log('Write locations.json OK');
    })
}

function fillServicesTable(db, filename) {
    fs.readFile(filename, (err, data) => {
        if (err) return console.log(err);
        const services = JSON.parse(data)
        db.serialize(() => {
            for (const service of services) {
                const sql = `INSERT INTO services (id, name) VALUES (${service.id}, '${service.name}')`
                db.run(sql, (err) => {
                    if (err) return console.log(err)
                    console.log(`${JSON.stringify(service)} added to DB`);
                })
            }
        })
    })
}

function fillLocationsTable(db, filename) {
    fs.readFile(filename, (err, data) => {
        if (err) return console.log(err)
        const locations = JSON.parse(data)
        db.serialize(() => {
            for (const location of locations) {
                const sql = `INSERT INTO locations (id, name, name_rus) VALUES (${location.id}, '${location.name}', '${location.nameRus}')`
                db.run(sql, (err) => {
                    if (err) console.log(err);
                    console.log(`${JSON.stringify(location.name)} added to DB`);
                })
            }
        })
    })
}

function fillDb() {
    const db = getLogweatherDb()
    db.parallelize(() => {
        createTables(db)
        fillServicesTable(db, './services.json')
        fillLocationsTable(db, './locations.json')
    })
    // db.close()    
}

function getDbDate(date) {
    if (!(date instanceof Date)) {
        throw new Error('INVALID_DATE_RECORD_FORMAT')
    }
    return Math.floor(date.getTime() / 1000)
}

function trsToSQL(trs) {
    
    if (!(trs instanceof Array)) { trs = [trs] }
    if (trs.some(tr => !(tr instanceof TempRecord))) {
        throw new Error('INVALID_TEMP_RECORD_FORMAT')
    }

    const allForecastData = trs.flatMap(tr => {
        const timeStamp = Math.floor(tr.datetime.getTime() / 1000)
        const forecastData = tr.temps.map((temp, index) => {
            let dbTemp
            temp === null || Number.isNaN(temp) ? dbTemp = 'NULL' : dbTemp = temp
            return [timeStamp, tr.serviceId, tr.locId, index, dbTemp]
        })
        return forecastData
    })    

    const sql = `INSERT INTO forecasts (datetime, service_id, location_id, depth, temp)
                    SELECT ${allForecastData[0][0]} AS datetime, 
                            ${allForecastData[0][1]} AS service_id, 
                            ${allForecastData[0][2]} AS location_id, 
                            ${allForecastData[0][3]} AS depth, 
                            ${allForecastData[0][4]} AS temp
                    ${allForecastData.slice(1).map(string => `UNION ALL SELECT ${string.toString()}`).join('\r\n')}                            
    `
    // console.log(sql);
    return sql
}

function storeOneRecord(tr, db, cb) {
    const sql = trsToSQL(tr)                
    db.run(sql, (err) => {
        if (err) return cb(err);
        cb(null)
    })
}

function importCsvToDb() {
    const db = getLogweatherDb()
    let errCounter = 0
    const services = JSON.parse(fs.readFileSync('./services.json'))
    csvStorage.getAllTempData((err, data) => {
        if (err) return console.log(err)
        const tempRecords = data.map((record, index) => {
            const serviceId = services.find(service => service.name === record.service).id
            // console.log(`${index}: ${record.locId}, ${record.service}, ${record.time}`);
            
            try {
                return new TempRecord(record.time, serviceId, record.locId, record.temps)    
            } catch (error) {
                errCounter++
                return null
            }
        })
        
        array.remove(tempRecords, function(n) {
            return n === null
        })
        console.log(`Errors in CSV files: ${errCounter}`)
        console.log(`Temp records total: ${tempRecords.length}`);
        let rowCounter = 0
        db.serialize(() => {
            tempRecords.slice(0).forEach(tr => {
                storeOneRecord(tr, db, (err) => {
                    if (err) {
                        console.log(tr);
                        console.log(err)
                        return 
                    };
                    rowCounter++
                })
            })
        })
        db.close((err) => {
            if (err) {
                return console.error(err.message)
            }
            console.log(`${rowCounter} temprecords inserted. Close the database connection.`)
        })
    })
}

function storeTempRecords(trs, cb) {

    const sql = trsToSQL(trs)
    const db = getLogweatherDb()
                   
    db.run(sql, (err) => {
        if (err) return cb(err);
        console.log(`Success inserting data!`);
    })

    db.close((err) => {
        if (err) return cb(err)
    })
    cb(null)
}

function getLastTemp(serviceName, locId, cb) {
    const db = getLogweatherDb()
    const sql = `SELECT datetime, service_id, location_id, temp FROM forecasts
                WHERE depth = 0 
                    AND service_id = (SELECT id FROM services WHERE name = '${serviceName}')
                    AND location_id = ${locId}
                    AND datetime = (SELECT MAX(datetime) FROM forecasts)`
    db.all(sql, (err, rows) => {
        if (err) { return cb(err) }
        if (!rows.length) { return cb(null, null) }
        const temp = rows[0].temp
        cb(null, temp)
    })
}

function getTempPoints(tRequest) {
    if (!(tRequest instanceof TempRequest)) {
        throw new Error('INVALID_TEMP_REQUEST_FORMAT')
    }

    const firstDay = getDbDate(tRequest.firstDay)
    const lastDay = getDbDate(tRequest.lastDay)

    const db = getLogweatherDb()
    const sql = `
        SELECT date(datetime, 'unixepoch') AS timeStamp, ROUND(AVG(temp), 0) AS temp 
        FROM forecasts 
        WHERE service_id = (SELECT id FROM services WHERE name = '${tRequest.serviceName}')
            AND location_id = ${tRequest.locId}
            AND depth = ${tRequest.depth}
            AND datetime BETWEEN ${firstDay} AND ${lastDay}
            AND (SELECT strftime('%H', datetime(datetime, 'unixepoch'))) = '${tRequest.hour}'
        GROUP BY date(datetime, 'unixepoch')
    `
    db.all(sql, (err, rows) => {
        if (err) console.log(err)
        console.log(rows.length)
        const chartData = {
            labels: rows.map(row => row.timeStamp),
            points: [{
                service: tRequest.serviceName,
                depth: tRequest.depth,
                temps: rows.map(row => row.temp)
            }]
        }
        console.log(chartData.points[0].temps);
        console.log(chartData.labels)
        
    })
    db.close()
}

function testTempReq() {

    const timeOffset = 3
    const tReq = new TempRequest(new Date('2020/04/06'), new Date('2020/04/13'), 101, 'STREET', 0, 14 - timeOffset)
    getTempPoints(tReq)
    
}

function main() {
    const tr1 = new TempRecord(new Date(), 2, 101, [20, null, 12, 13, NaN, 17])
    const tr2 = new TempRecord(new Date(), 3, 102, [21, 23, 25])
    const tr = [tr1, tr2]

    storeTempRecords(tr, (err) => {
        if (err) return console.error(err.message);
        console.log('TR stored');
        
    })
}



if (!module.parent) {

    testTempReq()
    // importCsvToDb()
    // main()
    
/*     getLastTemp('YANDEX', 101, (err, data) => {
        if(err) { console.log(err) }
        console.log(data);
    })
 */
}