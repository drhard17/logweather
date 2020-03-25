const schedule = require('node-schedule');
const https = require('https');
const http = require('http');
const fs = require('fs');

const STREET = require("./TempParsers/streetTempParser");
const YANDEX = require("./TempParsers/yandexTempParser");
const GISMETEO = require("./TempParsers/gismeteoTempParser");
const RP5 = require("./TempParsers/RP5TempParser");
const ACCUWEATHER = require("./TempParsers/accuweatherTempParser")
const WEATHERCOM = require("./TempParsers/weathercomTempParser")
const GIDROMET = require("./TempParsers/gidrometTempParser")
const YRNO = require("./TempParsers/yrnoTempParser")

//получение html-страницы по url адресу
function request(opts, cb) {
	let proto;
	opts.port === 80 ? proto = http : proto = https
	const req = proto.request(opts, (res) => {
		if (res.statusCode != 200) {
			cb({
				message: "Request error",
				code: res.statusCode,
			});
			return;
		}

		let rawData = [];
		res.on('data', (d) => rawData.push(d));
		res.on('end', () =>	{
			const siteCode = Buffer.concat(rawData).toString('utf8');
			cb(null, siteCode);
		});
	});

	req.end();
	req.on('error', (e) => {
		cb("ERROR2");
	});
}

//функция получения массива температур t с сайта site
function getTempFrom(site, cb) {
	request(site.opts, (error, siteCode) => {
		if (error) {
			console.log(`${site.name} ${error.message}, statusCode: ${error.code}`);
			return;
		}
		cb(site.name, site.parseFunc(siteCode))
	});
}

//вывод данных парсинга в консоль
function toConsole(name, temp) {
	console.log(`Service: ${name}`)
	console.log(`Temperatures: ${temp.toString()}`)
	console.log('')
}

//запись данных парсинга в CSV файл
function toCSV(name, temp) {

	fs.appendFile(`./csv/${name}.csv`, addDate(temp).toString(), (err) => {
		if (err) throw err;
		console.log(`${temp} added to ${name}.csv`);
	});
}

//сохранение страницы в html
function toFile(name, data) {
	fs.writeFile(`${name}.html`, data, (err) => {
		if (err) throw err;
		console.log(`${data} saved to ${name}.html`);
	});
}

//Добавление даты-времени и перевода строки для строк, добавляемых в CSV
function addDate(temps) {
	let d = new Date()
	temps.unshift(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
	temps.unshift(`${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`);
	temps.push('\r\n');
	return temps
}

//запуск парсинга по расписанию
function scheduled() {
	let rule = new schedule.RecurrenceRule();
	rule.minute = 25
	let j = schedule.scheduleJob(rule, function() {
		main(toCSV)
	});
}

function main(outFunc) {
	//getTempFrom(WEATHERCOM, outFunc);
	//getTempFrom(ACCUWEATHER, outFunc);
	//getTempFrom(RP5, outFunc);
	//getTempFrom(GISMETEO, outFunc);
	getTempFrom(YANDEX, outFunc);
	//getTempFrom(STREET, outFunc);
	//getTempFrom(GIDROMET, outFunc);
	//getTempFrom(YRNO, outFunc);
}

if (!module.parent) {
	main(toCSV);
}