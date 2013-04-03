var cls = require("./lib/class"),
	async = require("async"),
	_ = require('underscore'),
	Player = require("./player"),
	Engine = require("./engine"),
	Map = require("./map");

module.exports = cls.Class.extend({
	init: function (config) {
		this.ups = 50;
		this.engine = new Engine(config);
		this.map = new Map(config, this.engine);
		this.players = [];
		this.onPlayerConnect(this.playerConnect);
		this.onPlayerDisconnect(this.playerDisconnect);
	},

	findPlayer: function (id) {
		return _.find(this.players, function (player) { return player.id === id; });
	},

	removePlayer: function (id) {
		var index = this.players.indexOf(this.findPlayer(id));
		if (index !== -1) {
			this.players.splice(index, 1);
		}
	},

	playerConnect: function (socket) {
		var self = this,
			player = new Player(socket, socket.id, this.engine.b2w);
		self.map.sendMap(socket);
		global.log.info("Map send to " + socket.id);
		socket.on('disconnect', function () { self.disconnect_callback(player.id); });
		player.setPosition(1, 1);
		global.log.info("Player " + player.id + " connected");
		this.players.push(player);
		this.engine.addEntity(player);
	},

	playerDisconnect: function (id) {
		var player = this.findPlayer(id);
		if (player) {
			global.log.info("Player " + player.id + " disconnected");
			this.removePlayer(player.id);
			this.engine.removeEntity(player);
		}
	},

	broadcast: function (event, message) {
		async.each(this.players, function (player, callback) {
			player.socket.emit(event, message);
			callback(null);
		}, function () {});
	},

	run: function (callback) {
		var self = this;
		setInterval(function () {
			self.engine.tick(1000.0 / self.ups);
			self.broadcast("entity_list", self.engine.dumpEntities());
		},	1000 / this.ups);
		if (callback) {
			callback(null, this);
		}
	},

	onPlayerConnect: function (callback) {
		this.connect_callback = callback;
	},

	onPlayerDisconnect: function (callback) {
		this.disconnect_callback = callback;
	}

});