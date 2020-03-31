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
		let tempString

		let trs = dom.window.document.querySelectorAll('#forecastTable > tbody > tr');
		for (let tr of trs) {
			if (tr.innerHTML.indexOf('>Temperature<') > 0) {
				tempString = tr
			}
		}

		let temps = tempString.querySelectorAll('div.t_0')
		for (let temp of temps) {
			if (temp.querySelectorAll('span').length) {
				temp.querySelector('span').remove()
			}
			let t = temp.querySelector('b').innerHTML
			results.push(parseInt(t, 10))
		}
		return results;
	}
};
