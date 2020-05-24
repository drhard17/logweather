const { JSDOM } = require('jsdom');
module.exports = {
	name: 'YRNO',
	opts: {
		hostname: 'www.yr.no',
		path: '/place/Russia/Moscow_oblast/Krasnogorsk/long.html',
		port: 443,
	},
	
	setLocation: function (location) {
		this.opts.path = location
	},

	parseFunc: function(page) {
		const dom = new JSDOM(page);
		let results = []
		let temps = dom.window.document
			.querySelector('div.yr-content-longterm > table > tbody > tr:nth-child(2)')
			.querySelectorAll('td')
		for (let temp of temps) {
			results.push(parseInt(temp.innerHTML, 10))
		}
		return results;
	}
};
