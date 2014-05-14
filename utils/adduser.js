/*
adduser.js
 - a simple command line script to add users to the users.json file using
   the auth.js module
*/
auth = require('./auth.js');

if (process.argv.length < 4) {
  console.log('Not enough command line arguments');
  console.log('Usage: node adduser.js username password');
  process.exit(1);
}

if (!auth.addUser(process.argv[2], process.argv[3])) {
  console.log('Failed to add user');
  process.exit(1);
}

