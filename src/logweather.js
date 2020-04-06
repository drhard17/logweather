const schedule = require('node-schedule');
const https = require('https');
const fs = require('fs');

const output = require('./output.js')
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
		if (config.saveHTML) output.saveHTML(site.name, siteCode)
		
		let temps = []
		try {
			temps = site.parseFunc(siteCode)
		} catch (err) {
			temps = ['Parse error']
		}

		cb(site.name, temps)
	});
}

//запуск парсинга по расписанию
function scheduled(minutes) {
	if (config.pollOnce) {
		main()
		return
	}
	let rule = new schedule.RecurrenceRule();
	rule.minute = minutes //[0, 15, 30, 45]
	let j = schedule.scheduleJob(rule, function() {
		main()
	});
	console.log('Logweather scheduled service running.')
	console.log('Parse in minutes: ' + minutes)
}

function main() {
	let outFunc
	config.toConsoleOnly ? outFunc = output.toConsole : outFunc = output.toCSV
	for (let site of sites) {
		if (config.sitesToPoll[site.name]) {
				getTempFrom(site, outFunc)
			}
	}
}

if (!module.parent) {
	scheduled(config.pollInMinutes);
}