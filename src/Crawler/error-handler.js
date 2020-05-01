const fs = require('fs')

module.exports = {
    errorHandler: function(err, cbData) {
        const date = cbData.requestTime.toLocaleString()
        const msg = `${date} ${cbData.siteName}_${err.type}: ${err.message}\r\n`
        const file = '../error.log'

        fs.appendFile(file, msg, (error) => {
            if (error) {
                console.log(`${file} not available`)
                return
            }
            const toRed = '\x1b[31m', toGreen = '\x1b[32m', resetColor = '\x1b[0m'
    
            console.log(toRed, `${err.type}: ${err.message}`, resetColor)
            console.log('Time:', toGreen, date, resetColor)
            console.log('Site:', toGreen, cbData.siteName, resetColor)
            console.log('URL:', toGreen, `https://${cbData.siteOpts.hostname}${cbData.siteOpts.path}`, resetColor)
        });
    }
}

