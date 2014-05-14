var url = require('url');
var qs = require('querystring');
var fs = require('fs');

var auth = require('../utils/auth');
var flexsort = require('../utils/flexsort');
var configurations = require('../appdata/configs.json');

var configs = function(req, res) {
  configurations = require('../appdata/configs.json');

  var uri;
  var urlParts = url.parse(req.url, true);
  var query = urlParts.query;
  var hrefParts = urlParts.pathname.split("/");

  hrefParts.shift();
  uri = parseURI(hrefParts);
  console.log(global.logFile);

  parseRequest(query, req, function(token, data) {
    if(auth.authenticated(token))
    {
      if(req.method == 'GET') {
	  get(res, uri, query);
      } else if(req.method == 'POST') {
	post(res, uri, data);
      } else if(req.method == 'DELETE') {
	del(res, uri);
      }
    } else {
      console.log("NA");
      res.writeHead(401);
      res.write("401: Unauthorized request");
    }
    res.end();
  });
}

var parseRequest = function(query, req, fn) {
  if(req.method == 'GET') {
    fn(query.token, null);
  } else {
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

var updateFile = function()
{
  fs.writeFile('./appdata/configs.json',
		JSON.stringify(configurations, null, 4));
}

var get = function(res, uri, query) {
  var result = {};

  if(query.only100k) {
    for(var conf in configurations) {
      if(configurations[conf].length > 2) {
	result[conf] = configurations[conf];
      }
    }
  } else {
    if(uri.list) {
      if(configurations.hasOwnProperty(uri.list)) {
	result[uri.list] = configurations[uri.list];
      } else {
	res.writeHead(404);
	res.write("404: Not found");
	return;
      }
    } else {
      result = configurations;
    }
  }

  if(query.sortArgs) {
    for(key in result) {
      result[key] = result[key]
	.sort(flexsort.sort_by.apply(this, (query.sortArgs).split(',')));
    }
  }

  result = JSON.stringify(result, null, 4);
  res.write(result);
}

var post = function(res, uri, data) {
  var added = false;

  if(uri.list)
  {
    if(!configurations.hasOwnProperty(uri.list)) {
      configurations[uri.list] = [];
    }

    // Replace if object already exists
    for(obj in configurations[uri.list]) {
      if(configurations[uri.list][obj]["name"] == data.name) {
	configurations[uri.list][obj] = data;
	added = true;
      }
    }

    // Add to end if it doesn't exist
    if(!added) {
      configurations[uri.list].push(data);
    }

    updateFile();
    res.write("Added: " + JSON.stringify(data));
  } else {
    res.writeHead(404);
    res.write("404: Not found");
  }
}

var del = function(res, uri) {
  var deleted = false;

  if(uri.list) {
    if(uri.name) {
      for(var i in configurations[uri.list]) {
	if(configurations[uri.list][i].name == uri.name) {
	  configurations[uri.list].splice(i, 1);
	  updateFile();
	  res.write("Deleted " + uri.name + " from " + uri.list + " configuration.");
	  deleted = true;
	  break;
	}
      }
    } else {
      delete configurations[uri.list];
      updateFile();
      res.write("Deleted " + uri.list + " configuration.");
      deleted = true;
    }
  }

  if(!deleted) {
    res.writeHead(404);
    res.write("404: Not found");
  }
}

var parseURI = function(hrefParts) {
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

exports.configs = configs;
