var http = require('http');

var routes = require('./routes');
var log = require('./utils/log');

http.createServer(function (req, res) {
  global.logger = new log.Logger();
  routes.listener(req, res);
}).listen(8080, "127.0.0.1");

