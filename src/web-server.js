const http = require('http')
const url = require('url')
const fs = require('fs')

const output = require('./output.js')
const htmlFormer = require('./html-former.js')

const config = JSON.parse(fs.readFileSync('./config.json'))

const hostname = config.webserver.host;
const port = config.webserver.port;

const server = http.createServer((req, res) => {
	const { pathname, query } = url.parse(req.url, true);
	const ip = res.socket.remoteAddress
	console.log(`${ip} connected`)
	if (query.temp) {
		output.toCSV('STREET', [query.temp])
		console.log(`${ip} added temperature`)
	}
	htmlFormer.addTemp((data) => {
		res.setHeader('Content-Type', 'text/html');
		res.write(data);
		res.end();
	});
})
server.listen(port, hostname, () => {
	console.log(`Logweather server running at http://${hostname}:${port}/`);
});

