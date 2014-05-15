var url = require('url');
var fs = require('fs');
var url = require('url');

var login = require('./controllers/login');
var configs = require('./controllers/configs');

var listener = function(req, res) {
  if(req.url == '/login') {
    login.login(req, res); 
  } else if(req.url.match(/^\/configs/)) {
    configs.configs(req, res);
  } else if (req.url.match(/^\/logout/)) {
    login.logout(req, res);
  } else {
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
    res.write(fs.readFileSync('./views/index.html'));
    res.end();
  }
}

exports.listener = listener;
