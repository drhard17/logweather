const storage = require('./csv-storage.js')
const logic = require('./chart-logic.js')

module.exports = {
    /**
     * 
     * @param {{firstDay: Date, lastDay: Date, hour: Number, services: {name: String, depth: Number}[]}} req - request for getting chart data
     * @param {(err: Error, data) => void} cb 
     * 
     */

    getChartPoints: function (req, cb) {
        storage.getAllTempData((err, data) => {
            if (err) {
                console.log(err)
                return
            }
            const chartPoints = logic.calculatePoints(data, req)
            cb(null, chartPoints)
        })
    }
}

if (!module.parent) {
    getChartPoints(tempRequest, (err, a) => {
        console.log(a)
        console.log(`Match: ${JSON.stringify(a) === JSON.stringify(response)}`)
    })
}