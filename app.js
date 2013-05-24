var fs = require('fs'),
	Server = require('./server/js/server');

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