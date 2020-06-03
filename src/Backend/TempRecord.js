class TempRecord {

    /**
     * 
     * @param {string} service - name of a forecast service
     * @param {Date} time - time of the request
     * @param {number[]} temps - parsed temps from the service
     * @param {number} locId - location Id
     */

    constructor(service, locId, time, temps) {
        this.service = service
        this.locId = locId
        this.time = time
        this.temps = temps
    }
        set temps(value) {
            if (typeof value === 'number' || value === undefined) {
                this._temps = [value]
            } else if ((value instanceof Array) && value.every(a => (typeof a === 'number'))) {
                this._temps = value
            } else {
                throw new Error('INVALID_TEMPERATURE_VALUE')
            }
        }
        get temps() {
            return this._temps
        }

        set time(value) {
            if (!(value instanceof Date) || value === undefined) {
                throw new Error('INVALID_TIME_VALUE')
            }
            this._time = value
        }

        get time() {
            return this._time
        }

}

module.exports = {
    TempRecord: TempRecord
}