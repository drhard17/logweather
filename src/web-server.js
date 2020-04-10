const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')

const output = require('./output.js')
const htmlFormer = require('./html-former.js')

const config = JSON.parse(fs.readFileSync('./config.json'))

const hostname = config.webserver.host;
const port = config.webserver.port;

const server = http.createServer((req, res) => {
	
	const ip = res.socket.remoteAddress
	console.log(`${ip} requested ${req.url}`)

	/*
	const reqURL = new URL(`http://${req.headers.host}${req.url}`)
	const streetTemp =reqURL.searchParams.get('temp')
	console.log('DEBUG: ', streetTemp)
	*/

	const { pathname, query } = url.parse(req.url, true);
	if (query.temp) {
		output.toCSV('STREET', [query.temp])
	}

	const filePath = '.' + pathname
	const extname = String(path.extname(filePath)).toLowerCase().slice(1)
	const mimeTypes = {
		html: 'text/html',
		js: 'text/javascript',
		css: 'text/css',
		json: 'application/json',
		png: 'image/png',
		jpg: 'image/jpg',
		ico: 'image/x-icon'
	}

	const contentType = mimeTypes[extname]
	
	if (pathname === '/') {
		htmlFormer.getHTML((err, data) => {
			if (err) {
				console.log('File error')
				return
			}
			res.setHeader('Content-Type', 'text/html');
			res.write(data);
			res.end();
		});
	}
	else {
		fs.readFile(filePath, (err, data) => {
			if (err) {
				console.log('File error')
				return
			}
			res.setHeader('Content-Type', contentType)
			res.write(data)
			res.end()
		});
	}
})

server.listen(port, hostname, () => {
	console.log(`Logweather server running at http://${hostname}:${port}/`);
});

