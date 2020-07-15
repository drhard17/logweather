const jsdom = require('jsdom');
const { JSDOM } = jsdom;
module.exports = {
	opts: {
		hostname: 'www.accuweather.com',
		path: '/ru/ru/krasnogorsk/289248/daily-weather-forecast/289248',
		port: 443,
		headers: {
			"Accept": "text/plain",
			"User-Agent": "PostmanRuntime/7.22.0"
		}
	},
	name: 'ACCUWEATHER',
	parseFunc: function(page) {
		const dom = new JSDOM(page);

		const headerTemp = dom.window.document.querySelector('span.header-temp')
		const innerSpan = headerTemp.querySelector('span')
		headerTemp.removeChild(innerSpan)
		const currentTemp = headerTemp.innerHTML
		
		let results = []
		let temps = dom.window.document
			.querySelector('div.page-column-1')
			.querySelectorAll('span.high')
		for (let temp of temps) {
			results.push(parseInt(temp.innerHTML, 10))
		}
		results[0] = parseInt(currentTemp, 10)
		return results;
	}
};
