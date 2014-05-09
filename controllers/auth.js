var qs = require('querystring');
var crypto = require('crypto');

var users = require('../appdata/users.json');
var sessions = [];

module.exports = {
  login: function(req, res) {
    if(req.method == 'POST') {
      var postStr = '';

      req.on('data', function(data) {
	postStr += data;
      });

      req.on('end', function() {
	var postObj = qs.parse(postStr);
	if(validate(postObj["user"], postObj["pass"])) {
	    var token = crypto.randomBytes(32).toString('hex');
	    sessions.push(token);
	    console.log(sessions);
	    res.write(token);
	}
	else {
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

function validate(user, pass) {
  var valid = false;
  for(var i in users) {
    if(users[i].user == user && users[i].pass == pass) {
	 valid = true;
	 break;
    }
  }
  return valid;
}
