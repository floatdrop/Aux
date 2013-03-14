var cls = require("./lib/class"),
	_ = require("underscore"),
	Log = require("log");
	Engine = require("./engine")

module.exports = World = cls.Class.extend({
	
	init: function() {
		this.ups = 50;
		this.players = []
		this.onPlayerConnect(function(socket) {
            this.players.append(socket)
        });
		this.engine = new Engine();
	},

	run: function() {
		setInterval(function () { 
			this.engine.tick(1000 / this.ups);
			_.each(this.players, function(player) {
				this.engine.updatePlayer(player);
			});
		},	1000 / this.ups);
	},

	onInit: function(callback) {
        this.init_callback = callback;
    },

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    }

});