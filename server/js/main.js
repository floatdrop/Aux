var fs = require('fs');

function main(config) {
	var io = require('socket.io').listen(config.port),
			Log = require('log'),
			_ = require('underscore'),
			worldserver = require('./worldserver'),
			world = new(worldserver)();
	
	io.set('log level', 1)

	switch(config.debug_level) {
		case "error":
			log = new Log(Log.ERROR); break;
		case "debug":
			log = new Log(Log.DEBUG); break;
		case "info":
			log = new Log(Log.INFO); break;
	};

	log.info("Starting Aux game server...");

	if (config.static_port) {
		log.info("Starting static server on port " + config.static_port)
		configureStaticServer(config);
	}

	io.sockets.on('connection', function(socket) {
		world.connect_callback(socket);
	});

	process.on('uncaughtException', function (e) {
		log.error('uncaughtException: ' + e + '\n' + e.stack);
	});

	world.run()
}

function configureStaticServer(config) {
	var static = require('node-static');
	var file = new(static.Server)('./client', { cache: false });
	require('http').createServer(function(request, response) {
		request.addListener('end', function() {
			file.serve(request, response);
		});
	}).listen(config.static_port);
}

function getConfigFile(path, callback) {
	fs.readFile(path, 'utf8', function(err, json_string) {
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

process.argv.forEach(function(val, index, array) {
	if (index === 2) {
		customConfigPath = val;
	}
});

getConfigFile(defaultConfigPath, function(defaultConfig) {
	getConfigFile(customConfigPath, function(localConfig) {
		if (localConfig) {
			main(localConfig);
		} else if (defaultConfig) {
			main(defaultConfig);
		} else {
			console.error("Server cannot start without any configuration file.");
			process.exit(1);
		}
	});
});
