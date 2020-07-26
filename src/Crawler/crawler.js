const schedule = require('node-schedule');
const https = require('https');
const http = require('http');
const fs = require('fs');

const { TempRecord } = require('../Backend/TempRecord')
const storage = require('../Backend/db-storage.js')
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
 * @param {{id: number, name: string, nameRus: string, routes: {[siteName]: string}[]}} location
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

	site.opts.path = location.routes[site.name]

	try {
		const siteCode = await getSiteCode(site.opts)
		commonData.siteCode = siteCode
		const temps = site.parseFunc(siteCode)
		return {temps, ...commonData};
	} catch (err) {
		if (commonData.siteCode) err.type = "PARSE_ERROR"
		return {err, ...commonData};
	}
}
	
function storeSiteData(opts, sitesData) {
	const tempRecords = []
	for (const siteData of sitesData) {	
		const { siteCode, siteName, requestTime, temps, location } = siteData
		if (opts.storeSiteCode && siteCode != null) {
			logger.storeSiteCode(siteName, requestTime, siteCode);
		}
		tempRecords.push(new TempRecord(requestTime, siteName, location.id, temps))
	}
	if (!opts.storeTemps) {
		logger.logSuccess(tempRecords)
		return	
	}
	storage.storeTempRecords(tempRecords)
}

function errorHandler(sitesData) {
	sitesData.forEach(siteData => {
		const { siteCode, siteName, requestTime, err } = siteData
		if (siteCode != null) {
			logger.storeSiteCode(siteName, requestTime, siteCode);
		}
		logger.logError(err, siteData);
	})
}

async function poll(sites, locations, storingOpts) {
	for (let location of locations) {
		const promises = []
		for (let site of sites) {
			if (!Object.keys(location.routes).includes(site.name)) { continue }
			promises.push(getTempFrom(site, location))
		}
		const allSiteData = await Promise.all(promises)
		const errData = allSiteData.filter(siteData => siteData.err)
		const parsedData = allSiteData.filter(siteData => !siteData.err)

		if (errData.length) { errorHandler(errData) }
		if (parsedData.length) { storeSiteData(storingOpts, parsedData) }
		
	}
}

function main() {
	const config = JSON.parse(fs.readFileSync('./config.json'))
	const storingOpts = config.storing
	const locLimit = config.locLimit || undefined
	const locations = JSON.parse(fs.readFileSync('./locations.json')).slice(0, locLimit)

	const sites = Object.keys(config.sitesToPoll)
		.filter(site => config.sitesToPoll[site])
		.map(site => require(`./temp-parsers/${site}-temp-parser`))
	
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
