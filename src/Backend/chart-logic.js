const moment = require('moment');

module.exports = {

    /**
     * 
     * @param {{datetime: Date, serviceName: string, depth: number, temp: number[]}} data - Temperature data
     * @param {{firstDay: Date, lastDay: Date, locId: number, charts: {serviceName: string, depth: number}[]}} tempRequest - request for getting chart data
     * @returns {{labels: Date[], points: {serviceName: string, depth: number, temps: number[]}[]}}
     * 
     */

    calculatePoints: function (data, tempRequest) {
        const labels = getDaySequence(tempRequest.firstDay, tempRequest.lastDay)
        const points = tempRequest.charts.map((chart) => {
            const req = {
                firstDay: moment(tempRequest.firstDay).subtract(chart.depth, 'd'),
                lastDay: moment(tempRequest.lastDay).subtract(chart.depth, 'd').endOf('day'),
                depth: chart.depth
            }
       
            
            const tempData = extractData(data, chart.serviceName, req, tempRequest.locId)
            const tempPoints = countPoints(tempData, req)
            return {
                serviceName: chart.serviceName,
                depth: chart.depth,
                temps: tempPoints
            }
        })
        return {
            labels,
            points
        }
    }
}

/**
 * 
 * @param {{service: string, time: Date, temps: number[]}[]} data - All data from CSV files
 * @param {string} service - forecast service name
 * @param {{firstDay: moment, lastDay: moment, depth: number}} req 
 * @param {number} hour 
 * 
 */

function extractData(data, serviceName, req) {
   
    return data
        .filter((record) => {
            return record.serviceName === serviceName
        })
        .map(record => {
            record.datetime = moment(record.datetime)
            return record
        })
        .filter((record) => {
            return record.datetime.isBetween(req.firstDay, req.lastDay)
        })
        .filter((record) => {
            return record.depth === req.depth
        })
  }

/**
 * 
 * @param {{serviceName: string, datetime: moment, temps: number[]]}[]} data 
 * @param {{firstDay: Date, lastDay: Date, depth: number}} req
 * 
 */

function countPoints(data, req) {
    const dates = getDaySequence(req.firstDay, req.lastDay)
    return dates.map((date) => {
        return avgRound(
            data.filter((record) => {
                return moment(date).startOf('day').isSame(moment(record.datetime).startOf('day'))
            })
            .map(record => record.temp)
        )
    })
}

/**
 * 
 * @param {Date} firstDay 
 * @param {Date} lastDay 
 * @returns {Date[]} 
 * 
 */

function getDaySequence(firstDay, lastDay) {
    const dates = []
    for (let d = moment(firstDay); d.isSameOrBefore(moment(lastDay)); d.add(1, 'd')) {
        dates.push(new Date(d.toISOString()))
    }
    return dates
}

/**
 * Counts an average value of a number array and rounds it
 * @param {number[]} nums 
 * @returns {number}
 */

function avgRound(nums) {
    if (!nums.length) return NaN
    const a = nums.reduce((a, b) => (a + b)) / nums.length;
    return Math.round(a)
}
