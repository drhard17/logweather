class TempRecord {

    /**
     * 
     * @param {string} service - name of a forecast service
     * @param {Date} time
     * @param {number[]} temps
     */

    constructor(service, location, time, temps) {
        this.service = service
        this.time = time
        this.temps = temps
        this.location = location
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