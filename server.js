var http = require('http');

var routes = require('./routes');

http.createServer(function (req, res) {
  routes.listener(req, res);
}).listen(8080, "127.0.0.1");

