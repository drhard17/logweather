const { JSDOM } = require('jsdom');

module.exports = {
	id: 8,
	name: 'RP5',
	url: 'https://rp5.ru',
	opts: {},
	
	parseFunc: function(page) {
		const dom = new JSDOM(page)
		const results = []
		
		const currentTemp = parseInt(
			dom.window.document
			.querySelector('#archiveString')
			.querySelector('span')
			.textContent
		, 10)
		results.push(currentTemp)

		const dayString = Array.from(
			dom.window.document
			.querySelector('tr.forecastDate')
			.querySelectorAll('td[colspan]')
		)
			.map(a => {
				const day = a.querySelector('b').textContent
				let cs = a.getAttribute('colspan')
				cs = parseInt(cs, 10)
				return {[day]: cs}
			});

		const firstTemp = (dayString[0].Today / 2) || 0

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
