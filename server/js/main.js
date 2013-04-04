var fs = require('fs'),
	log = require('./log'),
	cls = require('./lib/class');

var Server = module.exports = cls.Class.extend({
	init: function (config) {
		this.started = false;

		this.config = config;

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
	configureStaticServer: function () {
		if (!(this.config.static_port)) {
			return;
		}

		var StaticServer = require('node-static').Server,
			file = new StaticServer('./client', {
				cache: false
			});

		require('http').createServer(function (request, response) {
			log.debug("Static file request: " + request.url);
			file.serve(request, response);
		}).listen(this.config.static_port);

		log.info("Starting static server on port " + this.config.static_port);
	},
	start: function (started_callback) {

		var self = this,
			io = require('socket.io').listen(this.config.port, {
				'log level': this.loglevel
			});

		log.info("Starting Aux game server...");

		this.configureStaticServer();

		io.sockets.on('connection', function (socket) {
			self.world.connect_callback(socket);
		});

		process.on('uncaughtException', function (e) {
			log.error('uncaughtException: ' + e + '\n' + e.stack);
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
};

if (require.main === module) {
	main();
}
