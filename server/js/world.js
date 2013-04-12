var cls = require("./lib/class"),
	Player = require("./entities/player"),
	log = require('./log'),
	WorldMap = require("./worldmap");

module.exports = cls.Class.extend({
	init: function (ups, map_filepath, engine, server) {
		this.ups = ups;
		this.engine = engine;
		this.server = server;
		this.map_filepath = map_filepath;
		this.onPlayerConnect(this.playerConnect);
		this.onPlayerDisconnect(this.playerDisconnect);
	},
	playerConnect: function (connection) {
		var self = this,
			player = new Player(connection, connection.id);
		connection.onClose(function () {
			self.disconnect_callback(player.id);
		});
		player.setPosition(1, 1);
		log.info("Player " + player.id + " connected");
		self.map.sendMap(player);
		this.engine.addEntity(player);
	},
	playerDisconnect: function (id) {
		this.engine.removeEntity(id);
	},
	run: function () {
		var self = this;
		try {
			this.map = new WorldMap(this.map_filepath, this.engine);
		} catch (err) {
			this.exception_callback(err);
			return;
		}
		setInterval(function () {
			self.engine.tick(1000.0 / self.ups);
			self.server.broadcast({t: Constants.Types.Messages.EntityList, d: self.engine.dumpEntities()});
		}, 1000 / this.ups);
	},
	onException: function (handler) {
		this.exception_callback = handler;
	},
	onPlayerConnect: function (callback) {
		this.connect_callback = callback;
	},
	onPlayerDisconnect: function (callback) {
		this.disconnect_callback = callback;
	}
});