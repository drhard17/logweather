const fs = require('fs')

const tg = require('../backend/lw-info-bot')
const logFile = '../error.log'
const htmlFolder = '../saved-html'

const toRed = '\x1b[31m', toGreen = '\x1b[32m', resetColor = '\x1b[0m'

module.exports = {
    logParsingError: function(siteData) {
        const { err, requestTime, location, siteName, url, siteCode } = siteData
        const date = requestTime.toLocaleString()
        const errType = siteCode ? 'PARSE_ERROR' : 'REQUEST_ERROR'
        const msg = `${date} ${errType}_ON_${siteName}: ${err.message}`
        const URL = `${url}${location.routes[siteName]}`

        fs.appendFile(logFile, `${msg}\r\n`, (err) => {
            if (err) { return console.log(err) }
            
            console.log(toRed, msg, resetColor)
            console.log('Location:', toGreen, `${location.id} - ${location.name}`, resetColor);
            console.log('URL:', toGreen, URL, resetColor)
        })

        tg.sendMessage(
            `\u2757<b>${errType}_ON_${siteName}</b>\u2757`, 
            err.message,
            `<b>Location</>: ${location.name}`, 
            `<b>URL</b>: ${URL}`
        )
    },
    
    logStorageError: (err) => {
        const date = new Date().toLocaleString()
        const msg = `${date} STORAGE_ERROR: ${err.message}\r\n`
        fs.appendFile(logFile, msg, (err) => {
            if (err) { return console.log(err) }
        })
        console.log(toRed, `${date}: ${err.message}`, resetColor)

        tg.sendMessage(
            `\u2757<b>STORAGE_ERROR</b>\u2757`, 
            err.message
        )
    },

    logSuccessParsing: function(tempRecords) {
        tempRecords.forEach(tempRecord => {
            const { datetime, serviceName, temps, locId } = tempRecord
            console.log(`Time: ${datetime.toLocaleString()}`)
            console.log(`Service: ${serviceName}`)
            console.log(`Location: ${locId}`)
            console.log(`Temperatures: ${temps.toString()}`)
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
        const fullName = formFileName(name, time)
        fs.writeFile(`${htmlFolder}/${fullName}`, data, (err) => {
            if (err) throw err;
            console.log(`Source page saved to ${fullName}`);
        });
    }
}

function formFileName(name, time) {
    const yyyy = time.getFullYear()
    const mm = time.getMonth() + 1
    const dd = time.getDate()
    const strDate = [yyyy, mm, dd].join('-')
    return name + '_' + strDate + '.html'
}