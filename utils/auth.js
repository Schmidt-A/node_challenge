// A quick auth library give PBKDF2 after looking at:
// http://stackoverflow.com/questions/17218089/salt-and-hash-using-pbkdf2

crypto = require('crypto');
fs = require('fs');

usersFile = '../appdata/users.json';
var sessions = [];

var hash = function(password, salt) {
  hashtxt = crypto.pbkdf2Sync(password, salt, 10000, 64);
  console.log('hash: ' + hashtxt.toString('base64'));
  return hashtxt.toString('base64');
};

var save_user = function(entry) {
  users = require(usersFile);
  console.log('save entry: ' + JSON.stringify(entry));
  users[entry.username] = entry;
  fs.writeFile(usersFile, JSON.stringify(users, null, 2), function(err) {
    if(err) {
      console.log(err);
      return false;
    }
  });
  return true;
};

var addUser = function(name, password) {
  try {
    var salt = crypto.randomBytes(128).toString('base64');
  } catch (ex) {
    // handle error
    console.log('randomBytes() error: ' + ex); 
    return false;
  }
  hashtxt = hash(password, salt);
  console.log('adduser: ' + name + ' ' + hashtxt);
  return save_user({username: name, hash: hashtxt, salt: salt});
};

var validateLogin = function(name, password) {
  var authenticated = false;
  var users = require(usersFile);
  var user;
  if (users.hasOwnProperty(name)) {
    user = users[name]
    attempt = hash(password, user['salt']);
    if (user['hash'] === attempt) {
      authenticated = true;
    }
  }
  return authenticated;
};

var attemptLogin = function(name, password) {
  result = '';

  if(validateLogin(name, password)) {
    var token = crypto.randomBytes(32).toString('hex');
    sessions.push(token);
    console.log(sessions);
    result = token;
  } else {
    result = "failure";
  }

  return result;
};


exports.addUser = addUser;
exports.attemptLogin = attemptLogin;
