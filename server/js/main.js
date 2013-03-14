var fs = require('fs');

function main(config) {
	var io = require('socket.io').listen(config.port),
			log = require('log'),
			_ = require('underscore'),
			world = require('./worldserver');
	
	if (config.static_port) {
		configureStaticServer(config);
	}

	io.sockets.on('connection', function(socket) {
		world.connection_callback(socket);
	});

	process.on('uncaughtException', function (e) {
    log.error('uncaughtException: ' + e);
  });
}

function configureStaticServer(config) {
	var static = require('node-static');
	var file = new(static.Server)('./client');
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
