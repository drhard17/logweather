const { JSDOM } = require('jsdom');

module.exports = {
	id: 5,
	name: 'WEATHERCOM',
	url: 'https://weather.com',
	opts: {
		headers: {
			"Accept": "text/html",
			"User-Agent": "PostmanRuntime/7.22.0"
		}
	},
	parseFunc: function(page) {
		const start = page.indexOf('<style')
		const end = page.indexOf('</style>')
		page = page.slice(0, start) + page.slice(-1 * (page.length - end))

		const dom = new JSDOM(page);
		let results = []
		
		try { //first design variant
			const tds = dom.window.document
				.querySelector('tbody')
				.querySelectorAll('td.temp')
			for (const td of tds) {
				const temp = td.querySelector('span').innerHTML
				results.push(parseInt(temp, 10))
			}
		} catch (error) { //second design variant
			const temps = Array.from(dom.window.document
				.querySelector('div._-_-components-src-organism-DailyForecast-DailyForecast--DisclosureList--nosQS')
				.querySelectorAll('details')
			).filter(str => str.matches('details[data-track-string="detailsExpand"]'))
				.map(str => str.querySelector('span').innerHTML)
				.map(temp => parseInt(temp, 10))
			results = [NaN].concat(temps)
		}
		return results;
	}
};
