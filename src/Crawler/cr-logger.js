const fs = require('fs')

const logFile = '../error.log'
const htmlFolder = '../saved-html'

const toRed = '\x1b[31m', toGreen = '\x1b[32m', resetColor = '\x1b[0m'

module.exports = {
    logParsingError: function(err, siteData) {
        const date = siteData.requestTime.toLocaleString()
        const errType = siteData.siteCode ? 'PARSE_ERROR' : 'REQUEST_ERROR'
        const msg = `${date} ${errType}_ON_${siteData.siteName}: ${err.message}`
        const location = siteData.location
        const url = `${siteData.url}${location.routes[siteData.siteName]}`

        fs.appendFile(logFile, `${msg}\r\n`, (err) => {
            if (err) { return console.log(err) }
            
            console.log(toRed, msg, resetColor)
            console.log('Location:', toGreen, `${location.id} - ${location.name}`, resetColor);
            console.log('URL:', toGreen, url, resetColor)
        })
    },
    
    logStorageError: (err) => {
        const date = new Date().toLocaleString()
        const msg = `${date} STORAGE_ERROR: ${err.message}\r\n`
        fs.appendFile(logFile, msg, (err) => {
            if (err) { return console.log(err) }
        })
        console.log(toRed, `${date}: ${err.message}`, resetColor)
    },

    logSuccessParsing: function(tempRecords) {
        tempRecords.forEach(tempRecord => {
            console.log(`Time: ${tempRecord.datetime.toLocaleString()}`)
            console.log(`Service: ${tempRecord.serviceName}`)
            console.log(`Location: ${tempRecord.locId}`)
            console.log(`Temperatures: ${tempRecord.temps.toString()}`)
            console.log('')
        })
    },

    logSuccessStoring: (tempRecords) => {
        const time = new Date().toLocaleTimeString()
        const locId = tempRecords[0].locId
        console.log(`${time} - Location #${locId} - ${tempRecords.length} temprecords saved`)
    },

    storeSiteCode: function (name, time, data) {
		try {
		if (!fs.existsSync(htmlFolder)){
			fs.mkdirSync(htmlFolder)
		}
		} catch (err) {
			console.error(err)
		}
        const fullName = formName(name, time)
        fs.writeFile(`${htmlFolder}/${fullName}`, data, (err) => {
            if (err) throw err;
            console.log(`Source page saved to ${fullName}`);
        });
    }
}

function formName(name, time) {
    const strTime = time.toLocaleString().replace(/:/g, '-').replace(' ', '_')
    return name + '_' + strTime + '.html'
}