const {	JSDOM } = require('jsdom');
const moment = require('moment')

module.exports = {
	name: 'GIDROMET',
	opts: {
		hostname: 'www.meteorf.ru',
		path: '/product/weather/3420/',
		port: 80,
	},

	parseFunc: function (page) {

		const document = new JSDOM(page).window.document;
		const today = moment().startOf('d')

		const currentTemp = document
			.querySelector('div.weather-info')
			.querySelector('div.big')
			.innerHTML	 
/* 		
		let currentTemp
		const todayOnSite = moment(document
				.querySelector('div.weather-info > div.weather-img > strong')
				.innerHTML
				.match(/\d{1,2}\.\d{2}\.\d{4}/)[0]
			, 'D.MM.YYYY')
		
		if (today.isSame(todayOnSite)) {
			currentTemp = document.querySelector('div.weather-info')
			.querySelector('div.big')
			.innerHTML	
		} else {
			currentTemp = NaN
		}
 */		
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
			.filter(tempDay => tempDay.day > today.date())
			.map(tempDay => tempDay.temp)
		result.unshift(currentTemp)

		return result.map(temp => parseInt(temp, 10))
	}
}