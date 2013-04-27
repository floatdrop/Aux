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
		player.sendEntities(self.engine.dumpEntities(function (entity) {
			return entity.isStatic;
		}));

		this.engine.addEntity(player);
	},
	playerDisconnect: function (id) {
		this.engine.removeEntity(id);
	},
	updateWorld: function () {
		var self = this;
		_.each(self.getEntities(), function (entity) {
			entity.update();
		});
	},
	processEntities: function (player, entities) {
		var self = this;
		var result = { new: [], old: [] }
		_.each(entities, function (entity) {
			result[self.engine.isVisible(player, entity) ? "new" : "old"].push(entity);
		});
	},
	updatePlayers: function () {
		var self = this;
		var players = self.engine.dumpEntities(function (entity) {
			return entity instanceof Player;
		});
		var dynamicObjects = self.engine.dumpEntities(function (entity) {
			return !entity.isStatic;
		});
		_.each(players, function (players) {
			var entities = self.processEntities(player, dynamicObjects);
			if (entities.new) {
				player.sendEntities(entities.new);
			}
			if (entities.old) {
				player.sendRemoveList(entities.old);
			}
		});
	},
	run: function () {
		var self = this;
		setInterval(function () {
			self.engine.tick(1000.0 / self.ups);
			self.updateWorld();
			self.updatePlayers();
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