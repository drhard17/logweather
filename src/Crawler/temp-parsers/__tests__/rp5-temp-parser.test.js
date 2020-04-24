describe('rp5-temp-parser', () => {

    const fs = require('fs');
    const parser = require('../rp5-temp-parser');
    let samplePage;

    beforeAll(()=>{
        samplePage = fs.readFileSync(`${__dirname}/rp5-temp-parser/RP5t.html`, 'utf-8')
        wrongPage = fs.readFileSync(`${__dirname}/rp5-temp-parser/RP5wrong.html`, 'utf-8')
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

    it('should throw an error', () => {
        const foo = function () {
            try {
                parser.parseFunc(wrongPage)
            } catch {
                throw Error('Parse error')
            }
        }
        expect(foo).toThrow()
    });
});



