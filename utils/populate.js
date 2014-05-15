/*
populate the configs.json file with lots of entries
*/

var fs = require('fs');

var lists = ['one', 'two', 'three', 'four'];
var configs = {};

function rnd_string() {
  // grabbed from http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript/8084248#8084248
  return (Math.random() + 1).toString(36).substring(7);
}

function rnd_port() {
  var min = 1;
  var max = 65535;
  return parseInt(Math.random() * (max - min) + min, 10);
}

function random_entry() {
  return {name: rnd_string(),
	  hostname: rnd_string(),
	  port: rnd_port(),
	  username: rnd_string()};
}

// This is certinaly not the most efficient, but quick and dirty to code.
// Makes sure the names are unique
function generate(num) {
  var count = 0;
  var collisions = 0;
  var entries = {};
  var entry;
  var result = [];
  while (count < num) {
    entry = random_entry();
    if (entry.name.length > 0 && !entries.hasOwnProperty(entry.name)) {
      entries[entry.name] = entry;
      count++;
    } else {
      collisions++;
    }
  }

  for (name in entries) {
    result.push(entries[name]);
  }
  return result;
}

configs['one'] = generate(5);
configs['two'] = generate(10);
configs['three'] = generate(100001);
configs['four'] = generate(2);


fs.writeFileSync('configs.json', JSON.stringify(configs));
console.log('wrote configs.json');

