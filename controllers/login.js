var qs = require('querystring');
var crypto = require('crypto');
var url = require('url');

var auth = require('../utils/auth');
var users = require('../appdata/users.json');

var login = function(req, res) {
  if(req.method == 'POST') {
    var postStr = '';

    req.on('data', function(data) {
      postStr += data;
    });

    req.on('end', function() {
      var postObj = qs.parse(postStr);
      var result = auth.attemptLogin(postObj['user'], postObj['pass']);
      
      if(result == 'failure') {
	global.logger.logErr('401: Failed login attempt with user/password ' +
	  postObj['user'] + '/' + postObj['pass']);

	res.writeHead(401);
      } else {
	global.logger.log('User ' + postObj['user'] + ' logged in');
      }

      res.write(result);
      res.end();
    });
  }
}

var logout = function(req, res) {
  var token = (url.parse(req.url, true)).query.token;

  if(token) {
    if(auth.attemptLogout(token)) {
      global.logger.log('Successful logout');
      res.write("Successfully logged out");
    } else {
      global.logger.logErr('401: Failed login attempt');
      res.writeHead(401);
      res.write("401: Unauthorized Request");
    }
  }
  res.end();
}

exports.login = login;
exports.logout = logout;
