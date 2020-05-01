const schedule = require('node-schedule');
const https = require('https');
const fs = require('fs');

const output = require('../backend/csv-writer.js')
const config = JSON.parse(fs.readFileSync('./config.json'))
const errorHandler = require('./error-handler').errorHandler

//загрузка модулей парсеров
let sites = []
for (let siteName in config.sitesToPoll) {
	sites.push(require(`./temp-parsers/${siteName}-temp-parser`))
}

//получение html-страницы по url адресу
function getSiteCode(opts, cb) {
	const req = https.request(opts, (res) => {
		if (res.statusCode != 200) {
			cb({
				type: 'REQUEST_ERROR',
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
	req.on('error', (err) => {
		cb({
			type: 'REQUEST_ERROR',
			message: err.message
		});
	});
}

/**
 * Функция получения массива температур с сайта site
 * 
 * @param {*} site 
 * @param {(err: Error, data: any) => void} cb
 */
function getTempFrom(site, cb) {
	
	const cbCommonData = {
		requestTime: new Date(),
		siteName: site.name,
		siteOpts: site.opts,
		siteCode: null,
	};

	getSiteCode(site.opts, (err, siteCode) => {
		if (err) {
			cb(err, cbCommonData);
			return
		}
		
//		siteCode = fs.readFileSync('../saved-html/RP5wrong.html')
		cbCommonData.siteCode = siteCode;

		try {
  		    const temps = site.parseFunc(siteCode)
		    cb(null, {
				temps,
				...cbCommonData,
			});
		} catch (err) {
			err.type = "PARSE_ERROR"
			cb(err, cbCommonData);
		}
	});
}

function storeSiteData(site, outFunc, err, data) {
	const siteCode = data.siteCode;
			
	if (err) {
		if (siteCode != null) {
			output.saveHTML(site.name, siteCode);
		}
		errorHandler(err, data);
		return;
	}

	if (config.saveHTML && siteCode != null) {
		output.saveHTML(site.name, siteCode);
	}

	outFunc(site.name, data.temps);
}

function poll() {
	let outFunc = config.toConsoleOnly ? output.toConsole : output.toCSV
	for (let site of sites) {
		if (!config.sitesToPoll[site.name]) {
			continue;
		}
		const storeCurrentSiteData = storeSiteData.bind(null, site, outFunc);
		getTempFrom(site, storeCurrentSiteData);
	}
}

//запуск парсинга по расписанию
function main() {
	if (config.pollOnce) {
		poll()
		return
	}
	let rule = new schedule.RecurrenceRule();
	rule.minute = config.pollInMinutes //[0, 15, 30, 45]
	schedule.scheduleJob(rule, function() {
		poll()
	});
	console.log('Logweather scheduled service running.')
	console.log('Parse in minutes: ' + rule.minute)
}

if (!module.parent) {
	main();
}