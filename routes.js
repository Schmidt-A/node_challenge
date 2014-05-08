var url = require('url');
var fs = require('fs');
var url = require('url');

var auth = require('./controllers/auth');
var configs = require('./controllers/configs');

module.exports = {
  listener: function(req, res) {
    if(req.url == '/login') {
      auth.login(req, res); 
    }
    else if(req.url.match(/^\/configs/)) {
      configs.get(req, res);
    }
    else {
      res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
      res.write(fs.readFileSync('./views/index.html'));
      res.end();
    }
  }
}
