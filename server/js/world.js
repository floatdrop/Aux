var cls = require("./lib/class"),
	Player = require("./entities/player"),
	log = require('./log'),
	WorldMap = require("./worldmap");

module.exports = cls.Class.extend({
	init: function (ups, map_filepath, engine, server) {
		this.ups = ups;
		this.engine = engine;
		this.server = server;
		this.map = new WorldMap(map_filepath);
		this.engine.addEntities(this.map.entities);
		this.onPlayerConnect(this.playerConnect);
		this.onPlayerDisconnect(this.playerDisconnect);
	},
	playerConnect: function (connection) {
		var self = this;
		var player = new Player(connection, connection.id);
		player.setPosition(100, 100);
		log.info("Player " + player.id + " connected");

		connection.onClose(function () {
			self.disconnect_callback(player.id);
		});

		log.info("Send Map to player " + player.id);
		player.sendMap(this.map);

		log.info("Send Welcome to player " + player.id);
		player.send(Constants.Types.Messages.Welcome, player.getBaseState());

		log.info("Send Static objects to player " + player.id);
		player.send(Constants.Types.Messages.EntityList,
		self.engine.dumpEntities(function (entity) {
			return entity.isStatic;
		}));

		this.engine.addEntity(player);
	},
	playerDisconnect: function (id) {
		this.engine.removeEntity(id);
	},
	run: function () {
		var self = this;
		setInterval(function () {
			self.engine.tick(1000.0 / self.ups);
			var dynamicObjects = {
				t: Constants.Types.Messages.EntityList,
				d: self.engine.dumpEntities(function (entity) {
					return !entity.isStatic;
				})
			};
			self.server.broadcast(dynamicObjects);
		}, 1000 / this.ups);
		setTimeout(function () {
			self.ready_callback();
		}, 1000 / this.ups);
	},
	onPlayerConnect: function (callback) {
		this.connect_callback = callback;
	},
	onPlayerDisconnect: function (callback) {
		this.disconnect_callback = callback;
	},
	onReady: function (callback) {
		this.ready_callback = callback;
	},
	ready_callback: function () {
		log.info("World started");
	}
});