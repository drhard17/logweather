const { JSDOM } = require('jsdom');
module.exports = {
	opts: {
		hostname: 'meteoinfo.ru',
		path: '/forecasts/russia/moscow-area/moscow',
		port: 443,
	},
	name: 'GIDROMET',
	parseFunc: function(page) {
		//const dom = new JSDOM(page);
		const dom = new JSDOM(page, { runScripts: "dangerously", resources: "usable", pretendToBeVisual: true });
		//dom.eval('id_city=1641; get_ajax_country()')
		let results = dom.window.document.body

		return results;
	}
};
