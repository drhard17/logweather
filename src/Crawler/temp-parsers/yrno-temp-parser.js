const { JSDOM } = require('jsdom');
const moment = require('moment')
const array = require('lodash/array');

module.exports = {
	id: 6,
	name: 'YRNO',
	url: 'https://www.yr.no',
	opts: {},
	parseFunc: function(page) {
		const dateFormat = 'DD/MM/YYYY'
		const today = moment().startOf('d')
		const document = new JSDOM(page).window.document
	
		const trs = Array.from(document.querySelectorAll('#detaljert > tbody > tr'))
		const blocks = array.chunk(trs, 4)
		array.remove(blocks, block => block.length < 3)

		const tempsDates = blocks.map(block => {
			const day = moment(
				block[0]
					.querySelector('th')
					.innerHTML
			 , dateFormat)
			const temp = parseInt(
				block[2]
					.querySelectorAll('td')[2]
					.innerHTML
			, 10)
			return {day, temp}
		})

		const results = tempsDates
			.filter(rec => rec.day.isAfter(today))
			.map(rec => rec.temp)

		results.unshift(NaN)
		return results
	}
};
