const jsdom = require('jsdom');

// const something = my.object.somehitng
// const {something} = my.object


//для уличного wi-fi термометра (у тебя работать не будет)
module.exports = {
	name: 'STREET',
	opts: {
		port: 80,
		hostname: '192.168.0.105',
	},
	parseFunc: function(page){
		const dom = new jsdom.JSDOM(page);
		const temp = dom.window.document.querySelector('h1').textContent.slice(15);
		const numTemp = Number(temp);
		if (Number.isNaN(numTemp) || temp === "") {
			throw new Error("TEMP_NOT_FOUND");
		}
		let result = []
		result.push(Math.round(numTemp*10)/10)
		return result
	}
};
