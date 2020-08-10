const { JSDOM } = require('jsdom');

module.exports = {
	id: 2,
	name: 'YANDEX',
	url: 'https://yandex.ru',
	opts: {},

	parseFunc: function(page) {
		const dom = new JSDOM(page);
		const cards = dom.window.document.querySelectorAll('div.card'); //парсим карточки с прогнозами для 10 дней

		const results = [];
		
		for (const card of cards){ 
			if (card.childNodes.length === 2) { //пропускаем рекламные карточки
				//days.push(card) 
				const temps = card //идем по дереву DOM
					.querySelectorAll('tr')[2]
					.querySelector('td')
					.querySelector('div')
					.querySelectorAll('div')[1]
					.querySelectorAll('span.temp__value')
					
				let tempSum = 0; //иногда в прогнозе пишут диапазон температур от... до..., вычисляем среднее
				temps.forEach((temp) => {
					temp = temp.innerHTML.replace(String.fromCharCode(8722), '-')
					tempSum += parseInt(temp, 10)
				})
				
				const temp = tempSum / temps.length
				results.push(temp)
			}
		}
		return results;
	}
};
