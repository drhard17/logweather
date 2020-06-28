class TempRecord {

    /**
     * 
     * @param {string} serviceId - name of a forecast service
     * @param {Date} datetime - time of the request
     * @param {number[]} temps - parsed temps from the service
     * @param {number} locId - location Id
     */

    constructor(datetime, serviceId, locId, temps) {
        this.datetime = datetime
        this.serviceId = serviceId
        this.temps = temps
        
        const _locId = parseInt(locId, 10)
        if (Number.isNaN(_locId) || _locId < 100) { throw new Error('INVALID_LOCATION_ID') }
        this.locId = _locId

        const _serviceId = parseInt(serviceId, 10)
        if (Number.isNaN(_serviceId) || _serviceId > 8) { throw new Error('INVALID_SERVICE_ID') }
        this.serviceId = _serviceId
    }
        set temps(value) {
            if (typeof value === 'number' || value === undefined) {
                this._temps = [value]
            } else if ((value instanceof Array) && value.every(a => (typeof a === 'number') || (a === null))) {
                this._temps = value
            } else {
                throw new Error('INVALID_TEMPERATURE_VALUE')
            }
        }
        get temps() {
            return this._temps
        }

        set datetime(value) {
            if (!(value instanceof Date) || value === undefined) {
                throw new Error('INVALID_TIME_VALUE')
            }
            this._datetime = value
        }

        get datetime() {
            return this._datetime
        }
}

module.exports = {
    TempRecord: TempRecord
}