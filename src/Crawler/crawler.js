const schedule = require('node-schedule');
const got = require('got')

const { TempRecord } = require('../Backend/TempRecord')
const storage = require('../Backend/db-storage.js')
const logger = require('./cr-logger')

const sleep = (ms) => new Promise(resolve => {
    setTimeout(resolve, ms);
});

/**
 * Gets webpage HTML code
 * @param {string} url - url address of a webpage
 * @param {{headers: string}} options - common HTTP request options
 * @returns {Promise<string>}
 */
const getSiteCode = (url, options) => new Promise((resolve, reject) => {
	const rawData = []
	const stream = got.stream(url, options)
    stream.on('data', (chunk) => {
        rawData.push(chunk)
    })
    stream.on('end', () => {
        const siteCode = Buffer.concat(rawData).toString('utf8')
        resolve(siteCode);
    })
    stream.on('error', (err) => {
        reject(new Error(err))
    })
})

/**
 * "Терпеливая" функция, которая предпринимает несколько попыток выполниться
 */
const patientFn = (fn, repeatCount, delay) => async (...fnArgs) => {
    if (!(repeatCount > 0)) {
        throw new Error("Unexpected repeatCount");
    }
    let lastError;
    while (repeatCount--) {
        try {
            return await fn(...fnArgs);
        } catch (e) {
            lastError = e;
            console.log(`Failed, attempts left: ${repeatCount}`)
            if (repeatCount) {
                await sleep(delay);
            }
        }
    }
    throw lastError;
}

/**
 * Gets an array of temperatures from the website
 * 
 * @param {{name: string, url: string, opts: {headers: string}, parseFunc: function}} site 
 * @param {{id: number, name: string, nameRus: string, routes: {[siteName]: string}[]}} location
 * @returns {Promise<{temps: number[], requestTime: Date, siteName: string, url: string, siteCode: string}>}
 */
async function getTempFrom(site, location) {
	const commonData = {
		requestTime: new Date(),
		location: location,
		siteName: site.name,
		url: site.url,
		siteCode: null,
	};
	const url = site.url + location.routes[site.name]
	const options = site.opts
	const patientGetSiteCode = patientFn(getSiteCode, 5, 5000)
		
	try {
		const siteCode = await patientGetSiteCode(url, options)
		commonData.siteCode = siteCode
		const temps = site.parseFunc(siteCode)
		if (temps.every(temp => Number.isNaN(temp))) {
			throw new Error('Temperatures not found')
		}
		return { temps, ...commonData }
	} catch (err) {
		return { err, ...commonData }
	}
}
	
async function storeSiteData(opts, sitesData) {
	const tempRecords = []
	for (const siteData of sitesData) {	
		const { siteCode, siteName, requestTime, temps, location } = siteData
		if (opts.storeSiteCode && siteCode != null) {
			logger.storeSiteCode(siteName, requestTime, siteCode);
		}
		tempRecords.push(new TempRecord(requestTime, siteName, location.id, temps))
	}
	if (!opts.storeTemps) {
		logger.logSuccessParsing(tempRecords)
		return	
	}
	try {
		await storage.storeTempRecords(tempRecords)
		logger.logSuccessStoring(tempRecords)
	} catch (err) {
		logger.logStorageError(err)
	}
}

function errorHandler(sitesData) {
	sitesData.forEach(siteData => {
		const { siteCode, siteName, requestTime, err } = siteData
		if (siteCode != null) {
			logger.storeSiteCode(siteName, requestTime, siteCode);
		}
		logger.logParsingError(err, siteData);
	})
}

async function poll(sites, locations, storingOpts) {
	for (const location of locations) {
		const promises = []
		for (const site of sites) {
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
	const config = require('../config.json')
	const storingOpts = config.storing
	const locLimit = config.locLimit || undefined
	const locations = require('../locations.json').slice(0, locLimit)

	const sites = Object.keys(config.sitesToPoll)
		.filter(site => config.sitesToPoll[site])
		.map(site => require(`./temp-parsers/${site}-temp-parser`))
	
	if (config.pollOnce) {
		console.log('Logweather Crawler one-time poll...\r\n')
		poll(sites, locations, storingOpts)
		return
	}

	const rule = new schedule.RecurrenceRule()
	rule.minute = config.pollInMinutes //[0, 15, 30, 45]
	schedule.scheduleJob(rule, () => {
		poll(sites, locations, storingOpts)
	})
	console.log('Logweather Crawler running...\r\n')
	console.log('Parse in minutes: ' + rule.minute)
}

if (!module.parent) {
	main();
}
