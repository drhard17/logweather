const {	JSDOM } = require('jsdom');
const moment = require('moment')

module.exports = {
	id: 7,
	name: 'GIDROMET',
	url: 'http://www.meteorf.ru',
	opts: {},

	parseFunc: function (page) {
		const document = new JSDOM(page).window.document;
		const today = moment().startOf('d')
		let currentTemp
		try {
			currentTemp = document
				.querySelector('div.weather-info')
				.querySelector('div.big')
				.innerHTML
		} catch (error) {
			currentTemp = document
				.querySelector('#weatherContainer')
				.querySelector('span.temperature')
				.innerHTML
		}
	 
		const tempStrings = Array.from(
			document.querySelector('table.weather-data')
			.querySelector('tbody')
			.querySelectorAll('tr')
		)

		const days = tempStrings.filter(str => str.getAttribute('class') === 'border-top')
			.map(tr => parseInt(
					tr.querySelector('div.date > strong > span')
					.innerHTML
			, 10))
		const temps = tempStrings.filter(str => str.getAttribute('class') !== 'border-top')
			.map(tr => tr.querySelector('div.temp')
				.querySelector('div.big')
				.innerHTML
			)
		const tempDays = temps.map((temp, i) => {
			return {temp, day: days[i]}
		})

		const result = tempDays
			.filter(tempDay => tempDay.day !== today.date() && !Number.isNaN(tempDay.day)) 
			.map(tempDay => tempDay.temp)
		result.unshift(currentTemp)

		return result.map(temp => parseInt(temp, 10))
	}
}