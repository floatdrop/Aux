var cls = require("./lib/class"),
	Player = require("./entities/player"),
	Bullet = require("./entities/bullet"),
	log = require('./log'),
	WorldMap = require("./worldmap"),
	_ = require("underscore"),
	Box2D = require('./lib/box2d'),
	EntityFactory = require('./entityFactory');

var b2Vec2 = Box2D.Common.Math.b2Vec2;
if (process.env.NodeTimeKey) {
	require('nodetime').profile({
		accountKey: process.env.NodeTimeKey,
		appName: 'Aux'
	});
}
var logger = require("./gamelogger");

module.exports = cls.Class.extend({
	init: function (ups, map_filepath, engine, server, debug) {
		this.ups = ups;
		this.engine = engine;
		this.server = server;
		this.debug = debug;
		this.map = new WorldMap(map_filepath);
		this.engine.addEntities(this.map.entities);
		this.onPlayerConnect(this.playerConnect);
		this.onPlayerDisconnect(this.playerDisconnect);
		this.playersCount = 0;
	},
	playerConnect: function (connection) {
		if (this.playersCount === 0) {
			logger.updateDate();
		}
		this.playersCount += 1;
		require('nodetime').metric("World", "Players", this.playersCount, "", "set");
		var self = this;
		var player = new Player(connection, connection.id, this.debug);
		var spawnPosition = this.map.getSpawnPoint();
		player.setPosition(spawnPosition.x, spawnPosition.y);
		log.info("Player " + player.id + " connected");
		logger.write(player.connection, new Buffer(JSON.stringify(player.getPosition())), logger.MsgType.Connect);
		connection.onClose(function () {
			self.disconnect_callback(player);
		});

		log.info("Send Welcome to player " + player.id);
		player.send(Constants.Types.Messages.Welcome, player.getBaseState());

		player.onShoot(function () {
			if (player.bullets > 0) {
				var bullet = EntityFactory.createBullet(player);
				self.engine.addEntity(bullet);
				bullet.onRemove(self.engine.removeEntity.bind(self.engine));
				var angle = player.getAngle() * Math.PI / 180,
					x = Math.cos(angle) * Bullet.SpeedRatio,
					y = -Math.sin(angle) * Bullet.SpeedRatio;
				bullet.body.SetAngle(angle);
				bullet.body.ApplyImpulse(new b2Vec2(x, y), new b2Vec2(0, 0));
				player.bullets -= 1;
			}
		});

		this.engine.addEntity(player);
	},
	playerDisconnect: function (player) {
		this.playersCount -= 1;
		require('nodetime').metric("World", "Players", this.playersCount, "", "set");
		logger.write(player.connection, new Buffer(player.id), logger.MsgType.Disconnect);
		this.engine.removeEntity(player.id);
	},
	updateWorld: function () {
		var self = this;
		_.each(self.engine.getEntities(), function (entity) {
			entity.update();
		});
	},
	updatePlayers: function () {
		var self = this;
		var players = self.engine.getEntities(function (entity) {
			return entity instanceof Player;
		});
		_.each(players, function (player) {
			var entities = self.engine.getEntities(function (entity) { 
				return self.engine.isVisible(player, entity) && 
				(entity instanceof Player || entity instanceof Bullet); 
			});
			player.sendEntities(entities);
		});
	},
	run: function () {
		var ticks = 0;
		var start = new Date() / 1000;
		var self = this;
		this.worldUpdater = setInterval(function () {
			ticks += 1;
			self.engine.tick(1000.0 / self.ups);
			self.updateWorld();
			self.updatePlayers();
		}, 1000 / this.ups);
		setInterval(function () {
			var now = new Date() / 1000;
			require('nodetime').metric("World", "Players", self.playersCount, "", "set");
			require('nodetime').metric("World", "Ticks per second", ticks / (now - start), "ticks", "set");
		}, 5000);
		setTimeout(function () {
			self.ready_callback();
		}, 1000 / this.ups);
	},
	stop: function () {
		clearInterval(this.worldUpdater);
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