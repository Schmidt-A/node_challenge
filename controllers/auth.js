var qs = require('querystring');
var crypto = require('crypto');

var users = require('../appdata/users.json');
var sessions = [];

module.exports = {
  login: function(req, res) {
    if(req.method == 'POST') {
      var postStr = '';
      var loggedIn = false;

      req.on('data', function(data) {
	postStr += data;
      });

      req.on('end', function() {
	var postObj = qs.parse(postStr);

	for(var i in users) {
	  if(users[i].user == postObj["user"] &&
	     users[i].pass == postObj["pass"]) {
	    // Generate token
	    var token = crypto.randomBytes(32).toString('base64');
	    sessions.push(token);
	    res.write(token);
	    loggedIn = true;
	    break;
	  }
	}
	if(!loggedIn) {
	  res.write("failure");
	}
	res.end();
      });
    }
  },

  authenticated: function(token) {
    if(sessions.indexOf(token) > -1) {
      return true;
    }
    return false;
  }
}

