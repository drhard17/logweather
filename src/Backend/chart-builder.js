const moment = require('moment');

const storage = require('./db-storage.js')
const logic = require('./chart-logic.js')
const { TempRequest } = require('./TempRequest');

const hour = 11 // time option for chart building

module.exports = {
    /**
     * 
     * @param {{firstDay: Date, lastDay: Date, locId: number, charts: {serviceName: string, depth: number}[]}} req - request for getting chart data
     * @param {(err: Error, data) => void} cb 
     * 
     */

    getChartPoints: function (request, cb) {
        let tempRequest
        try {
            tempRequest = TempRequest.fromObject(request)    
        } catch (err) {
            return cb(err)
        }
        const allDepths = tempRequest.charts.map(chart => chart.depth) 
        const maxDepth = Math.max.apply(null, allDepths)
        const tempDataRequest = {
            firstDay: moment(tempRequest.firstDay).subtract(maxDepth, 'd').toDate(),
            lastDay: moment(tempRequest.lastDay).endOf('day').toDate(),
            hour: hour,
            locId: tempRequest.locId
        }
        storage.getTempData(tempDataRequest, (err, tempData) => {
            if (err) {
                return cb(err)
            }
            const chartPoints = logic.calculatePoints(tempData, tempRequest)
            cb(null, chartPoints)
        })
    }
}
