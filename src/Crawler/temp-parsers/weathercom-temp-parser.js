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
		const { document } = new JSDOM(page).window;
		const temps = Array.from(document
			.querySelector('div._-_-node_modules-\\@wxu-components-src-organism-DailyForecast-DailyForecast--DisclosureList--350ZO')
			.querySelectorAll('details')
		).filter(str => str.matches('details[data-track-string="detailsExpand"]'))
			.map(str => str.querySelector('span').innerHTML)
			.map(temp => parseInt(temp, 10))
		return [NaN].concat(temps)
	}
};
