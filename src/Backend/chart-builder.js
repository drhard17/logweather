// const storage = require('./csv-storage.js')
const logic = require('./chart-logic.js')
const { TempRequest } = require('./TempRequest');

module.exports = {
    /**
     * 
     * @param {{firstDay: Date, lastDay: Date, hour: number, services: {name: string, depth: number}[], locId: number}} req - request for getting chart data
     * @param {(err: Error, data) => void} cb 
     * 
     */

    getChartPoints: function (tempRequest, cb) {
        logic.calculatePoints(tempRequest, (err, data) => {
            if (err) { return cb(err) }
            cb(null, data)
        })
    }
}

if (!module.parent) {
    const tempRequest = JSON.parse(`{"firstDay":"2020-04-06T00:00:00.000Z","lastDay":"2020-04-12T00:00:00.000Z","locId":101,"serviceName":"STREET","depth":0,"hour":11}`)
    // const tempRequest = new TempRequest(new Date('2020/04/06'), new Date('2020/04/12'), 101, 'GISMETEO', 3, 14)
    module.exports.getChartPoints(tempRequest, (err, a) => {
        if (err) { return console.log(err) }
        console.log(`Result: ${JSON.stringify(a)}`)
        console.log(`Temps: ${a.points[0].temps}`);
        
        //console.log(`Match: ${JSON.stringify(a) === JSON.stringify(response)}`)
    })
}