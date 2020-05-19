const {	JSDOM } = require('jsdom');

module.exports = {
	name: 'GIDROMET',
	opts: {
		hostname: 'www.meteorf.ru',
		path: '/product/weather/3420/',
		port: 80,
	},

	parseFunc: function (page) {
		const doc = new JSDOM(page).window.document;

		const currentTemp = doc.querySelector('div.weather-info')
			.querySelector('div.big')
			.innerHTML

		const tempStrings = Array.from(
			doc.querySelector('table.weather-data')
			.querySelector('tbody')
			.querySelectorAll('tr')
		)

		const temps = tempStrings.filter((item, index) => index % 2 === 1)
			.map(tr => tr.querySelector('div.temp')
				.querySelector('div.big')
				.innerHTML
			)
	
		temps.unshift(currentTemp)
		return temps.map(temp => parseInt(temp, 10))
	}
}