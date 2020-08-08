const moment = require('moment');

const storage = require('./db-storage.js')
const logic = require('./chart-logic.js')
const { TempRequest } = require('./TempRequest');

const hour = 11 // time option for chart building

module.exports = {
    /**
     * 
     * @param {{firstDay: Date, lastDay: Date, locId: number, charts: {serviceName: string, depth: number}[]}} request - request for getting chart data
     * 
     */

    getChartPoints: async function (request) {
        const tempRequest = TempRequest.fromObject(request)
        const allDepths = tempRequest.charts.map(chart => chart.depth) 
        const maxDepth = Math.max.apply(null, allDepths)
        const tempDataRequest = {
            firstDay: moment(tempRequest.firstDay).subtract(maxDepth, 'd').toDate(),
            lastDay: moment(tempRequest.lastDay).endOf('day').toDate(),
            hour: hour,
            locId: tempRequest.locId
        }
        const tempData = await storage.getTempData(tempDataRequest)
        const chartPoints = logic.calculatePoints(tempData, tempRequest)
        return chartPoints
    }
}
