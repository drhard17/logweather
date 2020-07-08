/**
 * @param {Date} firstDay
 * @param {Date} lastDay
 * @param {number} locId
 * @param {string} serviceName
 * @param {number} depth
 * @param {number} hour
 * 
 */

class TempRequest {
    constructor (firstDay, lastDay, locId, serviceName, depth, hour) {
        this.firstDay = firstDay
        this.lastDay = lastDay
        this.locId = locId
        this.serviceName = serviceName
        this.depth = depth
        this.hour = hour
    }
}

module.exports = {
    TempRequest: TempRequest
}