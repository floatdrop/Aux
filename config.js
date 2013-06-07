var ticksPerSecond = 30.0;
var path = require('path');
var fs = require('fs');

var globalConfigFile = __dirname + '/../config.js';

var globalConfig = fs.existsSync(globalConfigFile) ? require(globalConfigFile) : { Aux: {} };

module.exports = {
	"server": {
		"host": "0.0.0.0",
		"port": process.env.PORT || 8001,
		"playerslimit": 10,
		"map": "client-build/assets/world/smallworld.json",
		"replaysPath": path.normalize(__dirname + "/client-build/replays")
	},
	"b2dengine": {
		"ticksPerSecond": ticksPerSecond,
		"ticks": 1000.0 / ticksPerSecond
	},
	"debugLevel": "debug",
	"debug": true,
	"NodeTimeKey": globalConfig.Aux.NodeTimeKey || process.env.NodeTimeKey || ""
};