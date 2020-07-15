const fs = require('fs')

const logFile = '../error.log'
const htmlFolder = '../saved-html'

module.exports = {
    logError: function(err, siteData) {
        const date = siteData.requestTime.toLocaleString()
        const msg = `${date} ${siteData.siteName}_${err.type}: ${err.message}\r\n`
        const location = siteData.location

        fs.appendFile(logFile, msg, (error) => {
            if (error) {
                console.log(`${logFile} not available`)
                return
            }
            const toRed = '\x1b[31m', toGreen = '\x1b[32m', resetColor = '\x1b[0m'
            console.log(toRed, `${err.type}: ${err.message}`, resetColor)
            console.log('Service:', toGreen, siteData.siteName, resetColor)
            console.log('Location:', toGreen, `${location.locId} - ${location.name}`, resetColor);
            console.log('Time:', toGreen, date, resetColor)
            console.log('URL:', toGreen, `${siteData.siteOpts.hostname}${location.routes[siteData.siteName]}`, resetColor)
        });
    }, 

    logSuccess: function(tempRecords) {
        tempRecords.forEach(tempRecord => {
            console.log(`Service: ${tempRecord.serviceName}`)
            console.log(`Location: ${tempRecord.locId}`)
            console.log(`Time: ${tempRecord.datetime.toLocaleString()}`)
            console.log(`Temperatures: ${tempRecord.temps.toString()}`)
            console.log('')
        })
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