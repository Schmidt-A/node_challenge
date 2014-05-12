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
    var hrefParts = urlParts.pathname.split("/");
    hrefParts.shift();
    var uri = parseURI(hrefParts);
    console.log(hrefParts);

    parseRequest(query, req, function(token, data) {
      console.log(token);
      if(auth.authenticated(token))
      {
	console.log("authenticated");
	if(req.method == 'GET') {
	  get(res, uri);
	}
	else if(req.method == 'POST') {
	  post(res, data, uri);
	}
	else if(req.method == 'DELETE') {
	  del(res, uri);
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

function get(res, uri) {
  var result = '';
  if(uri.list) {
    if(configurations.hasOwnProperty(uri.list)) {
      result = JSON.stringify(configurations[uri.list]);
    }
  }
  else {
    result = JSON.stringify(configurations);
  }
  res.write(result);
}

function post(res, data, uri) {
  if(uri.list)
  {
    if(!configurations.hasOwnProperty(uri.list)) {
      configurations[uri.list] = [];
    }
    configurations[uri.list].push(data);
    updateFile();
  }
  res.write("Added: " + JSON.stringify(data));
}

function del(res, uri) {

  if(uri.list) {

    if(uri.name) {
      for(var i in configurations[uri.list]) {
	if(configurations[uri.list][i].name == uri.name) {
	  configurations[uri.list] = configurations[uri.list]
	    .splice(configurations[uri.list].indexOf(i), 1);
	  updateFile();
	  res.write("Deleted " + uri.name + " from " + uri.list + " configuration.");
	  break;
	}
      }
    }
    else {
      delete configurations[uri.list];
      updateFile();
      res.write("Deleted " + uri.list + " configuration.");
    }
  }
}

function parseURI(hrefParts) {
  var uri = {};

  if(hrefParts.length > 0) {
    uri.method = hrefParts[0];
  }
  if(hrefParts.length > 1) {
    uri.list = hrefParts[1];
  }
  if(hrefParts.length > 2) {
    uri.name = hrefParts[2];
  }

  return uri;
}
