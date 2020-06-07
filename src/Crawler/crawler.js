const schedule = require('node-schedule');
const https = require('https');
const http = require('http');
const fs = require('fs');

const { TempRecord } = require('../Backend/TempRecord')
const storage = require('../Backend/csv-storage.js')
const logger = require('./cr-logger')

/**
 * Gets webpage HTML code
 * @param {{hostname: string, path: string, port: number, headers: string}} opts - common HTTP request options
 * @returns {Promise<string>}
 */
const getSiteCode = (opts) => new Promise((resolve, reject) => {
	let proto
	opts.port === 80 ? proto = http : proto = https
	const req = proto.request(opts, (res) => {
		if (res.statusCode != 200) {
			return reject({
				type: 'REQUEST_ERROR',
				message: `Recieved status code ${res.statusCode}`
			});
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

/**
 * Gets an array of temperatures from the website
 * 
 * @param {{name: string, opts: {hostname: string, path: string, port: number, headers: string}, parseFunc: function}} site 
 * @param {Object} location
 * @returns {Promise<{temps: number[], requestTime: Date, siteName: string, siteOpts: {}, siteCode: string}>}
 */
async function getTempFrom(site, location) {
	const commonData = {
		requestTime: new Date(),
		location: location,
		siteName: site.name,
		siteOpts: site.opts,
		siteCode: null,
	};

	site.opts.path = location.path[site.name]

	try {
		const siteCode = await getSiteCode(site.opts)
		// const siteCode = fs.readFileSync('../saved-html/GIDROMET_wrong.html')
		commonData.siteCode = siteCode
		const temps = site.parseFunc(siteCode)
		return {temps, ...commonData};
	} catch (err) {
		if (commonData.siteCode) err.type = "PARSE_ERROR"
		return {err, ...commonData};
	}
}
	
function storeSiteData(opts, data) {
	const siteCode = data.siteCode;
	const siteName = data.siteName
	const reqTime = data.requestTime
	const temps = data.temps
	const locId = data.location.locId
	const locName = data.location.name
	
	if (opts.storeSiteCode && siteCode != null) {
		logger.storeSiteCode(siteName, reqTime, siteCode);
	}
	
	const tr = new TempRecord(siteName, locId, reqTime, temps)
	if (!opts.storeTemps) {
		logger.logSuccess(tr, locName)
		return	
	}
	storage.storeTempRecord(tr)
}

function errorHandler(data) {
	const siteCode = data.siteCode;
	const siteName = data.siteName
	const reqTime = data.requestTime
	const err = data.err

	if (siteCode != null) {
		logger.storeSiteCode(siteName, reqTime, siteCode);
	}
	logger.logError(err, data);
}

async function poll(sites, locations, storingOpts) {
	for (let location of locations) {
		const promises = []
		for (let site of sites) {
			if (!location.path[site.name]) {continue}
			promises.push(getTempFrom(site, location))
		}
		const allSiteData = await Promise.all(promises)
		allSiteData.forEach(siteData => {
			if (siteData.err) {return errorHandler(siteData)}
			storeSiteData(storingOpts, siteData)
		})
	}
}

function main() {
	const config = JSON.parse(fs.readFileSync('./config.json'))
	const storingOpts = config.storing
	const locLimit = config.locLimit
	
	const sites = Object.keys(config.sitesToPoll)
		.filter(site => config.sitesToPoll[site])
		.map(site => require(`./temp-parsers/${site}-temp-parser`))
	const locations = storage.getAllLocations(locLimit)

	if (config.pollOnce) {
		poll(sites, locations, storingOpts)
		return
	}

	const rule = new schedule.RecurrenceRule();
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
