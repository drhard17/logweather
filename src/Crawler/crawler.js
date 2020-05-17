const schedule = require('node-schedule');
const https = require('https');
const fs = require('fs');

const { TempRecord } = require('../Backend/TempRecord')
const storage = require('../Backend/csv-storage.js')
const logger = require('./cr-logger')


/**
 * Gets webpage HTML code
 * @param {{hostname: String, path: String, port: Number, headers: String}} opts - common HTTP request options
 * @returns {Promise<string>}
 */
function getSiteCode(opts) {
	return new Promise((resolve, reject) => {
		const req = https.request(opts, (res) => {
			if (res.statusCode != 200) {
				reject({
					type: 'REQUEST_ERROR',
					message: `Recieved status code ${res.statusCode}`
				});
				return;
			}
	
			let rawData = [];
			res.on('data', (d) => rawData.push(d));
			res.on('end', () =>	{
				const siteCode = Buffer.concat(rawData).toString('utf8');
				resolve(siteCode);
			});
		});
	
		req.end();
		req.on('error', (err) => {
			reject({
				type: 'REQUEST_ERROR',
				message: err.message
			});
		});
	});
}

/**
 * Gets an array of temperatures from the website
 * 
 * @param {{*}} site 
 * @param {(err: Error, data: any) => void} cb
 */
function getTempFrom(site, location, cb) {
	site.setLocation(location)
	const cbCommonData = {
		requestTime: new Date(),
		location,
		siteName: site.name,
		siteOpts: site.opts,
		siteCode: null,
	};

	getSiteCode(site.opts).then((siteCode) => {
		//siteCode = fs.readFileSync('../saved-html/RP5wrong.html')
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
	}, (err) => {
		cb(err, cbCommonData);
	});
}

function storeSiteData(opts, err, data) {
	const siteCode = data.siteCode;
	const siteName = data.siteName
	const reqTime = data.requestTime
	const temps = data.temps
	const location = data.location
			
	if (err) {
		if (siteCode != null) {
			logger.storeSiteCode(siteName, reqTime, siteCode);
		}
		logger.logError(err, data);
		return;
	}

	if (opts.storeSiteCode && siteCode != null) {
		logger.storeSiteCode(siteName, reqTime, siteCode);
	}
	
	const tr = new TempRecord(siteName, location, reqTime, temps)
	if (!opts.storeTemps) {
		logger.logSuccess(tr)
		return	
	}
	storage.storeTempRecord(tr)
}

function poll(sites, locations, storingOpts) {
	for (let site of sites) {
		for (let location of locations[site.name]) {
			const storeCurrentSiteData = storeSiteData.bind(null, storingOpts);
			getTempFrom(site, location, storeCurrentSiteData);
		}
	}
}

function main() {
	const config = JSON.parse(fs.readFileSync('./config.json'))
	const storingOpts = config.storing
	const sites = Object.keys(config.sitesToPoll)
		.filter(site => config.sitesToPoll[site])
		.map(site => require(`./temp-parsers/${site}-temp-parser`))
	const locations = {}
	sites.forEach(site => locations[site.name] = storage.getSiteLocations(site.name))

	if (config.pollOnce) {
		poll(sites, locations, storingOpts)
		return
	}

	let rule = new schedule.RecurrenceRule();
	rule.minute = config.pollInMinutes //[0, 15, 30, 45]
	schedule.scheduleJob(rule, function () {
		poll(sites, locations, storingOpts)
	});
	console.log('Logweather crawler running...')
	console.log('Parse in minutes: ' + rule.minute)
}

if (!module.parent) {
	main();
}