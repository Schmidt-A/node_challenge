var url = require('url');

var auth = require('./auth');
var configurations = require('../appdata/configs.json');

module.exports = { 
  get: function(req, res) {
    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;
    
    if(auth.authenticated(query.token))
    {
      console.log(JSON.stringify(configurations));
      res.write(JSON.stringify(configurations));
    }
    else
    {
      console.log("NA");
      res.write("Not authenticated");
    }
    res.end();
  }
}
