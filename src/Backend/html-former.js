const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

const csvFile = '../csv/STREET.csv'
const htmlFile = './frontend/index.html'

module.exports = {
    getHTML: function(cb) {
        fs.readFile(htmlFile, (err, htmlData) => {
            if (err) {
                cb(err)
                return
            }
            fs.readFile(csvFile, (err, csvData) => {
                if (err) {
                    cb(err)
                    return
                }
                const temp = getLastTemp(csvData)
                const dom = new JSDOM(htmlData)

                //let tempHeader = dom.window.document.createElement('h2')
                let tempHeader = dom.window.document.getElementById('tempHeader')
                tempHeader.innerHTML = 'Temperature in Opaliha: ' + temp + '&deg;C'
                //dom.window.document.body.querySelector('h1').after(tempHeader)

                cb(null, dom.serialize())
            });
        });
    }
}

function getLastTemp(data) {
		let csvStrings = data.toString().split('\r\n')
		let temp = csvStrings[csvStrings.length-2].split(',')[2]
        return temp
}



