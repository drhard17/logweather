describe('rp5-temp-parser', () => {

    const fs = require('fs');
    const parser = require('../rp5-temp-parser');
    let samplePage;

    beforeAll(()=>{
        samplePage = fs.readFileSync(`${__dirname}/RP5t.html`, 'utf-8')
        samplePageTwo = fs.readFileSync(`${__dirname}/RP5.html`, 'utf-8')
    });

    it('should work', () => {
        expect(true).toBe(true);
    });

    it('should return an array', () => {
        const result = parser.parseFunc(samplePage)
        expect(result).toBeInstanceOf(Array)
    });
    
    it('should return 7 values', () => {
        const result = parser.parseFunc(samplePage)
        expect(result).toHaveLength(7)
    });

    it('should return correct temperatures', () => {
        const result = parser.parseFunc(samplePage)
        expect(result).toEqual([0, 8, 10, 13, 9, 5, 3])
    });

    it('should return correct temperatures', () => {
        const result = parser.parseFunc(samplePageTwo)
        expect(result).toEqual([4, 7, 11, 13, 8, 7])
    });
});



