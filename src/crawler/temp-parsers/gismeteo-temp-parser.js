const { JSDOM } = require('jsdom')
module.exports = {
	id: 2,
	name: 'GISMETEO',
	url: 'https://www.gismeteo.ru',
	opts: {},
	parseFunc: function(page) {
		const dom = new JSDOM(page);
		const results = []
		const maxtemps = dom.window.document.querySelectorAll('div.maxt')
		
		for (const maxtemp of maxtemps) {
			if (maxtemp.firstChild.tagName == 'TEMPERATURE-VALUE'){
				const temp = maxtemp
					.firstChild
					.getAttribute('value')
				results.push(parseInteger(temp))
			}
		}
		
		return results;
	}
}

function parseInteger(str) {
	return parseInt(
		str.replace(String.fromCharCode(8722), '-')
	, 10)
}