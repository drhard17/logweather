describe('chart-logic-csv', () => {
    const getcp = require('../chart-logic-csv.js')
    const tempRequest = {
        firstDay: new Date('2020-04-06'),
        lastDay: new Date('2020-04-12'),
        hour: 14,
        services: [
            {name: 'STREET', depth: 0},
            {name: 'GIDROMET', depth: 3}, 
            {name: 'YANDEX', depth: 3}, 
            {name: 'GISMETEO', depth: 3},
            {name: 'YRNO', depth: 3}, 
            {name: 'RP5', depth: 3},
            {name: 'WEATHERCOM', depth: 3},
            {name: 'ACCUWEATHER', depth: 3}
        ]
    }
    const tempResponse = {
        labels: [
            new Date('2020-04-06'),
            new Date('2020-04-07'),
            new Date('2020-04-08'),
            new Date('2020-04-09'),
            new Date('2020-04-10'),
            new Date('2020-04-11'),
            new Date('2020-04-12'),
        ],
        points: [
            {service: 'STREET', depth: 0, temps: [4, 8, 12, 15, 8, 5, 6]}, 
            {service: 'GIDROMET', depth: 3, temps: [NaN, NaN, NaN, NaN, NaN, NaN, NaN]},
            {service: 'YANDEX', depth: 3, temps: [7, 10, 9, 14, 8, 3, 5]},
            {service: 'GISMETEO', depth: 3, temps: [10, 7, 9, 14, 9, 3, 5]},
            {service: 'YRNO', depth: 3, temps: [1, 7, 7, 8, 3, 1, 4]}, 
            {service: 'RP5', depth: 3, temps: [NaN, NaN, NaN, NaN, 9, 4, 5]},
            {service: 'WEATHERCOM', depth: 3, temps: [8, 11, 11, 15, 9, 5, 7]},
            {service: 'ACCUWEATHER', depth: 3, temps: [8, 14, 10, 14, 10, 5, 6]}
        ]
    }

    it('should work', () => {
        expect(true).toBe(true);
    });

    it('should return an object', done => {
        function cb(err, data) {
            if (err) {
                done(err)
                return
            }
            expect(data).toBeInstanceOf(Object)
            done()
        }
        getcp.getChartPoints(tempRequest, cb)
    })

    it('should match to tempResponse', done => {
        function cb(err, data) {
            if (err) {
                done(err)
                return
            }
            expect(data).toMatchObject(tempResponse)
            done()
        }
        getcp.getChartPoints(tempRequest, cb)
    })
})
