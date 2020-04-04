const schedule = require('node-schedule');
const https = require('https');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'))

//загрузка модулей парсеров
let sites = []
for (let siteName in config.sitesToPoll) {
	sites.push(require(`./temp-parsers/${siteName}-temp-parser`))
}

//получение html-страницы по url адресу
function request(opts, cb) {
	const req = https.request(opts, (res) => {
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
module.exports = {
	toCSV: function(name, temp) {
		let folder = '../csv'

		try {
		if (!fs.existsSync(folder)){
			fs.mkdirSync(folder)
		}
		} catch (err) {
			console.error(err)
		}

		fs.appendFile(`${folder}/${name}.csv`, addDate(temp).toString(), (err) => {
			console.log(err || `${temp} added to ${name}.csv`);
			console.log('')
		});
	}
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
function scheduled(minutes) {
	if (config.pollOnce) {
		main()
		return
	}
	let rule = new schedule.RecurrenceRule();
	rule.minute = minutes
	let j = schedule.scheduleJob(rule, function() {
		main()
	});
	console.log('Logweather scheduled service running.')
	console.log('Parse in minutes: ' + minutes)
}

function main() {
	let outFunc
	config.toConsoleOnly ? outFunc = toConsole : outFunc = module.exports.toCSV
	for (let site of sites) {
		if (config.sitesToPoll[site.name]) {
				getTempFrom(site, outFunc)
			}
	}
}

if (!module.parent) {
	scheduled(config.pollInMinutes);
}