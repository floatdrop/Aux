GLOBAL.config = require('./config.js');

var Server = require('./server');

var server = new Server();
server.start();