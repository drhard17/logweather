const { JSDOM } = require('jsdom');
module.exports = {
	opts: {
		hostname: 'weather.com',
		path: '/ru-RU/weather/tenday/l/5dee46352b93411b346eb161aaf601f33320283181d1f8aa42afe10f700e00ff',
		port: 443,
		headers: {
			"Accept": "text/html",
			"User-Agent": "PostmanRuntime/7.22.0"
		}
	},
	name: 'WEATHERCOM',
	parseFunc: function(page) {
		let start = page.indexOf('<style')
		let end = page.indexOf('</style>')
		page = page.slice(0, start) + page.slice(-1 * (page.length - end))
				
		const dom = new JSDOM(page, { runScripts: "dangerously", pretendToBeVisual: true });
		let results = []
		
		let currTemp = dom.window.document
			.querySelector('span.styles__temperature__1VbnH')
						
		//console.log('Current: ' + currTemp.outerHTML)
		//console.log(this.opts.hostname)
		
		let tds = dom.window.document
			.querySelector('tbody')
			.querySelectorAll('td.temp')
		for (let td of tds) {
			let temp = td.querySelector('span').innerHTML
			results.push(parseInt(temp, 10))
		}
		return results;
	}
};
