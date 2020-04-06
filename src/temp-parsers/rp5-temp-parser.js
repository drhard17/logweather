const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = {
	opts: {
		hostname: 'rp5.ru',
		path: '/Weather_in_Krasnogorsk',
		port: 443,
	},
	name: 'RP5',
	parseFunc: function(page) {
		const dom = new JSDOM(page);
		let results = []
		
		const dayString = Array.from(
			dom.window.document
			.querySelector('tr.forecastDate')
			.querySelectorAll('td[colspan]')
		)
			.map(a => {
				let day = a.querySelector('b').textContent
				let cs = a.getAttribute('colspan')
				cs = parseInt(cs, 10)
				return {[day]: cs}
			});

		const firstTemp = dayString[0].Today / 2

		const tempString = Array.from(
			dom.window.document
			.querySelector('#t_temperature')
			.parentElement
			.parentElement
			.querySelectorAll('td[colspan]')
		)
			.map(a => a.firstElementChild.textContent)

		for (let i = firstTemp + 2; i < tempString.length; i += 4) {
			const temp = tempString[i]
			results.push(parseInt(temp, 10))
		}
		return results
	}
};
