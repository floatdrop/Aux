var cls = require("./lib/class"),
	_ = require("underscore"),
	Log = require("log"),
	async = require("async"),
	Player = require("./player"),
	Engine = require("./engine");

module.exports = World = cls.Class.extend({
	
	init: function() {
		var self = this;
		this.ups = 50;
		this.engine = new Engine();
		this.players = [];
		this.onPlayerConnect(function(socket) {
			var player = new Player(socket);
			self.players.push(player);
			socket.on('disconnect', function(){
				var index = self.players.indexOf(player);
				if (index)
					self.players.splice(index, 1);
			});
            self.engine.addEntity(player);
        });
	},

	broadcast: function (event, message) {
		async.each(this.players, function (player, callback) {
			player.socket.emit(event, message);
			callback(null);
		}, function (err) {})
	},

	run: function() {
		var self = this;
		setInterval(function () {
			self.engine.tick(1000 / self.ups);
			self.broadcast("entity_list", self.engine.dumpEntities());
		},	1000 / this.ups);
	},

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    }

});