const fs = require('fs')
const sqlite3 = require('sqlite3').verbose();

const dbFolder = '../db'
const dbName = 'logweather.db'

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

function fillDb(db) {
    db.parallelize(() => {
        createTables(db)
        fillServicesTable(db, './services.json')
        fillLocationsTable(db, './locations.json')
    })
    // db.close()    
}

module.exports = {
    getLogweatherDb: function() {
        try {
            if (!fs.existsSync(dbFolder)) {
                fs.mkdirSync(dbFolder)
            }
        } catch (err) {
            console.error(err.message)
        }
        const noDbFile = !(fs.existsSync(`${dbFolder}/${dbName}`))
        const db = new sqlite3.Database(`${dbFolder}/${dbName}`, (err) => {
            if (err) { 
                return console.error(err.message) 
            }
        })
        if (noDbFile) {
            fillDb(db)
        }
        return db
        
    }
}