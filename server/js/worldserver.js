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
		this.onPlayerConnect(this.playerConnect);
		this.onPlayerDisconnect(this.playerDisconnect);
	},

	findPlayer: function(id) {
		return _.find(this.players, function(player) { return player.id == id; });
	},

	playerConnect: function(socket) {
		var self = this;
		var player = new Player(socket, socket.id);
		socket.on('disconnect', function() { self.disconnect_callback(player.id); });
		player.setPosition(1, 1);
		log.info("Player " + player.id + " connected");
		this.players.push(player);
        this.engine.addEntity(player);
    },

    playerDisconnect: function(id) {
    	var player = this.findPlayer(id);
		log.info("Player " + id + " disconnected");
		var index = this.players.indexOf(player);
		player.destruct();
		if (index !== -1) {
			log.debug("Found in players array in " + index + " position.");
			this.players.splice(index, 1);
		}
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
			self.engine.tick(1000.0 / self.ups);
			self.broadcast("entity_list", self.engine.dumpEntities());
		},	1000 / this.ups);
	},

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    },

    onPlayerDisconnect: function(callback) {
    	this.disconnect_callback = callback;
    }

});