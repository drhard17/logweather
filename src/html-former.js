const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

const csvFile = '../csv/STREET.csv'
const htmlFile = './html/index.html'

module.exports = {
    addTemp: function(cb) {
        fs.readFile(htmlFile, (err, htmlData) => {
            if (err) {
                console.log(err)
                return
            }
            fs.readFile(csvFile, (err, csvData) => {
                if (err) {
                    console.log(err)
                    return
                }
                const temp = getLastTemp(csvData)
                const dom = new JSDOM(htmlData)

                let div = dom.window.document.createElement('h2')
                div.innerHTML = 'Temperature in Opaliha: ' + temp + '&deg;C'
                dom.window.document.body.append(div)

                cb(dom.serialize())
            });
        });
    }
}

function getLastTemp(data) {
		let csvStrings = data.toString().split('\r\n')
		let temp = csvStrings[csvStrings.length-2].split(',')[2]
        return temp
}



