const { JSDOM } = require('jsdom');

module.exports = {
	opts: {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		hostname: 'meteoinfo.ru',
		path: '/hmc-output/forecast/tab_1.php',
		port: 443,
		body: "lang=ru-RU&id_city=1641&has_db=1",
	},
	name: 'GIDROMET',
	parseFunc: function(page) {
		const dom = new JSDOM(page);
		let results = []
		return Array.from(
			dom.window.document.querySelectorAll(".hidden-desktop tr")
		)
		.filter(tr => !tr.querySelector("td:nth-child(1)[rowspan]"))
		.map(tr => {
			const str = tr.querySelector(".fc_temp_short").textContent;
			const temps = module.exports.extractTemps(str);
			return module.exports.avg(temps);
		});
	},
	extractTemps: function(str) {
		const rx = /[-+]?\d+/g;
		const temps = [];
		let rxRes;
		while (rxRes = rx.exec(str)) {
			temps.push(Number(rxRes[0]))
		}
		return temps;
	},
	avg: function(numbers) {
		return numbers.reduce((a, x) => a + x) / numbers.length;
	},
};
