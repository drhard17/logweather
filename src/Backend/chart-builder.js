const moment = require('moment-timezone');

const storage = require('./db-storage.js')
const logic = require('./chart-logic.js')
const { TempRequest } = require('./TempRequest');
const locations = require('../locations.json')
const config = require('../config.json')

const { countingHour } = config

function getTZoffset(locId, date) {
    const timeZone = locations
        .find(location => location.id === locId)
        .timeZone
    const zone = moment.tz.zone(timeZone)
    return zone.parse(date) / 60
}

module.exports = {
    /**
     * 
     * @param {{firstDay: Date, lastDay: Date, locId: number, charts: {serviceName: string, depth: number}[]}} request - request for getting chart data
     * 
     */

    getChartPoints: async function(request) {
        const tempRequest = TempRequest.fromObject(request)
        const allDepths = tempRequest.charts.map(chart => chart.depth) 
        const maxDepth = Math.max.apply(null, allDepths)
        
        const firstDay = moment(tempRequest.firstDay).subtract(maxDepth, 'd').toDate()
        const lastDay = moment(tempRequest.lastDay).endOf('day').toDate()
        const locId = tempRequest.locId
        const hour = countingHour + getTZoffset(locId, firstDay)
        const tempDataRequest = {
            firstDay,
            lastDay,
            hour,
            locId
        }
        const tempData = await storage.getTempData(tempDataRequest)
        const chartPoints = logic.calculatePoints(tempData, tempRequest)
        return chartPoints
    }
}
