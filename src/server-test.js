const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const jsdom = require('C:\\Users\\Dr_Hard\\node_modules\\jsdom');
const { JSDOM } = jsdom;

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
	fs.readFile('./html/node.html', (err, data) => {
		if (err) {
			console.log(err);
			return;
		}
//		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/html');
		res.write(data);
		res.end();

		const { pathname, query } = url.parse(req.url, true);
		console.log(JSON.stringify(query));
		console.log(query.temp);
		console.log(pathname);

	});
})
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

