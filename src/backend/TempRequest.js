/**
 * @param {Date} firstDay
 * @param {Date} lastDay
 * @param {number} locId
 * @param {{serviceName: string, depth: number}[]} charts
 * 
 */

class TempRequest {
    constructor (firstDay, lastDay, locId, charts) {
        this.firstDay = firstDay
        this.lastDay = lastDay
        this.locId = locId
        this.charts = charts
    }
    // temprequest validation will be added
    static fromObject(req) {
        return new TempRequest(req.firstDay, req.lastDay, req.locId, req.charts)
    }
}

module.exports = {
    TempRequest: TempRequest
}