const fs = require('fs')

const logFile = '../error.log'
const htmlFolder = '../saved-html'

module.exports = {
    logError: function(err, cbData) {
        const date = cbData.requestTime.toLocaleString()
        const msg = `${date} ${cbData.siteName}_${err.type}: ${err.message}\r\n`

        fs.appendFile(logFile, msg, (error) => {
            if (error) {
                console.log(`${logFile} not available`)
                return
            }
            const toRed = '\x1b[31m', toGreen = '\x1b[32m', resetColor = '\x1b[0m'
            console.log(toRed, `${err.type}: ${err.message}`, resetColor)
            console.log('Time:', toGreen, date, resetColor)
            console.log('Site:', toGreen, cbData.siteName, resetColor)
            console.log('URL:', toGreen, `https://${cbData.siteOpts.hostname}${cbData.siteOpts.path}`, resetColor)
        });
    }, 

    logSuccess: function(tr) {
        console.log(`Service: ${tr.service}`)
        console.log(`Time: ${tr.time.toLocaleString()}`)
        console.log(`Temperatures: ${tr.temps.toString()}`)
        console.log('')
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