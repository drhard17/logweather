class TempRecord {

    /**
     * 
     * @param {Date} datetime - time of the request
     * @param {string} serviceName - name of a forecast service
     * @param {number} locId - location Id
     * @param {number[]} temps - parsed temps from the service
     */

    constructor(datetime, serviceName, locId, temps) {
        this.datetime = datetime
        this.serviceName = serviceName
        this.temps = temps
        
        const _locId = parseInt(locId, 10)
        if (Number.isNaN(_locId) || _locId < 100) {
            throw new Error('INVALID_LOCATION_ID')
        }
        this.locId = _locId

    }
        set temps(value) {
            if (typeof value === 'number' || value === undefined) {
                this._temps = [value]
            } else if ((value instanceof Array) && value.every(a => (typeof a === 'number') || (a === null))) {
                this._temps = value
            } else {
                throw new Error('INVALID_TEMPERATURE_VALUE')
            }
            if (value < -50 || value > 50) {
                throw new Error('IMPOSSIBLE_TEMPERATURE_VALUE')
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
/* 
function main() {
    const tr = new TempRecord(new Date(), 'YANDEX', 101, -10)
    tr.locId = 102
    console.log(tr.temps, tr.locId)
}

main() 
*/