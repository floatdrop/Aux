var fs = require('fs'),
	cls = require('./lib/class');

var Server = module.exports = cls.Class.extend({
	init: function (config) {
		this.started = false;

		this.config = config;

		var	Log = require('log'),
			WorldServer = require('./worldserver');
		
		this.world = new WorldServer();

		switch (config.debug_level) {
		case "error":
			global.log = new Log(Log.ERROR);
			this.loglevel = 0;
			break;
		case "debug":
			global.log = new Log(Log.DEBUG);
			this.loglevel = 2;
			break;
		case "info":
			global.log = new Log(Log.INFO);
			this.loglevel = 1;
			break;
		}
	},
	configureStaticServer: function () {
		if (!(this.config.static_port)) {
			return;
		}

		global.log.info("Starting static server on port " + this.config.static_port);

		var file = new(require('node-static').Server)('./client', { cache: false });
		require('http').createServer(function (request, response) {
			request.addListener('end', function () {
				file.serve(request, response);
			});
		}).listen(this.config.static_port);
	},
	start: function (started_callback) {
		global.log.info("Starting Aux game server...");

		this.configureStaticServer();

		var io = require('socket.io').listen(this.config.port, {
			'log level': this.loglevel
		});

		io.sockets.on('connection', function (socket) {
			this.world.connect_callback(socket);
		});

		process.on('uncaughtException', function (e) {
			global.log.error('uncaughtException: ' + e + '\n' + e.stack);
		});

		this.world.run(function (err) {
			if (started_callback) {
				started_callback(err, this);
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

var defaultConfigPath = './server/config.json';
var customConfigPath = './server/config_local.json';

process.argv.forEach(function (val, index) {
	if (index === 2) {
		customConfigPath = val;
	}
});

getConfigFile(customConfigPath, function (customConfig) {
	if (customConfig) {
		new Server(customConfig).start();
	} else {
		getConfigFile(defaultConfigPath, function (defaultConfig) {
			if (defaultConfig) {
				new Server(defaultConfig).start();
			} else {
				console.error("Server cannot start without any configuration file.");
				process.exit(1);
			}
		});
	}
});
