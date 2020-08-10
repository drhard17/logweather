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
			if (maxtemp.childNodes.length === 2){
				const temp = maxtemp
					.querySelectorAll('span')[0]
					.innerHTML
				results.push(parseInt(temp,10))
			}
		}

		return results;
	}
}
