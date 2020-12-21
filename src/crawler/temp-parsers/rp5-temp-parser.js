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
		).map(td => {
			const day = td.querySelector('b')
				.textContent
				.split(', ')[0]
			let colspan = td.getAttribute('colspan')
			colspan = parseInt(colspan, 10)
			return {[day]: colspan}
		});
		
		const firstTempCol = ((dayString[0].Today - 1) / 2) || 0
		
		const tempString = Array.from(
			dom.window.document
				.querySelector('#forecastTable > tbody')
				.querySelectorAll('a.t_temperature')[0]
				.parentElement
				.parentElement
				.querySelectorAll('td[colspan]')
		).map(td => td.firstElementChild.textContent)

		for (let i = firstTempCol + 2; i < tempString.length; i += 4) {
			const temp = tempString[i]
			results.push(parseInt(temp, 10))
		}
		return results
	}
};
