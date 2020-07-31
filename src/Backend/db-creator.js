const fs = require('fs')
const sqlite3 = require('sqlite3').verbose();

const dbFolder = '../db'
const dbName = 'logweather.db'
const dbPath = dbFolder + '/' + dbName

function createTables(db) {
    const sql = [`
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL UNIQUE
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
        CREATE INDEX IF NOT EXISTS main_index
            ON forecasts (datetime, service_id, location_id)
        `
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

function fillServicesTable(db, filename) {
    fs.readFile(filename, (err, data) => {
        if (err) return console.log(err);
        const services = JSON.parse(data)
        db.serialize(() => {
            for (const service of services) {
                const sql = `INSERT INTO services (id, name) VALUES (?, ?)`
                const params = [service.id, service.name]
                db.run(sql, params, (err) => {
                    if (err) return console.log(err)
                    console.log(`${JSON.stringify(service)} added to DB`);
                })
            }
        })
    })
}

function fillDb(db) {
    db.serialize(() => {
        createTables(db)
        fillServicesTable(db, './services.json')
    })
}

function createDb() {
    try {
        if (!fs.existsSync(dbFolder)) {
            fs.mkdirSync(dbFolder)
        }
    } catch (err) {
        console.error(err.message)
    }
    if (fs.existsSync(dbPath)) {
        return console.log('Database file already exists')
    }
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) { 
            return console.error(err.message) 
        }
    })
    fillDb(db)
}

module.exports = {
    getLogweatherDb: function() {
        const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) { 
                return console.error(err.message) 
            }
        })
        return db
    }
}

if (!module.parent) {
    createDb()
}