const { JSDOM } = require('jsdom');
module.exports = {
	name: 'WEATHERCOM',
	opts: {
		hostname: 'weather.com',
		path: '/ru-RU/weather/tenday/l/5dee46352b93411b346eb161aaf601f33320283181d1f8aa42afe10f700e00ff',
		port: 443,
		headers: {
			"Accept": "text/html",
			"User-Agent": "PostmanRuntime/7.22.0"
		}
	},
	parseFunc: function(page) {
		let start = page.indexOf('<style')
		let end = page.indexOf('</style>')
		page = page.slice(0, start) + page.slice(-1 * (page.length - end))

		const dom = new JSDOM(page);
		let results = []
		
		try {
			let tds = dom.window.document
				.querySelector('tbody')
				.querySelectorAll('td.temp')
			for (let td of tds) {
				let temp = td.querySelector('span').innerHTML
				results.push(parseInt(temp, 10))
			}
		} catch (error) {
			const temps = Array.from(dom.window.document
				.querySelector('div._-_-components-src-organism-DailyForecast-DailyForecast--DisclosureList--nosQS')
				.querySelectorAll('details')
			).filter(str => str.matches('details[data-track-string="detailsExpand"]'))
			.map(str => str.querySelector('span').innerHTML)
			.map(temp => parseInt(temp, 10))
			results = [NaN].concat(temps)
			// console.log('WEATHERCOM test site')
		}
		return results;
	}
};
