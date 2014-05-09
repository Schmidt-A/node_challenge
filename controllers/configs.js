var url = require('url');
var qs = require('querystring');
var fs = require('fs');

var auth = require('./auth');
var configurations = require('../appdata/configs.json');

module.exports = { 
  configs: function(req, res) {
    configurations = require('../appdata/configs.json');
    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;
    var hrefParts = urlParts.href.split("/");

    parseRequest(query, req, function(token, data) {
      console.log(token);
      if(auth.authenticated(token))
      {
	console.log("authenticated");
	if(req.method == 'GET') {
	  get(res);
	}
	else if(req.method == 'POST') {
	  post(res, data);
	}
	else if(req.method == 'DELETE') {
	  del(hrefParts, res);
	}
      }
      else
      {
	console.log("NA");
	res.write("Not authenticated");
      }
      res.end();
      console.log("------------------------------");
    });
  }
}

function parseRequest(query, req, fn) {
  if(req.method == 'GET') {
    fn(query.token, null);
  }
  else {
    var formData = '';
    req.on('data', function(data) {
      formData += data;
    });
    req.on('end', function() {
      var data = qs.parse(formData);
      var token = data.token;
      delete data.token;

      fn(token, data);
    });
  }
}

function updateFile()
{
  fs.writeFile('./appdata/configs.json',
		JSON.stringify(configurations, null, 4));
}

function get(res) {
  res.write(JSON.stringify(configurations));
}

function post(res, data) {
  configurations["configurations"].push(data);
  updateFile()
  res.write(JSON.stringify(configurations));
}

function del(hrefParts, res) {
  var confs = configurations["configurations"];
  console.log(hrefParts)
  console.log(configurations);

  if(hrefParts.length > 2) { // Deleting one el
    var toDelete = hrefParts[2];
    for(var i in confs) {
      if(confs[i].name == toDelete) {
	confs = confs.splice(confs.indexOf(i), 1);
	configurations["configurations"] = confs;
	updateFile();
	break;
      }
    }
  }
}
