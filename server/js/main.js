var fs = require('fs'),
	log = require('./log'),
	cls = require('./lib/class');

var Server = module.exports = cls.Class.extend({
	init: function (config) {
		this.started = false;

		this.config = config;

    if (this.config.c9io === true) {
      this.config.port = Number(process.env.PORT);
      this.config.host = process.env.IP;
    }

		var WorldServer = require('./worldserver');

		if (config.debug_level === "error") {	
			this.loglevel = 0;
		} else if (config.debug_level === "debug") {		
			this.loglevel = 2;
		} else if (config.debug_level === "info") {
			this.loglevel = 1;
		}

		this.world = new WorldServer(config);
		this.world.onException(function (err) {
			log.error(err);
		});
	},
	start: function (started_callback) {

		var self = this;

		log.info("Starting Aux game server...");
    
    var express = require('express');
    var io = require('socket.io');
    this.app = express();
    this.app.use(express.static('./client'));
    this.server = require('http').createServer(this.app);
    this.server.listen(this.config.port);
    io = io.listen(this.server, {
      'log level': this.loglevel
    });

		io.sockets.on('connection', function (socket) {
			self.world.connect_callback(socket);
		});

		process.on('uncaughtException', function (e) {
			log.error('uncaughtException: ' + e + '\n' + e.stack);
		});

		this.world.run(function (err) {
			if (started_callback) {
				started_callback(err, self);
			}
		});
    
	}
});

function getConfigFile(path, callback) {
	fs.readFile(path, 'utf8', function (err, json_string) {
		if (err) {
			console.error("Could not open config file: ", err.path);
			callback(null);
		} else {
			callback(JSON.parse(json_string));
		}
	});
}

var main = function () {
	var defaultConfigPath = './server/config.json',
		customConfigPath = './server/config_local.json';

	process.argv.forEach(function (val, index) {
		if (index === 2) {
			customConfigPath = val;
		}
	});

	getConfigFile(customConfigPath, function (customConfig) {
		if (customConfig) {
			var server = new Server(customConfig);
      server.start();
		} else {
			getConfigFile(defaultConfigPath, function (defaultConfig) {
				if (defaultConfig) {
					var server = new Server(defaultConfig);
          server.start();
				} else {
					console.error("Server cannot start without any configuration file.");
					process.exit(1);
				}
			});
		}
	});
};

if (require.main === module) {
	main();
}
