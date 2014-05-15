var https = require('https');
var fs = require('fs');

var routes = require('./routes');
var log = require('./utils/log');

// self signed cert, NOT a production quality ssl setup
var options = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt'),
  ca: fs.readFileSync('./certs/server.crt'),
  requestCert: true,
  rejectUnauthorized: false
};

var ip = '127.0.0.1';
var port = 8080;
global.logger = new log.Logger(0);
global.logger.log('Starting server, listening on https://' + ip + ':' + port);

https.createServer(options, function (req, res) {
  routes.listener(req, res);
}).listen(8080, port);

