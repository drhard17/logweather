const output = require('./output.js')

module.exports = {
    errorHandler: function(err) {
        console.log('\x1b[31m', 'ERRORHANDLER:', '\x1b[0m')
        console.log(err)
        err.htmlCode ? output.saveHTML(err.siteName, err.htmlCode) : null
    }/*,

    objErr: {
        siteName: '',
        type: '',
        url: '',
        message: '',
        htmlCode: '' 
    }
*/
}