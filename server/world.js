var Player = require("./entities/player"),
	Bullet = require("./entities/bullet"),
	WorldMap = require("./worldmap"),
	Box2D = require('./vendor/box2d'),
	EntityFactory = require('./entityFactory'),
	b2Vec2 = Box2D.Common.Math.b2Vec2,
	logger = require("./gamelogger");

module.exports = Class.extend({
	init: function (engine, server) {
		this.engine = engine;
		this.server = server;
		this.map = new WorldMap(config.server.map);
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
		log.metric("World", "Players", this.playersCount, "", "set");
		var self = this;
		var player = new Player(connection, connection.id);
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

		player.onRespawn(function () {
			player.health = Player.StandartHealth;
			player.bullets = Player.StandartBullets;
			player.animationType = "idle";
			var spawnPosition = self.map.getSpawnPoint();
			player.setPosition(spawnPosition.x, spawnPosition.y);
		});

		this.engine.addEntity(player);
	},
	playerDisconnect: function (player) {
		this.playersCount -= 1;
		log.metric("World", "Players", this.playersCount, "", "set");
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
			self.engine.tick(config.b2dengine.ticks);
			self.updateWorld();
			self.updatePlayers();
		}, config.b2dengine.ticks);
		setInterval(function () {
			var now = new Date() / 1000;
			log.metric("World", "Ticks per second", ticks / (now - start), "ticks", "set");
		}, 5000);
		setTimeout(function () {
			self.ready_callback();
		}, config.b2dengine.ticks);
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