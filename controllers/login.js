var qs = require('querystring');
var crypto = require('crypto');

var auth = require('../utils/auth.js');
var users = require('../appdata/users.json');

var login = function(req, res) {
  if(req.method == 'POST') {
    var postStr = '';

    req.on('data', function(data) {
      postStr += data;
    });

    req.on('end', function() {
      var postObj = qs.parse(postStr);
      var result = auth.attemptLogin(postObj["user"], postObj["pass"]);
      
      if(result == 'failure') {
	res.writeHead(401);
      }
      res.write(result);
      res.end();
    });
  }
}

exports.login = login;
