var ticksPerSecond = 30.0;

module.exports = {
	"server": {
		"host": "0.0.0.0",
		"port": process.env.PORT || 8000,
		"playerslimit": 10,
		"map": "client/assets/world/smallworld.json"
	},
	"b2dengine": {
		"ticksPerSecond": ticksPerSecond,
		"ticks": 1000.0 / ticksPerSecond
	},
	"debugLevel": "debug",
	"debug": true,
	"NodeTimeKey": process.env.NodeTimeKey || ""
};