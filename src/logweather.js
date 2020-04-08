const schedule = require('node-schedule');
const https = require('https');
const fs = require('fs');

const output = require('./output.js')
const config = JSON.parse(fs.readFileSync('./config.json'))
const errorHandler = require('./error-handler').errorHandler

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
				type: 'REQUEST ERROR',
				url: opts.hostname + opts.path,
				message: `Recieved status code ${res.statusCode}`
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
		cb({
			type: 'REQUEST ERROR',
			url: opts.hostname + opts.path,
			message: e.message
		});
	});
}

//функция получения массива температур t с сайта site
function getTempFrom(site, cb) {
	request(site.opts, (error, siteCode) => {
		if (error) {
			error.siteName = site.name
			errorHandler(error)
			return
		}
		
		if (config.saveHTML) output.saveHTML(site.name, siteCode)
		
		//siteCode = fs.readFileSync('./temp-parsers/__tests__/RP5wrong.html')

		let temps = []
		try {
  		  temps = site.parseFunc(siteCode)
		  cb(site.name, temps)
		} catch (err) {
			errorHandler({
				siteName: site.name,
				type: 'PARSER ERROR',
				url: site.opts.hostname + site.opts.path,
				message: err.message,
				htmlCode: siteCode
			});
		}
	});
}

function main() {
	let outFunc = config.toConsoleOnly ? output.toConsole : output.toCSV
	for (let site of sites) {
		if (config.sitesToPoll[site.name]) {
				getTempFrom(site, outFunc)
			}
	}
}

//запуск парсинга по расписанию
function scheduled(minutes) {
	if (config.pollOnce) {
		main()
		return
	}
	let rule = new schedule.RecurrenceRule();
	rule.minute = minutes //[0, 15, 30, 45]
	schedule.scheduleJob(rule, function() {
		main()
	});
	console.log('Logweather scheduled service running.')
	console.log('Parse in minutes: ' + minutes)
}

if (!module.parent) {
	scheduled(config.pollInMinutes);
}