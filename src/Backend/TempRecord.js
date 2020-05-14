class TempRecord {

    /**
     * 
     * @param {string} service - name of a forecast service
     * @param {Date} time
     * @param {number[]} temps
     */

    constructor(service, time, temps) {

        this.service = service
        this.time = time
        this.temps = temps

    }
    set temps(value) {
        let ts = []
        if (typeof value === 'number') {
            ts = [value]
        } else if ((value instanceof Array) && value.every(a => (typeof a === 'number'))) {
            ts = value
        } else {
            throw new Error('INVALID_TEMPERATURE_VALUE')
        }
        if (ts.every(a => Number.isNaN(a))) {
            throw new Error('ALL_NAN_TEMPERATURES')
        } else if (ts.some(t => (t < -70 || t > 60))) {
            throw new Error(`TEMPERATURE_OUT_OF_RANGE_${ts.join('_')}`)
        } else {
            this._temps = ts
        }
    }
    get temps() {
        return this._temps
    }

    set time(value) {
        if (!(value instanceof Date)) {
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

if (!module.parent) {
    const yup = require('yup')

    let tr = new module.exports.TempRecord('STREET', new Date('2020/05/02'), [10, -10])
    console.log(tr)

    let schema = yup.object().shape({
        service: yup.string().required(),
        time: yup.date().required(),
        temps: yup.array().of(yup.number().min(-30)).required()
  
      });
      
      // check validity
      const a = schema
        .isValid(tr)
        .then(function(valid) {
            console.log(valid)
            
        })
    
        console.log(a)
}