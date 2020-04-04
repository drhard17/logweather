const http = require('http');
const url = require('url');

const logw = require('./logweather.js')
const htmlFormer = require('./html-former.js')

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
	const { pathname, query } = url.parse(req.url, true);
	if (query.temp) {
		logw.toCSV('STREET', [query.temp])
	}
	htmlFormer.addTemp((data) => {
		//res.statusCode = 200;
		res.setHeader('Content-Type', 'text/html');
		res.write(data);
		res.end();
	});
})
server.listen(port, hostname, () => {
	console.log(`Logweather server running at http://${hostname}:${port}/`);
});

