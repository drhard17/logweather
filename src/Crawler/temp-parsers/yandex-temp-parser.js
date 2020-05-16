// объект для Яндекса, содержащий адрес сайта и функцию для парсинга температуры
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

module.exports = {
	name: 'YANDEX',
	opts: {
		hostname: 'yandex.ru',
		path: '/pogoda/krasnogorsk/details?via=ms',
		port: 443,
	},

	setLocation: function(location) {
		this.opts.path = '/pogoda/' + location + '/details?via=ms'
	},

	parseFunc: function(page) {
		const dom = new JSDOM(page);
		let cards = dom.window.document.querySelectorAll('div.card'); //парсим карточки с прогнозами для 10 дней
		
		let results = [];
		
		for (let card of cards){ 
			if (card.childNodes.length === 2) { //пропускаем рекламные карточки
				//days.push(card) 
				let temps = card //идем по дереву DOM
					.querySelectorAll('tr')[2]
					.querySelector('td')
					.querySelector('div')
					.querySelectorAll('div')[1]
					.querySelectorAll('span.temp__value')
					
				let tempSum = 0; //иногда в прогнозе пишут диапазон температур от... до..., вычисляем среднее
				temps.forEach((temps) => {
					temps = temps.innerHTML.replace(String.fromCharCode(8722), '-')
					tempSum += parseInt(temps, 10)
				})
				
				temp = tempSum / temps.length
				results.push(temp)
			}
		}
		
		return results;
	}
};
