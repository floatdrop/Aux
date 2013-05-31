
GLOBAL.config = require('./config.js');
GLOBAL.Class = require('./server/vendor/class.js').Class;
GLOBAL._ = require('lodash');
GLOBAL.log = require('./server/log.js')

var Server = require('./server');

var server = new Server();
server.start();