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