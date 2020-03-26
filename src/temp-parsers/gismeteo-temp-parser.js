const { JSDOM } = require('jsdom');
module.exports = {
	opts: {
		hostname: 'www.gismeteo.ru',
		path: '/weather-krasnogorsk-11442/10-days/',
		port: 443,
	},
	name: 'GISMETEO',
	parseFunc: function(page) {
		const dom = new JSDOM(page);
		let results = []
		let maxts = dom.window.document.querySelectorAll('div.maxt');
		for (let maxt of maxts) {
			if (maxt.childNodes.length === 2){
				let temp = maxt
				.querySelectorAll('span')[0]
				.innerHTML
				results.push(parseInt(temp,10))
			}
		}
		return results;
	}
};
