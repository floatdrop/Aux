var cls = require("./lib/class"),
	_ = require("underscore"),
	Log = require("log"),
	async = require("async"),
	Engine = require("./engine");

module.exports = World = cls.Class.extend({
	
	init: function() {
		this.ups = 50;
		this.players = []
		this.onPlayerConnect(function(socket) {
            this.players.push(socket)
        });
		this.engine = new Engine();
	},

	run: function() {
		var self = this;
		setInterval(function () { 
			self.engine.tick(1000 / self.ups);
			// for (var i=0;i<self.players.length;i++)
			// {
				// self.engine.updatePlayer(self.players[i]);
			// }
			async.each(self.players, function(player, callback) {
				self.engine.updatePlayer(player);
				callback(null);
			}, function (err) {});
		},	1000 / this.ups);
	},

	onInit: function(callback) {
        this.init_callback = callback;
    },

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    }

});