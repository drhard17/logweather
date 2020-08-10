const jsdom = require('jsdom');
const { JSDOM } = jsdom;
module.exports = {
	id: 4,
	name: 'ACCUWEATHER',
	url: 'https://www.accuweather.com',
	opts: {
		headers: {
			"Accept": "text/plain",
			"User-Agent": "PostmanRuntime/7.22.0"
		}
	},
	
	parseFunc: function(page) {
		const dom = new JSDOM(page);

		const headerTemp = dom.window.document.querySelector('span.header-temp')
		const innerSpan = headerTemp.querySelector('span')
		headerTemp.removeChild(innerSpan)
		const currentTemp = headerTemp.innerHTML
		
		const results = []
		const temps = dom.window.document
			.querySelector('div.page-column-1')
			.querySelectorAll('span.high')
		for (let temp of temps) {
			results.push(parseInt(temp.innerHTML, 10))
		}
		results[0] = parseInt(currentTemp, 10)
		return results;
	}
};
