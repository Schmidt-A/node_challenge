var fs = require('fs');

var Logger = function(level) {
  this.file = './logs/log.txt';
  this.date = new Date();
  this.level = level;
}

Logger.prototype.log = function(msg) {
  if(this.level < 1) {
    var logMsg = '[' + this.date.toDateString() + ' - '
      + this.date.toTimeString() + '] ' + msg + '\n';

    writeLog(this.file, logMsg);
  }
}

Logger.prototype.logErr = function(msg) {
  if(this.level < 2) {
    var logMsg = '[' + this.date.toDateString() + ' - '
      + this.date.toTimeString() + '] ERROR ' + msg + '\n';

    writeLog(this.file, logMsg);
  }
}

var writeLog = function(file, logMsg) {
  fs.appendFile(file, logMsg, function(err) {
    if(err) {
      throw err;
    }
  });
}

exports.Logger = Logger;
