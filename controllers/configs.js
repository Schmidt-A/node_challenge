var url = require('url');
var qs = require('querystring');
var fs = require('fs');

var auth = require('./auth');
var configurations = require('../appdata/configs.json');

module.exports = { 
  get: function(req, res) {
    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;
    
    //if(auth.authenticated(query.token))
    //{
      if(req.method == 'GET') {
	//console.log(JSON.stringify(configurations));
	res.write(JSON.stringify(configurations));
      }
      else if(req.method == 'POST') {
	var postStr = '';

	req.on('data', function(data) {
	  postStr += data;
	});

	req.on('end', function() {
	  var postObj = qs.parse(postStr);
	  configurations["configurations"].push(postObj);
	  fs.writeFile('./appdata/configs.json',
		       JSON.stringify(configurations, null, 4));
	});
	res.write(JSON.stringify(configurations));
      }
    //}
    else
    {
      console.log("NA");
      res.write("Not authenticated");
    }
    res.end();
  }
}
