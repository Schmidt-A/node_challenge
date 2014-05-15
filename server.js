var http = require('http');

var routes = require('./routes');
var log = require('./utils/log');

var ip = '127.0.0.1';
var port = 8080;
global.logger = new log.Logger(0);
global.logger.log('Starting server, listening on ' + ip + ':' + port);

http.createServer(function (req, res) {
  routes.listener(req, res);
}).listen(8080, port);

