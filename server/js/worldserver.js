var cls = require("./lib/class"),
	_ = require("underscore"),
	Log = require("log");

module.exports = World = cls.Class.extend({
	init: function() {
		this.ups = 50;
	},
	run: function() {
		setInterval(function () { 
			// Here we need to tick box2d
			// But this code is wrong in many ways:
			// game.update(webSocket.getConnection());
			log.debug("Tick");
		},	1000 / this.ups);
	}
});