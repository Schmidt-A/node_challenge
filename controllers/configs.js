/*
   This controller handles all configuration manipulation.

   Exports: configs
*/

var fs = require('fs');
var qs = require('querystring');
var url = require('url');

var auth = require('../utils/auth');
var flexsort = require('../utils/flexsort');

var configurations;

var configs = function(req, res) {
  configurations = require('../appdata/configs.json');

  var uri;
  var urlParts = url.parse(req.url, true);
  var query = urlParts.query;
  var hrefParts = urlParts.pathname.split("/");

  // Get rid of the first entry because it's always blank
  hrefParts.shift();
  uri = parseURI(hrefParts);

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
      global.logger.logErr('401: Unauthorized request');
      res.writeHead(401);
      res.write("401: Unauthorized request");
    }
    res.end();
  });
}

var get = function(res, uri, query) {
  var result = {};

  if(query.only100k) {
    for(var conf in configurations) {
      if(configurations[conf].length > 100000) {
	result[conf] = configurations[conf];
      }
    }
  } else {
    if(uri.list) {
      if(configurations.hasOwnProperty(uri.list)) {
	result[uri.list] = configurations[uri.list];
      } else {
	global.logger.logErr('404: ' + uri.list +
	    ' not found in configurations');
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
	.sort(flexsort.sortBy.apply(this, (query.sortArgs).split(',')));
    }
  }

  result = JSON.stringify(result, null, 4);
  res.write(result);
}

var post = function(res, uri, data) {
  var added = false;

  if(!validateData(data)) {
    res.writeHead(400);
    res.write("400: Bad Request");
    return;
  }

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
    global.logger.log('Added ' + data.name + ' to ' + uri.list);
    res.write("Added: " + JSON.stringify(data));
  } else {
    global.logger.logErr('404: could not add configuration data');
    res.writeHead(404);
    res.write("404: Not found");
  }
}

var del = function(res, uri) {
  var deleted = false;

  if(uri.list) {
    if(uri.name) {
      // Attempt to delete single entry from configuration
      for(var i in configurations[uri.list]) {
	if(configurations[uri.list][i].name == uri.name) {
	  configurations[uri.list].splice(i, 1);
	  updateFile();
	  res.write("Deleted " + uri.name + " from " + uri.list
	      + " configuration.");
	  global.logger.log('Deleted ' + uri.name + ' from ' + uri.list);
	  deleted = true;
	  break;
	}
      }
    } else {
      // Otherwise delete entire configuration
      delete configurations[uri.list];
      updateFile();
      res.write("Deleted " + uri.list + " configuration.");
      global.logger.log('Deleted ' + uri.name);
      deleted = true;
    }
  }

  if(!deleted) {
    global.logger.logErr('404: could not delete configuration data');
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

var validateData = function(data) {
  names = {
    'name': 'string',
    'hostname': 'string',
    'port': 'number',
    'username': 'string'
  };

  // Make sure we don't have bogus field names
  for(property in data) {
    if(!names.hasOwnProperty(property)) {
      return false;
    }
  }

  for(property in names) {
    if(!data.hasOwnProperty(property)) {
      return false;
    }

    if(data[property].length < 1) {
      return false;
    }

    // Make sure port is actually a number. Store it as an int.
    if(property == 'port' && !isNaN(data['port'])) {
      data['port'] = parseInt(data['port'], 10);
    }

    if(typeof data[property] != names[property]) {
      return false;
    }
  }

  return true;
}

var updateFile = function()
{
  fs.writeFile('./appdata/configs.json',
		JSON.stringify(configurations, null, 4));
}

exports.configs = configs;
